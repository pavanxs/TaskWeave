import { NextRequest, NextResponse } from 'next/server';
import { WorkflowExecutor } from '@/lib/services/workflow-executor';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, workflows } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';

export async function POST(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { workflowId, triggerData, executionMode } = await request.json();

		if (!workflowId) {
			return NextResponse.json(
				{
					error: 'Missing required field: workflowId',
				},
				{ status: 400 }
			);
		}

		// Get user record with API keys
		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]) {
			return NextResponse.json(
				{
					error: 'User not found',
				},
				{ status: 404 }
			);
		}

		// Check if user has required API keys
		if (!userRecord[0].noditApiKey || !userRecord[0].openaiApiKey) {
			return NextResponse.json(
				{
					error:
						'API keys not configured. Please configure Nodit and OpenAI API keys.',
				},
				{ status: 400 }
			);
		}

		// Verify workflow ownership
		const workflow = await db
			.select()
			.from(workflows)
			.where(
				and(
					eq(workflows.id, workflowId),
					eq(workflows.userId, userRecord[0].id)
				)
			)
			.limit(1);

		if (!workflow[0]) {
			return NextResponse.json(
				{
					error: 'Workflow not found or access denied',
				},
				{ status: 404 }
			);
		}

		// Check if workflow is published (for automatic execution)
		if (executionMode !== 'test' && !workflow[0].publish) {
			return NextResponse.json(
				{
					error: 'Workflow must be published for execution',
				},
				{ status: 400 }
			);
		}

		// Check credits for non-unlimited users
		if (
			userRecord[0].tier !== 'UNLIMITED' &&
			(userRecord[0].credits || 0) <= 0
		) {
			return NextResponse.json(
				{
					error:
						'Insufficient credits. Please upgrade your plan or purchase more credits.',
				},
				{ status: 402 }
			);
		}

		// Decrypt API keys
		const noditApiKey = CryptoJS.AES.decrypt(
			userRecord[0].noditApiKey,
			ENCRYPTION_KEY
		).toString(CryptoJS.enc.Utf8);

		const openaiApiKey = CryptoJS.AES.decrypt(
			userRecord[0].openaiApiKey,
			ENCRYPTION_KEY
		).toString(CryptoJS.enc.Utf8);

		// Create workflow executor
		const executor = new WorkflowExecutor(
			noditApiKey,
			openaiApiKey,
			ENCRYPTION_KEY
		);

		// Execute workflow
		const startTime = Date.now();

		if (executionMode === 'test') {
			// Test mode - don't deduct credits, add test context
			const testTriggerData = {
				...triggerData,
				__testMode: true,
				__userId: user.id,
			};

			await executor.executeWorkflow(workflowId, testTriggerData);
		} else {
			// Production mode
			await executor.executeWorkflow(workflowId, triggerData);
		}

		const executionTime = Date.now() - startTime;

		return NextResponse.json({
			success: true,
			workflowId,
			executionTime,
			mode: executionMode || 'production',
			message: 'Workflow executed successfully',
		});
	} catch (error) {
		console.error('Workflow execution failed:', error);
		return NextResponse.json(
			{
				error: 'Workflow execution failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action');
		const workflowId = searchParams.get('workflowId');

		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]) {
			return NextResponse.json(
				{
					error: 'User not found',
				},
				{ status: 404 }
			);
		}

		switch (action) {
			case 'status':
				if (!workflowId) {
					return NextResponse.json(
						{
							error: 'Missing workflowId parameter',
						},
						{ status: 400 }
					);
				}

				const workflow = await db
					.select()
					.from(workflows)
					.where(
						and(
							eq(workflows.id, workflowId),
							eq(workflows.userId, userRecord[0].id)
						)
					)
					.limit(1);

				if (!workflow[0]) {
					return NextResponse.json(
						{
							error: 'Workflow not found',
						},
						{ status: 404 }
					);
				}

				return NextResponse.json({
					success: true,
					data: {
						id: workflow[0].id,
						name: workflow[0].name,
						published: workflow[0].publish,
						flowPath: workflow[0].flowPath,
						hasNoditBlocks: !!workflow[0].noditBlocks,
						hasAIBlocks: !!workflow[0].aiBlocks,
						hasAIDecisionRules: !!workflow[0].aiDecisionRules,
						networkIds: workflow[0].networkIds,
					},
				});

			case 'validate':
				if (!workflowId) {
					return NextResponse.json(
						{
							error: 'Missing workflowId parameter',
						},
						{ status: 400 }
					);
				}

				const validationWorkflow = await db
					.select()
					.from(workflows)
					.where(
						and(
							eq(workflows.id, workflowId),
							eq(workflows.userId, userRecord[0].id)
						)
					)
					.limit(1);

				if (!validationWorkflow[0]) {
					return NextResponse.json(
						{
							error: 'Workflow not found',
						},
						{ status: 404 }
					);
				}

				// Validate workflow configuration
				const validationResults = {
					hasValidFlowPath: !!(
						validationWorkflow[0].flowPath &&
						validationWorkflow[0].flowPath.length > 0
					),
					hasRequiredApiKeys: !!(
						userRecord[0].noditApiKey && userRecord[0].openaiApiKey
					),
					hasValidBlocks: true, // Would need deeper validation
					canExecute: false,
				};

				validationResults.canExecute =
					validationResults.hasValidFlowPath &&
					validationResults.hasRequiredApiKeys &&
					validationResults.hasValidBlocks;

				return NextResponse.json({
					success: true,
					data: validationResults,
				});

			case 'continuation':
				if (!workflowId) {
					return NextResponse.json(
						{
							error: 'Missing workflowId parameter',
						},
						{ status: 400 }
					);
				}

				// Execute workflow continuation (typically called by cron jobs)
				const continuationWorkflow = await db
					.select()
					.from(workflows)
					.where(eq(workflows.id, workflowId))
					.limit(1);

				if (!continuationWorkflow[0]) {
					return NextResponse.json(
						{
							error: 'Workflow not found for continuation',
						},
						{ status: 404 }
					);
				}

				// Get workflow owner's API keys
				const workflowOwner = await db
					.select()
					.from(users)
					.where(eq(users.id, continuationWorkflow[0].userId))
					.limit(1);

				if (
					!workflowOwner[0] ||
					!workflowOwner[0].noditApiKey ||
					!workflowOwner[0].openaiApiKey
				) {
					return NextResponse.json(
						{
							error: 'Workflow owner API keys not available',
						},
						{ status: 400 }
					);
				}

				// Decrypt API keys
				const ownerNoditApiKey = CryptoJS.AES.decrypt(
					workflowOwner[0].noditApiKey,
					ENCRYPTION_KEY
				).toString(CryptoJS.enc.Utf8);

				const ownerOpenaiApiKey = CryptoJS.AES.decrypt(
					workflowOwner[0].openaiApiKey,
					ENCRYPTION_KEY
				).toString(CryptoJS.enc.Utf8);

				// Execute continuation
				const continuationExecutor = new WorkflowExecutor(
					ownerNoditApiKey,
					ownerOpenaiApiKey,
					ENCRYPTION_KEY
				);

				await continuationExecutor.executeContinuation(workflowId);

				return NextResponse.json({
					success: true,
					message: 'Workflow continuation executed successfully',
				});

			default:
				return NextResponse.json(
					{
						error: 'Invalid action. Supported: status, validate, continuation',
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('Workflow API error:', error);
		return NextResponse.json(
			{
				error: 'Workflow API error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
