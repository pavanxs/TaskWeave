import { NextRequest, NextResponse } from 'next/server';
import {
	noditBlockCategories,
	aiBlockCategories,
	allBlockCategories,
	getBlockById,
	getBlocksByNetwork,
	getBlocksByType,
} from '@/lib/blocks/nodit-blocks';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
	try {
		const user = await currentUser();
		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action');

		switch (action) {
			case 'categories':
				// Return all block categories
				return NextResponse.json({
					success: true,
					data: {
						nodit: noditBlockCategories,
						ai: aiBlockCategories,
						all: allBlockCategories,
					},
				});

			case 'by-type':
				const blockType = searchParams.get('type');
				if (!blockType) {
					return NextResponse.json(
						{
							error: 'Missing type parameter',
						},
						{ status: 400 }
					);
				}

				const blocksByType = getBlocksByType(blockType);
				return NextResponse.json({
					success: true,
					data: blocksByType,
				});

			case 'by-network':
				const networkId = searchParams.get('network');
				if (!networkId) {
					return NextResponse.json(
						{
							error: 'Missing network parameter',
						},
						{ status: 400 }
					);
				}

				const blocksByNetwork = getBlocksByNetwork(networkId);
				return NextResponse.json({
					success: true,
					data: blocksByNetwork,
				});

			case 'by-id':
				const blockId = searchParams.get('id');
				if (!blockId) {
					return NextResponse.json(
						{
							error: 'Missing id parameter',
						},
						{ status: 400 }
					);
				}

				const block = getBlockById(blockId);
				if (!block) {
					return NextResponse.json(
						{
							error: 'Block not found',
						},
						{ status: 404 }
					);
				}

				return NextResponse.json({
					success: true,
					data: block,
				});

			case 'available':
				// Return blocks available to the user based on their plan and API keys
				if (!user) {
					// Return all blocks but mark availability
					return NextResponse.json({
						success: true,
						data: {
							nodit: noditBlockCategories,
							ai: aiBlockCategories,
							availability: {
								nodit: false,
								ai: false,
								reason: 'Authentication required',
							},
						},
					});
				}

				// Get user's configuration
				const userRecord = await db
					.select()
					.from(users)
					.where(eq(users.clerkId, user.id))
					.limit(1);

				const hasNoditKey = !!userRecord[0]?.noditApiKey;
				const hasOpenAIKey = !!userRecord[0]?.openaiApiKey;
				const userTier = userRecord[0]?.tier || 'FREE';

				// Determine block availability based on user's configuration
				const availability = {
					nodit: hasNoditKey,
					ai: hasOpenAIKey,
					tier: userTier,
					credits: userRecord[0]?.credits || 0,
					limitations: {
						freeBlocks: userTier === 'FREE' ? ['triggers', 'storage'] : null,
						aiModelAccess:
							userTier === 'FREE'
								? ['gpt-3.5-turbo']
								: userTier === 'PRO'
								? ['gpt-3.5-turbo', 'gpt-4']
								: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
					},
				};

				return NextResponse.json({
					success: true,
					data: {
						nodit: noditBlockCategories,
						ai: aiBlockCategories,
						availability,
					},
				});

			case 'networks':
				// Return supported networks
				const supportedNetworks = [
					{
						id: 'ethereum',
						name: 'Ethereum',
						chainId: 1,
						rpcUrl: 'https://eth-mainnet.nodit.io',
						explorerUrl: 'https://etherscan.io',
						nativeCurrency: 'ETH',
					},
					{
						id: 'base',
						name: 'Base',
						chainId: 8453,
						rpcUrl: 'https://base-mainnet.nodit.io',
						explorerUrl: 'https://basescan.org',
						nativeCurrency: 'ETH',
					},
					{
						id: 'arbitrum',
						name: 'Arbitrum One',
						chainId: 42161,
						rpcUrl: 'https://arb-mainnet.nodit.io',
						explorerUrl: 'https://arbiscan.io',
						nativeCurrency: 'ETH',
					},
					{
						id: 'polygon',
						name: 'Polygon',
						chainId: 137,
						rpcUrl: 'https://polygon-mainnet.nodit.io',
						explorerUrl: 'https://polygonscan.com',
						nativeCurrency: 'MATIC',
					},
					{
						id: 'optimism',
						name: 'Optimism',
						chainId: 10,
						rpcUrl: 'https://opt-mainnet.nodit.io',
						explorerUrl: 'https://optimistic.etherscan.io',
						nativeCurrency: 'ETH',
					},
				];

				return NextResponse.json({
					success: true,
					data: supportedNetworks,
				});

			case 'templates':
				// Return pre-built workflow templates
				const templates = [
					{
						id: 'price-alert-basic',
						name: 'Basic Price Alert',
						description:
							'Monitor token price and send notification when threshold is reached',
						category: 'monitoring',
						blocks: ['price-monitor', 'ai-decision-maker', 'discord'],
						networks: ['ethereum'],
						difficulty: 'beginner',
					},
					{
						id: 'portfolio-rebalance',
						name: 'AI Portfolio Rebalancing',
						description:
							'Analyze portfolio with AI and execute rebalancing trades',
						category: 'trading',
						blocks: [
							'portfolio-analyzer',
							'ai-portfolio-analyst',
							'ai-decision-maker',
							'token-transfer',
						],
						networks: ['ethereum', 'base'],
						difficulty: 'advanced',
					},
					{
						id: 'risk-monitoring',
						name: 'Risk Monitoring System',
						description: 'Monitor wallet transactions and assess risk with AI',
						category: 'security',
						blocks: [
							'transaction-monitor',
							'ai-risk-assessor',
							'ai-decision-maker',
							'slack',
						],
						networks: ['ethereum', 'arbitrum', 'polygon'],
						difficulty: 'intermediate',
					},
					{
						id: 'nft-flip-detector',
						name: 'NFT Flip Opportunity Detector',
						description: 'Monitor NFT transfers and analyze flip opportunities',
						category: 'nft',
						blocks: [
							'nft-transfer-monitor',
							'ai-market-sentiment',
							'ai-trading-signal',
							'discord',
						],
						networks: ['ethereum'],
						difficulty: 'intermediate',
					},
				];

				return NextResponse.json({
					success: true,
					data: templates,
				});

			default:
				return NextResponse.json(
					{
						error:
							'Invalid action. Supported: categories, by-type, by-network, by-id, available, networks, templates',
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('Blocks API error:', error);
		return NextResponse.json(
			{
				error: 'Blocks API error',
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

		const { action, data } = await request.json();

		switch (action) {
			case 'validate-configuration':
				// Validate block configuration before saving to workflow
				const { blockId, parameters, networkId } = data;

				if (!blockId) {
					return NextResponse.json(
						{
							error: 'Missing blockId',
						},
						{ status: 400 }
					);
				}

				const block = getBlockById(blockId);
				if (!block) {
					return NextResponse.json(
						{
							error: 'Block not found',
						},
						{ status: 404 }
					);
				}

				// Validate required parameters
				const validation = {
					valid: true,
					errors: [] as string[],
					warnings: [] as string[],
				};

				for (const [paramName, paramConfig] of Object.entries(
					block.parameters
				)) {
					const paramValue = parameters?.[paramName];

					if (
						paramConfig.required &&
						(paramValue === undefined ||
							paramValue === null ||
							paramValue === '')
					) {
						validation.valid = false;
						validation.errors.push(`Parameter '${paramName}' is required`);
						continue;
					}

					if (paramValue !== undefined && paramConfig.validation) {
						const { min, max, pattern } = paramConfig.validation;

						if (
							min !== undefined &&
							typeof paramValue === 'number' &&
							paramValue < min
						) {
							validation.valid = false;
							validation.errors.push(
								`Parameter '${paramName}' must be at least ${min}`
							);
						}

						if (
							max !== undefined &&
							typeof paramValue === 'number' &&
							paramValue > max
						) {
							validation.valid = false;
							validation.errors.push(
								`Parameter '${paramName}' must be at most ${max}`
							);
						}

						if (
							pattern &&
							typeof paramValue === 'string' &&
							!new RegExp(pattern).test(paramValue)
						) {
							validation.valid = false;
							validation.errors.push(
								`Parameter '${paramName}' format is invalid`
							);
						}
					}
				}

				// Check network compatibility for Nodit blocks
				if (
					'networks' in block &&
					networkId &&
					!block.networks.includes(networkId)
				) {
					validation.valid = false;
					validation.errors.push(
						`Block '${blockId}' is not supported on network '${networkId}'`
					);
				}

				return NextResponse.json({
					success: true,
					data: validation,
				});

			default:
				return NextResponse.json(
					{
						error: 'Invalid action. Supported: validate-configuration',
					},
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('Blocks API POST error:', error);
		return NextResponse.json(
			{
				error: 'Blocks API error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
