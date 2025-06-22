import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';

export async function POST(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { noditApiKey, openaiApiKey, tier } = await request.json();

		if (!noditApiKey || !openaiApiKey) {
			return NextResponse.json(
				{
					error: 'Both Nodit and OpenAI API keys are required',
				},
				{ status: 400 }
			);
		}

		// Encrypt API keys
		const encryptedNoditKey = CryptoJS.AES.encrypt(
			noditApiKey,
			ENCRYPTION_KEY
		).toString();
		const encryptedOpenAIKey = CryptoJS.AES.encrypt(
			openaiApiKey,
			ENCRYPTION_KEY
		).toString();

		// Check if user exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (existingUser.length > 0) {
			// Update existing user
			await db
				.update(users)
				.set({
					noditApiKey: encryptedNoditKey,
					openaiApiKey: encryptedOpenAIKey,
					tier: tier || existingUser[0].tier,
					updatedAt: new Date(),
				})
				.where(eq(users.clerkId, user.id));
		} else {
			// Create new user
			await db.insert(users).values({
				clerkId: user.id,
				email: user.primaryEmailAddress?.emailAddress || '',
				name: user.fullName || user.firstName || 'User',
				noditApiKey: encryptedNoditKey,
				openaiApiKey: encryptedOpenAIKey,
				tier: tier || 'FREE',
				credits: tier === 'UNLIMITED' ? 999999 : tier === 'PRO' ? 1000 : 100,
			});
		}

		return NextResponse.json({
			success: true,
			message: 'API keys configured successfully',
		});
	} catch (error) {
		console.error('User configuration failed:', error);
		return NextResponse.json(
			{
				error: 'Configuration failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { credits, tier } = await request.json();

		await db
			.update(users)
			.set({
				credits: credits,
				tier: tier,
				updatedAt: new Date(),
			})
			.where(eq(users.clerkId, user.id));

		return NextResponse.json({
			success: true,
			message: 'User configuration updated successfully',
		});
	} catch (error) {
		console.error('User configuration update failed:', error);
		return NextResponse.json(
			{
				error: 'Configuration update failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
