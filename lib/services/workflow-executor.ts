import { NoditMCPClient } from './nodit-mcp-client';
import { OpenAIClient } from './openai-client';
import { db } from '../db';
import {
	workflows,
	blockchainEvents,
	users,
	aiExecutionLogs,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

export interface WorkflowExecutionContext {
	triggerData?: Record<string, unknown>;
	results: Record<string, Record<string, unknown>>;
	userPreferences?: Record<string, unknown>;
	networkData?: Record<string, unknown>;
}

export interface BlockExecutionResult {
	success: boolean;
	data?: Record<string, unknown>;
	error?: string;
	nextBlocks?: string[];
	shouldStop?: boolean;
}

export class WorkflowExecutor {
	private noditClient: NoditMCPClient;
	private aiClient: OpenAIClient;
	private encryptionKey: string;

	constructor(
		noditApiKey: string,
		openaiApiKey: string,
		encryptionKey: string
	) {
		this.noditClient = new NoditMCPClient(noditApiKey);
		this.aiClient = new OpenAIClient(openaiApiKey);
		this.encryptionKey = encryptionKey;
	}

	// Main workflow execution method
	async executeWorkflow(
		workflowId: string,
		triggerData?: Record<string, unknown>
	): Promise<void> {
		const startTime = Date.now();

		try {
			// Get workflow and user data
			const workflow = await this.getWorkflowById(workflowId);
			if (!workflow || !workflow.publish) {
				throw new Error('Workflow not found or not published');
			}

			const user = await this.getUserById(workflow.userId);
			if (!user) {
				throw new Error('User not found');
			}

			// Check credits
			if (user.tier !== 'UNLIMITED' && (user.credits || 0) <= 0) {
				throw new Error('Insufficient credits');
			}

			// Initialize execution context
			const context: WorkflowExecutionContext = {
				triggerData,
				results: {},
				userPreferences: user,
				networkData: {},
			};

			// Execute workflow path
			const flowPath = workflow.flowPath || [];
			await this.executeFlowPath(workflow, flowPath, context);

			// Deduct credit if not unlimited
			if (user.tier !== 'UNLIMITED') {
				await db
					.update(users)
					.set({ credits: (user.credits || 0) - 1 })
					.where(eq(users.id, user.id));
			}

			console.log(
				`Workflow ${workflowId} executed successfully in ${
					Date.now() - startTime
				}ms`
			);
		} catch (error) {
			console.error(`Workflow execution failed for ${workflowId}:`, error);
			throw error;
		}
	}

	// Execute a flow path (sequence of blocks)
	private async executeFlowPath(
		workflow: Record<string, unknown>,
		flowPath: string[],
		context: WorkflowExecutionContext
	): Promise<void> {
		for (let i = 0; i < flowPath.length; i++) {
			const blockId = flowPath[i];

			try {
				const result = await this.executeBlock(blockId, workflow, context);

				if (!result.success) {
					console.error(`Block ${blockId} failed:`, result.error);
					// Continue execution unless it's a critical failure
					if (result.shouldStop) break;
					continue;
				}

				// Store result in context
				context.results[blockId] = result.data || {};

				// Handle special blocks
				if (blockId === 'wait') {
					// Schedule continuation with remaining path
					const remainingPath = flowPath.slice(i + 1);
					if (remainingPath.length > 0) {
						await this.scheduleContinuation(
							workflow.id as string,
							remainingPath
						);
					}
					break;
				}

				// Handle AI decision blocks
				if (result.nextBlocks && result.nextBlocks.length > 0) {
					// Execute next blocks based on AI decision
					await this.executeFlowPath(workflow, result.nextBlocks, context);
				}
			} catch (error) {
				console.error(`Error executing block ${blockId}:`, error);
				// Log error but continue with next block
				context.results[blockId] = {
					error: error instanceof Error ? error.message : 'Unknown error',
				};
			}
		}
	}

	// Execute individual block based on type
	private async executeBlock(
		blockId: string,
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		// Determine block type and configuration
		const noditBlocks =
			(workflow.noditBlocks as Record<string, unknown>[]) || [];
		const aiBlocks = (workflow.aiBlocks as Record<string, unknown>[]) || [];
		const aiDecisionRules =
			(workflow.aiDecisionRules as Record<string, unknown>[]) || [];

		const noditBlock = noditBlocks.find((b) => b.blockId === blockId);
		const aiBlock = aiBlocks.find((b) => b.blockId === blockId);
		const aiDecisionRule = aiDecisionRules.find((r) => r.blockId === blockId);

		if (noditBlock) {
			return await this.executeNoditBlock(noditBlock, workflow, context);
		} else if (aiBlock) {
			return await this.executeAIBlock(aiBlock, workflow, context);
		} else if (aiDecisionRule) {
			return await this.executeAIDecision(aiDecisionRule, workflow, context);
		} else {
			return await this.executeTraditionalBlock(blockId, workflow, context);
		}
	}

	// Execute Nodit MCP block
	private async executeNoditBlock(
		noditBlock: Record<string, unknown>,
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		try {
			const resolvedParams = this.resolveParameters(
				noditBlock.parameters as Record<string, unknown>,
				context
			);

			const result = await this.noditClient.callApi(
				noditBlock.operationId as string,
				resolvedParams,
				noditBlock.networkId as string
			);

			// Log blockchain event
			await db.insert(blockchainEvents).values({
				workflowId: workflow.id as string,
				eventType: noditBlock.operationId as string,
				networkId: noditBlock.networkId as string,
				eventData: result,
				processed: true,
			});

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			console.error(`Nodit block execution failed:`, error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Execute AI block
	private async executeAIBlock(
		aiBlock: Record<string, unknown>,
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		const startTime = Date.now();

		try {
			const resolvedInputs = this.resolveParameters(
				{}, // AI blocks typically use template-based inputs
				context
			);

			const result = await this.aiClient.executeAIBlock(
				aiBlock as never, // Type assertion for complex type
				resolvedInputs,
				context.triggerData
			);

			// Log AI execution
			await db.insert(aiExecutionLogs).values({
				workflowId: workflow.id as string,
				blockId: aiBlock.blockId as string,
				modelUsed: (aiBlock.model as string) || 'gpt-4',
				executionTime: Date.now() - startTime,
				success: true,
				result: result,
			});

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			console.error(`AI block execution failed:`, error);

			// Log failed execution
			await db.insert(aiExecutionLogs).values({
				workflowId: workflow.id as string,
				blockId: aiBlock.blockId as string,
				modelUsed: (aiBlock.model as string) || 'gpt-4',
				executionTime: Date.now() - startTime,
				success: false,
				errorMessage: error instanceof Error ? error.message : 'Unknown error',
			});

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Execute AI decision block
	private async executeAIDecision(
		decisionRule: Record<string, unknown>,
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		try {
			const decision = await this.aiClient.makeDecision(
				decisionRule as never, // Type assertion for complex type
				context.triggerData || {},
				context.results
			);

			const nextBlocks = decision.decision
				? (decisionRule.trueFlowPath as string[])
				: (decisionRule.falseFlowPath as string[]);

			// Log AI decision
			await db.insert(aiExecutionLogs).values({
				workflowId: workflow.id as string,
				blockId: decisionRule.blockId as string,
				modelUsed: 'gpt-4',
				success: true,
				result: {
					decision: decision.decision,
					confidence: decision.confidence,
					reasoning: decision.reasoning,
				},
			});

			return {
				success: true,
				data: JSON.parse(JSON.stringify(decision)),
				nextBlocks,
			};
		} catch (error) {
			console.error(`AI decision execution failed:`, error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Execute traditional blocks (Discord, Slack, etc.)
	private async executeTraditionalBlock(
		blockId: string,
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		switch (blockId) {
			case 'discord':
				return await this.executeDiscordBlock(workflow, context);
			case 'slack':
				return await this.executeSlackBlock(workflow, context);
			case 'notion':
				return await this.executeNotionBlock(workflow, context);
			default:
				console.warn(`Unknown block type: ${blockId}`);
				return {
					success: false,
					error: `Unknown block type: ${blockId}`,
				};
		}
	}

	// Execute Discord notification block
	private async executeDiscordBlock(
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		try {
			// Mock Discord execution
			console.log('Executing Discord block:', {
				workflow: workflow.name,
				context: Object.keys(context.results),
			});

			return {
				success: true,
				data: { sent: true, platform: 'discord' },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Execute Slack notification block
	private async executeSlackBlock(
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		try {
			// Mock Slack execution
			console.log('Executing Slack block:', {
				workflow: workflow.name,
				context: Object.keys(context.results),
			});

			return {
				success: true,
				data: { sent: true, platform: 'slack' },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Execute Notion block
	private async executeNotionBlock(
		workflow: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Promise<BlockExecutionResult> {
		try {
			// Mock Notion execution
			console.log('Executing Notion block:', {
				workflow: workflow.name,
				context: Object.keys(context.results),
			});

			return {
				success: true,
				data: { created: true, platform: 'notion' },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Resolve parameters by interpolating context data
	private resolveParameters(
		parameters: Record<string, unknown>,
		context: WorkflowExecutionContext
	): Record<string, unknown> {
		const resolved: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(parameters)) {
			if (typeof value === 'string') {
				resolved[key] = this.interpolateTemplate(value, context);
			} else {
				resolved[key] = value;
			}
		}

		return resolved;
	}

	// Interpolate template strings with context data
	private interpolateTemplate(
		template: string,
		context: WorkflowExecutionContext
	): string {
		return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
			const pathParts = path.split('.');
			let value: unknown = context;

			for (const part of pathParts) {
				if (value && typeof value === 'object' && part in value) {
					value = (value as Record<string, unknown>)[part];
				} else {
					return match; // Return original if path not found
				}
			}

			return value !== undefined ? String(value) : match;
		});
	}

	// Schedule workflow continuation (for wait blocks or cron)
	private async scheduleContinuation(
		workflowId: string,
		remainingPath: string[]
	): Promise<void> {
		// In a real implementation, this would use a job queue or cron system
		console.log(`Scheduling continuation for workflow ${workflowId}:`, {
			remainingBlocks: remainingPath.length,
			nextBlock: remainingPath[0],
		});

		// Mock scheduling - in production, use a proper job queue
		setTimeout(async () => {
			try {
				await this.executeContinuation(workflowId);
			} catch (error) {
				console.error('Continuation execution failed:', error);
			}
		}, 5000); // 5 second delay for demo
	}

	// Get workflow by ID
	private async getWorkflowById(workflowId: string) {
		const result = await db
			.select()
			.from(workflows)
			.where(eq(workflows.id, workflowId))
			.limit(1);

		return result[0] || null;
	}

	// Get user by ID
	private async getUserById(userId: string) {
		const result = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		return result[0] || null;
	}

	// Decrypt encrypted data
	private decrypt(encryptedData: string): string {
		try {
			const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
			return bytes.toString(CryptoJS.enc.Utf8);
		} catch (error) {
			console.error('Decryption failed:', error);
			throw new Error('Failed to decrypt data');
		}
	}

	// Execute continuation of a workflow
	async executeContinuation(workflowId: string): Promise<void> {
		try {
			console.log(`Executing continuation for workflow ${workflowId}`);

			// In a real implementation, this would:
			// 1. Retrieve stored continuation state
			// 2. Resume execution from the stored point
			// 3. Execute remaining blocks

			// Mock continuation
			const workflow = await this.getWorkflowById(workflowId);
			if (!workflow) {
				throw new Error('Workflow not found for continuation');
			}

			// For demo purposes, just log the continuation
			console.log('Continuation executed successfully');
		} catch (error) {
			console.error('Continuation execution failed:', error);
			throw error;
		}
	}

	// Execute workflows triggered by external events
	async executeTriggeredWorkflows(
		triggerType: string,
		triggerData: Record<string, unknown>,
		networkId?: string
	): Promise<void> {
		try {
			// Find workflows matching the trigger
			const triggerWorkflows = await db
				.select()
				.from(workflows)
				.where(eq(workflows.triggerType, triggerType));

			console.log(
				`Found ${triggerWorkflows.length} workflows for trigger ${triggerType}`
			);

			// Execute each triggered workflow
			for (const workflow of triggerWorkflows) {
				if (!workflow.isActive || !workflow.publish) {
					continue;
				}

				// Check network compatibility if specified
				if (networkId && workflow.networkIds) {
					const supportedNetworks = workflow.networkIds as string[];
					if (!supportedNetworks.includes(networkId)) {
						continue;
					}
				}

				try {
					await this.executeWorkflow(workflow.id, triggerData);
				} catch (error) {
					console.error(
						`Failed to execute triggered workflow ${workflow.id}:`,
						error
					);
					// Continue with other workflows even if one fails
				}
			}
		} catch (error) {
			console.error('Error executing triggered workflows:', error);
			throw error;
		}
	}
}
