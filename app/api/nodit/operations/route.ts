import { NextRequest, NextResponse } from 'next/server';
import { NoditMCPClient } from '@/lib/services/nodit-mcp-client';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, noditConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key';

export async function POST(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { operationId, parameters, networkId } = await request.json();

		if (!operationId || !networkId) {
			return NextResponse.json(
				{
					error: 'Missing required fields: operationId, networkId',
				},
				{ status: 400 }
			);
		}

		// Get user's Nodit API key
		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]?.noditApiKey) {
			return NextResponse.json(
				{
					error: 'Nodit API key not configured',
				},
				{ status: 400 }
			);
		}

		// Decrypt API key
		const decryptedApiKey = CryptoJS.AES.decrypt(
			userRecord[0].noditApiKey,
			ENCRYPTION_KEY
		).toString(CryptoJS.enc.Utf8);

		// Create Nodit client
		const noditClient = new NoditMCPClient(decryptedApiKey);

		// Execute the operation
		const result = await noditClient.callApi(
			operationId,
			parameters,
			networkId
		);

		// Update connection last tested
		await db
			.update(noditConnections)
			.set({ lastTested: new Date() })
			.where(eq(noditConnections.userId, userRecord[0].id));

		return NextResponse.json({
			success: true,
			data: result,
			operationId,
			networkId,
		});
	} catch (error) {
		console.error('Nodit operation failed:', error);
		return NextResponse.json(
			{
				error: 'Operation failed',
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

		// Get user's Nodit API key
		const userRecord = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, user.id))
			.limit(1);

		if (!userRecord[0]?.noditApiKey) {
			return NextResponse.json(
				{
					error: 'Nodit API key not configured',
				},
				{ status: 400 }
			);
		}

		// Decrypt API key
		const decryptedApiKey = CryptoJS.AES.decrypt(
			userRecord[0].noditApiKey,
			ENCRYPTION_KEY
		).toString(CryptoJS.enc.Utf8);

		const noditClient = new NoditMCPClient(decryptedApiKey);

		switch (action) {
			case 'categories':
				const categories = await noditClient.listApiCategories();
				return NextResponse.json({ success: true, data: categories });

			case 'node-apis':
				const nodeApis = await noditClient.listNodeApis();
				return NextResponse.json({ success: true, data: nodeApis });

			case 'data-apis':
				const dataApis = await noditClient.listDataApis();
				return NextResponse.json({ success: true, data: dataApis });

			case 'spec':
				const operationId = searchParams.get('operationId');
				if (!operationId) {
					return NextResponse.json(
						{
							error: 'Missing operationId parameter',
						},
						{ status: 400 }
					);
				}
				const spec = await noditClient.getApiSpec(operationId);
				return NextResponse.json({ success: true, data: spec });

			default:
				return NextResponse.json(
					{
						error:
							'Invalid action. Supported: categories, node-apis, data-apis, spec',
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('Nodit API discovery failed:', error);
		return NextResponse.json(
			{
				error: 'API discovery failed',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
