import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient } from '@/lib/services/openai-client';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, aiExecutionLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';

export async function POST(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { blockConfig, inputData, contextData, operationType } =
			await request.json();

		if (!blockConfig || !operationType) {
			return NextResponse.json(
				{
					error: 'Missing required fields: blockConfig, operationType',
				},
				{ status: 400 }
			);
		}

		// Get user's OpenAI API key
		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]?.openaiApiKey) {
			return NextResponse.json(
				{
					error: 'OpenAI API key not configured',
				},
				{ status: 400 }
			);
		}

		// Decrypt API key
		const decryptedApiKey = CryptoJS.AES.decrypt(
			userRecord[0].openaiApiKey,
			ENCRYPTION_KEY
		).toString(CryptoJS.enc.Utf8);

		// Create OpenAI client
		const aiClient = new OpenAIClient(decryptedApiKey);
		const executionStart = Date.now();

		let result;

		switch (operationType) {
			case 'execute-block':
				result = await aiClient.executeAIBlock(
					blockConfig,
					inputData,
					contextData
				);
				break;

			case 'make-decision':
				result = await aiClient.makeDecision(
					blockConfig,
					contextData,
					inputData?.blockchainData
				);
				break;

			case 'analyze-portfolio':
				result = await aiClient.analyzePortfolio(
					inputData?.portfolioData,
					inputData?.marketData,
					inputData?.userPreferences
				);
				break;

			case 'generate-trading-signal':
				result = await aiClient.generateTradingSignal(
					inputData?.tokenData,
					inputData?.marketData,
					inputData?.userStrategy
				);
				break;

			case 'assess-risk':
				result = await aiClient.assessRisk(
					inputData?.transactionData,
					inputData?.walletData,
					inputData?.networkData
				);
				break;

			case 'process-query':
				result = await aiClient.processQuery(
					inputData?.query,
					inputData?.availableData,
					inputData?.supportedOperations
				);
				break;

			default:
				return NextResponse.json(
					{
						error: 'Invalid operation type',
					},
					{ status: 400 }
				);
		}

		const executionTime = Date.now() - executionStart;

		// Log AI execution
		await db.insert(aiExecutionLogs).values({
			workflowId: contextData?.workflowId || 'standalone',
			blockId: blockConfig?.blockId || 'api-call',
			modelUsed: blockConfig?.model || 'gpt-4',
			executionTime,
			success: true,
			result: JSON.parse(JSON.stringify(result)),
		});

		return NextResponse.json({
			success: true,
			data: result,
			operationType,
			executionTime,
		});
	} catch (error) {
		console.error('AI operation failed:', error);

		// Log failed execution
		try {
			const userRecord = await db
				.select()
				.from(users)
				.where(eq(users.clerkId, (await currentUser())?.id || ''))
				.limit(1);

			if (userRecord[0]) {
				await db.insert(aiExecutionLogs).values({
					workflowId: 'standalone',
					blockId: 'api-call',
					modelUsed: 'gpt-4',
					executionTime: 0,
					success: false,
					errorMessage:
						error instanceof Error ? error.message : 'Unknown error',
				});
			}
		} catch (logError) {
			console.error('Failed to log AI execution error:', logError);
		}

		return NextResponse.json(
			{
				error: 'AI operation failed',
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

		// Get user's OpenAI API key
		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]?.openaiApiKey) {
			return NextResponse.json(
				{
					error: 'OpenAI API key not configured',
				},
				{ status: 400 }
			);
		}

		// Decrypt API key
		const decryptedApiKey = CryptoJS.AES.decrypt(
			userRecord[0].openaiApiKey,
			ENCRYPTION_KEY
		).toString(CryptoJS.enc.Utf8);

		const aiClient = new OpenAIClient(decryptedApiKey);

		switch (action) {
			case 'models':
				const models = await aiClient.getAvailableModels();
				return NextResponse.json({ success: true, data: models });

			case 'execution-logs':
				const limit = parseInt(searchParams.get('limit') || '50');
				const logs = await db
					.select()
					.from(aiExecutionLogs)
					.where(
						eq(aiExecutionLogs.workflowId, searchParams.get('workflowId') || '')
					)
					.limit(limit)
					.orderBy(aiExecutionLogs.executedAt);

				return NextResponse.json({ success: true, data: logs });

			default:
				return NextResponse.json(
					{
						error: 'Invalid action. Supported: models, execution-logs',
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('AI API discovery failed:', error);
		return NextResponse.json(
			{
				error: 'AI API discovery failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
