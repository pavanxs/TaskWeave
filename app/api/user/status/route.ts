import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
	users,
	workflows,
	aiExecutionLogs,
	blockchainEvents,
} from '@/lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';

export async function GET() {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user record
		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]) {
			// User not yet configured
			return NextResponse.json({
				success: true,
				data: {
					configured: false,
					hasNoditApiKey: false,
					hasOpenaiApiKey: false,
					tier: 'FREE',
					credits: 0,
					workflowCount: 0,
					executionCount: 0,
					lastActivity: null,
				},
			});
		}

		const userData = userRecord[0];

		// Get workflow count
		const workflowCountResult = await db
			.select({ count: count() })
			.from(workflows)
			.where(eq(workflows.userId, userData.id));

		// Get execution count from AI logs
		const aiExecutionCountResult = await db
			.select({ count: count() })
			.from(aiExecutionLogs)
			.where(eq(aiExecutionLogs.success, true));

		// Get blockchain event count
		const blockchainEventCountResult = await db
			.select({ count: count() })
			.from(blockchainEvents)
			.where(eq(blockchainEvents.processed, true));

		// Get last activity
		const lastAiExecution = await db
			.select()
			.from(aiExecutionLogs)
			.orderBy(desc(aiExecutionLogs.executedAt))
			.limit(1);

		const lastBlockchainEvent = await db
			.select()
			.from(blockchainEvents)
			.orderBy(desc(blockchainEvents.createdAt))
			.limit(1);

		// Determine last activity
		let lastActivity = null;
		if (lastAiExecution[0] && lastBlockchainEvent[0]) {
			lastActivity =
				lastAiExecution[0].executedAt > lastBlockchainEvent[0].createdAt
					? lastAiExecution[0].executedAt
					: lastBlockchainEvent[0].createdAt;
		} else if (lastAiExecution[0]) {
			lastActivity = lastAiExecution[0].executedAt;
		} else if (lastBlockchainEvent[0]) {
			lastActivity = lastBlockchainEvent[0].createdAt;
		}

		const workflowCount = workflowCountResult[0]?.count || 0;
		const aiExecutionCount = aiExecutionCountResult[0]?.count || 0;
		const blockchainEventCount = blockchainEventCountResult[0]?.count || 0;

		return NextResponse.json({
			success: true,
			data: {
				configured: true,
				hasNoditApiKey: !!userData.noditApiKey,
				hasOpenaiApiKey: !!userData.openaiApiKey,
				tier: userData.tier,
				credits: userData.credits,
				email: userData.email,
				name: userData.name,
				createdAt: userData.createdAt,
				updatedAt: userData.updatedAt,
				workflowCount,
				aiExecutionCount,
				blockchainEventCount,
				totalExecutionCount: aiExecutionCount + blockchainEventCount,
				lastActivity,
				usage: {
					workflowsCreated: workflowCount,
					aiOperationsExecuted: aiExecutionCount,
					blockchainOperationsExecuted: blockchainEventCount,
					creditsUsed:
						(userData.tier === 'FREE'
							? 100
							: userData.tier === 'PRO'
							? 1000
							: 999999) - (userData.credits || 0),
				},
				limits: {
					maxWorkflows:
						userData.tier === 'FREE' ? 5 : userData.tier === 'PRO' ? 50 : 1000,
					maxExecutionsPerMonth:
						userData.tier === 'FREE'
							? 100
							: userData.tier === 'PRO'
							? 10000
							: 999999,
					aiModelAccess:
						userData.tier === 'FREE'
							? ['gpt-3.5-turbo']
							: userData.tier === 'PRO'
							? ['gpt-3.5-turbo', 'gpt-4']
							: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
					supportedNetworks:
						userData.tier === 'FREE'
							? ['ethereum']
							: userData.tier === 'PRO'
							? ['ethereum', 'base', 'arbitrum']
							: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
				},
			},
		});
	} catch (error) {
		console.error('User status check failed:', error);
		return NextResponse.json(
			{
				error: 'Status check failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { action } = await request.json();

		switch (action) {
			case 'reset-api-keys':
				// Clear API keys
				await db
					.update(users)
					.set({
						noditApiKey: null,
						openaiApiKey: null,
						updatedAt: new Date(),
					})
					.where(eq(users.clerkId, user.id));

				return NextResponse.json({
					success: true,
					message: 'API keys cleared successfully',
				});

			case 'delete-account':
				// Delete all user data (careful operation)
				const userRecord = await db
					.select()
					.from(users)
					.where(eq(users.clerkId, user.id))
					.limit(1);

				if (userRecord[0]) {
					// Delete workflows first (foreign key constraint)
					await db
						.delete(workflows)
						.where(eq(workflows.userId, userRecord[0].id));

					// Delete user record
					await db.delete(users).where(eq(users.id, userRecord[0].id));
				}

				return NextResponse.json({
					success: true,
					message: 'Account deleted successfully',
				});

			default:
				return NextResponse.json(
					{
						error: 'Invalid action',
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('User action failed:', error);
		return NextResponse.json(
			{
				error: 'Action failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
