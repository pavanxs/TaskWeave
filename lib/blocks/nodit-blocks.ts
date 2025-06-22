import {
	BarChart,
	Hash,
	Code,
	Database,
	Zap,
	Upload,
	Calculator,
	FileText,
	Search,
	AlertTriangle,
	Eye,
	Heart,
	Monitor,
	Package,
	GitBranch,
	Download,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NoditBlockData {
	id: string;
	label: string;
	icon: LucideIcon;
	type:
		| 'trigger'
		| 'action'
		| 'logic'
		| 'transform'
		| 'storage'
		| 'ai'
		| 'notification';
	category: string;
	noditOperation?: string;
	networks: string[];
	parameters: Record<string, NoditBlockParameter>;
	description: string;
	hasEmbeddedControls?: boolean;
	controlType?: 'button' | 'dropdown' | 'input' | 'switch' | 'complex';
}

export interface NoditBlockParameter {
	type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
	required: boolean;
	description: string;
	default?: string | number | boolean;
	options?: string[];
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
	};
}

export interface AIBlockData {
	id: string;
	label: string;
	icon: LucideIcon;
	type: 'ai';
	category: string;
	aiModel: string;
	systemPrompt: string;
	userPromptTemplate: string;
	parameters: Record<string, NoditBlockParameter>;
	description: string;
	outputFormat: 'text' | 'json' | 'structured';
	hasEmbeddedControls?: boolean;
	controlType?: 'button' | 'dropdown' | 'input' | 'switch' | 'complex';
}

// Real Nodit MCP Block Categories
export const noditBlockCategories = {
	triggers: [
		{
			id: 'price-monitor',
			label: 'Token Price Monitor',
			icon: BarChart,
			type: 'trigger',
			category: 'triggers',
			noditOperation: 'getTokenPrice',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description:
				'Monitor token price changes and trigger when threshold is reached',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				tokenAddress: {
					type: 'string',
					required: true,
					description: 'Contract address of the token to monitor',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				priceThreshold: {
					type: 'number',
					required: true,
					description: 'Price threshold in USD',
					validation: { min: 0 },
				},
				condition: {
					type: 'enum',
					required: true,
					description: 'Trigger condition',
					options: ['above', 'below', 'crosses'],
					default: 'above',
				},
				interval: {
					type: 'number',
					required: false,
					description: 'Check interval in minutes',
					default: 5,
					validation: { min: 1, max: 1440 },
				},
			},
		} as NoditBlockData,

		{
			id: 'transaction-monitor',
			label: 'Transaction Monitor',
			icon: Hash,
			type: 'trigger',
			category: 'triggers',
			noditOperation: 'getTokenTransfersByAccount',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Monitor wallet transactions and trigger on new activity',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				walletAddress: {
					type: 'string',
					required: true,
					description: 'Wallet address to monitor',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				minAmount: {
					type: 'number',
					required: false,
					description: 'Minimum transaction amount to trigger',
					validation: { min: 0 },
				},
				tokenFilter: {
					type: 'string',
					required: false,
					description: 'Filter by specific token address',
				},
				direction: {
					type: 'enum',
					required: false,
					description: 'Transaction direction',
					options: ['incoming', 'outgoing', 'both'],
					default: 'both',
				},
			},
		} as NoditBlockData,

		{
			id: 'contract-event-monitor',
			label: 'Smart Contract Event',
			icon: Code,
			type: 'trigger',
			category: 'triggers',
			noditOperation: 'watchContractEvents',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Monitor smart contract events and trigger on emission',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				contractAddress: {
					type: 'string',
					required: true,
					description: 'Smart contract address to monitor',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				eventName: {
					type: 'string',
					required: true,
					description: 'Event name to monitor (e.g., Transfer, Approval)',
				},
				eventFilters: {
					type: 'object',
					required: false,
					description: 'Event filter parameters (JSON format)',
				},
			},
		} as NoditBlockData,

		{
			id: 'wallet-balance-monitor',
			label: 'Wallet Balance Monitor',
			icon: Database,
			type: 'trigger',
			category: 'triggers',
			noditOperation: 'getNativeBalanceByAccount',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Monitor wallet balance changes and trigger on threshold',
			hasEmbeddedControls: true,
			controlType: 'input',
			parameters: {
				walletAddress: {
					type: 'string',
					required: true,
					description: 'Wallet address to monitor',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				balanceThreshold: {
					type: 'number',
					required: true,
					description: 'Balance threshold in native token',
					validation: { min: 0 },
				},
				direction: {
					type: 'enum',
					required: true,
					description: 'Balance change direction',
					options: ['increase', 'decrease', 'any'],
					default: 'any',
				},
			},
		} as NoditBlockData,

		{
			id: 'gas-price-monitor',
			label: 'Gas Price Monitor',
			icon: Zap,
			type: 'trigger',
			category: 'triggers',
			noditOperation: 'getGasPrice',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Monitor gas prices and trigger on threshold',
			hasEmbeddedControls: true,
			controlType: 'input',
			parameters: {
				gasThreshold: {
					type: 'number',
					required: true,
					description: 'Gas price threshold in Gwei',
					validation: { min: 1, max: 1000 },
				},
				condition: {
					type: 'enum',
					required: true,
					description: 'Trigger condition',
					options: ['above', 'below'],
					default: 'below',
				},
			},
		} as NoditBlockData,

		{
			id: 'nft-transfer-monitor',
			label: 'NFT Transfer Monitor',
			icon: Package,
			type: 'trigger',
			category: 'triggers',
			noditOperation: 'getNftTransfersByAccount',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Monitor NFT transfers for a specific wallet',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				walletAddress: {
					type: 'string',
					required: true,
					description: 'Wallet address to monitor for NFT transfers',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				collectionFilter: {
					type: 'string',
					required: false,
					description: 'Filter by specific NFT collection address',
				},
				direction: {
					type: 'enum',
					required: false,
					description: 'Transfer direction',
					options: ['incoming', 'outgoing', 'both'],
					default: 'both',
				},
			},
		} as NoditBlockData,
	],

	actions: [
		{
			id: 'send-transaction',
			label: 'Send Transaction',
			icon: Upload,
			type: 'action',
			category: 'actions',
			noditOperation: 'eth_sendRawTransaction',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Send a blockchain transaction',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				toAddress: {
					type: 'string',
					required: true,
					description: 'Recipient address',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				amount: {
					type: 'number',
					required: true,
					description: 'Amount to send in native token',
					validation: { min: 0 },
				},
				gasLimit: {
					type: 'number',
					required: false,
					description: 'Gas limit for the transaction',
					default: 21000,
				},
				gasPrice: {
					type: 'number',
					required: false,
					description: 'Gas price in Gwei',
				},
			},
		} as NoditBlockData,

		{
			id: 'call-contract-function',
			label: 'Call Contract Function',
			icon: Code,
			type: 'action',
			category: 'actions',
			noditOperation: 'eth_call',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Call a smart contract function',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				contractAddress: {
					type: 'string',
					required: true,
					description: 'Smart contract address',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				functionName: {
					type: 'string',
					required: true,
					description: 'Function name to call',
				},
				functionArgs: {
					type: 'array',
					required: false,
					description: 'Function arguments (JSON array)',
				},
				value: {
					type: 'number',
					required: false,
					description: 'ETH value to send with call',
					default: 0,
				},
			},
		} as NoditBlockData,

		{
			id: 'token-transfer',
			label: 'Transfer Tokens',
			icon: Download,
			type: 'action',
			category: 'actions',
			noditOperation: 'transferTokens',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Transfer ERC-20 tokens to another address',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				tokenAddress: {
					type: 'string',
					required: true,
					description: 'Token contract address',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				toAddress: {
					type: 'string',
					required: true,
					description: 'Recipient address',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				amount: {
					type: 'number',
					required: true,
					description: 'Amount of tokens to transfer',
					validation: { min: 0 },
				},
			},
		} as NoditBlockData,
	],

	transform: [
		{
			id: 'token-price-converter',
			label: 'Token Price Converter',
			icon: Calculator,
			type: 'transform',
			category: 'transform',
			noditOperation: 'getTokenPrice',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Convert token amounts to USD or other currencies',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				fromToken: {
					type: 'string',
					required: true,
					description: 'Source token address',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				toToken: {
					type: 'string',
					required: true,
					description: 'Target token address or "USD"',
				},
				amount: {
					type: 'number',
					required: true,
					description: 'Amount to convert',
					validation: { min: 0 },
				},
			},
		} as NoditBlockData,

		{
			id: 'portfolio-analyzer',
			label: 'Portfolio Analyzer',
			icon: BarChart,
			type: 'transform',
			category: 'transform',
			noditOperation: 'getTokensOwnedByAccount',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Analyze wallet portfolio composition and value',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				walletAddress: {
					type: 'string',
					required: true,
					description: 'Wallet address to analyze',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				includeNFTs: {
					type: 'boolean',
					required: false,
					description: 'Include NFTs in analysis',
					default: true,
				},
				includeMetadata: {
					type: 'boolean',
					required: false,
					description: 'Include token metadata',
					default: true,
				},
			},
		} as NoditBlockData,

		{
			id: 'transaction-decoder',
			label: 'Transaction Decoder',
			icon: Hash,
			type: 'transform',
			category: 'transform',
			noditOperation: 'getTransactionByHash',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Decode transaction data and extract meaningful information',
			hasEmbeddedControls: true,
			controlType: 'input',
			parameters: {
				transactionHash: {
					type: 'string',
					required: true,
					description: 'Transaction hash to decode',
					validation: { pattern: '^0x[a-fA-F0-9]{64}$' },
				},
			},
		} as NoditBlockData,
	],

	storage: [
		{
			id: 'transaction-logger',
			label: 'Transaction Logger',
			icon: FileText,
			type: 'storage',
			category: 'storage',
			noditOperation: 'getTokenTransfersByAccount',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Log and store transaction history for analysis',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
			parameters: {
				walletAddress: {
					type: 'string',
					required: true,
					description: 'Wallet address to log transactions for',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				timeframe: {
					type: 'enum',
					required: false,
					description: 'Time period to log',
					options: ['24h', '7d', '30d', '90d', 'all'],
					default: '7d',
				},
				includeTokenTransfers: {
					type: 'boolean',
					required: false,
					description: 'Include token transfers',
					default: true,
				},
			},
		} as NoditBlockData,

		{
			id: 'portfolio-tracker',
			label: 'Portfolio Tracker',
			icon: Monitor,
			type: 'storage',
			category: 'storage',
			noditOperation: 'trackPortfolio',
			networks: ['ethereum', 'base', 'arbitrum', 'polygon', 'optimism'],
			description: 'Track portfolio performance over time',
			hasEmbeddedControls: true,
			controlType: 'switch',
			parameters: {
				walletAddress: {
					type: 'string',
					required: true,
					description: 'Wallet address to track',
					validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
				},
				trackingInterval: {
					type: 'enum',
					required: false,
					description: 'Tracking frequency',
					options: ['hourly', 'daily', 'weekly'],
					default: 'daily',
				},
			},
		} as NoditBlockData,
	],
};

// AI Block Categories
export const aiBlockCategories = {
	ai: [
		{
			id: 'ai-portfolio-analyst',
			label: 'AI Portfolio Analyst',
			icon: Search,
			type: 'ai',
			category: 'ai',
			aiModel: 'gpt-4',
			systemPrompt:
				'You are an expert cryptocurrency portfolio analyst. Analyze the provided portfolio data and provide actionable insights.',
			userPromptTemplate:
				'Analyze this portfolio: {{portfolioData}}. Provide insights on diversification, risk, and recommendations.',
			description: 'AI-powered portfolio analysis with recommendations',
			outputFormat: 'json',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				analysisDepth: {
					type: 'enum',
					required: false,
					description: 'Analysis detail level',
					options: ['basic', 'detailed', 'comprehensive'],
					default: 'detailed',
				},
				includeRecommendations: {
					type: 'boolean',
					required: false,
					description: 'Include actionable recommendations',
					default: true,
				},
			},
		} as AIBlockData,

		{
			id: 'ai-trading-signal',
			label: 'AI Trading Signal',
			icon: Eye,
			type: 'ai',
			category: 'ai',
			aiModel: 'gpt-4',
			systemPrompt:
				'You are an expert cryptocurrency trading analyst. Generate trading signals based on market data and technical analysis.',
			userPromptTemplate:
				'Generate a trading signal for {{tokenSymbol}} based on this data: {{marketData}}',
			description: 'AI-generated trading signals with confidence scores',
			outputFormat: 'json',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				timeframe: {
					type: 'enum',
					required: false,
					description: 'Trading timeframe',
					options: ['short-term', 'medium-term', 'long-term'],
					default: 'medium-term',
				},
				riskTolerance: {
					type: 'enum',
					required: false,
					description: 'Risk tolerance level',
					options: ['conservative', 'moderate', 'aggressive'],
					default: 'moderate',
				},
			},
		} as AIBlockData,

		{
			id: 'ai-risk-assessor',
			label: 'AI Risk Assessor',
			icon: AlertTriangle,
			type: 'ai',
			category: 'ai',
			aiModel: 'gpt-4',
			systemPrompt:
				'You are a blockchain security expert. Assess the risk level of transactions, wallets, and smart contracts.',
			userPromptTemplate:
				'Assess the risk of this transaction/wallet: {{transactionData}}',
			description: 'AI-powered risk assessment for blockchain operations',
			outputFormat: 'json',
			hasEmbeddedControls: true,
			controlType: 'switch',
			parameters: {
				riskFactors: {
					type: 'array',
					required: false,
					description: 'Specific risk factors to analyze',
					default: [
						'transaction_patterns',
						'wallet_age',
						'smart_contract_risk',
					],
				},
				confidenceThreshold: {
					type: 'number',
					required: false,
					description: 'Minimum confidence for risk assessment (0-1)',
					default: 0.7,
					validation: { min: 0, max: 1 },
				},
			},
		} as unknown as AIBlockData,

		{
			id: 'ai-decision-maker',
			label: 'AI Decision Maker',
			icon: GitBranch,
			type: 'ai',
			category: 'ai',
			aiModel: 'gpt-4',
			systemPrompt:
				'You are an AI decision maker for blockchain workflows. Evaluate conditions and make routing decisions.',
			userPromptTemplate:
				'Evaluate this condition: {{condition}} with data: {{contextData}}',
			description: 'AI-powered conditional logic for workflow routing',
			outputFormat: 'json',
			hasEmbeddedControls: true,
			controlType: 'complex',
			parameters: {
				condition: {
					type: 'string',
					required: true,
					description: 'Natural language condition to evaluate',
				},
				confidenceThreshold: {
					type: 'number',
					required: false,
					description: 'Minimum confidence for decision (0-1)',
					default: 0.8,
					validation: { min: 0, max: 1 },
				},
				trueAction: {
					type: 'string',
					required: true,
					description: 'Block ID to execute if condition is true',
				},
				falseAction: {
					type: 'string',
					required: true,
					description: 'Block ID to execute if condition is false',
				},
			},
		} as AIBlockData,

		{
			id: 'ai-market-sentiment',
			label: 'AI Market Sentiment',
			icon: Heart,
			type: 'ai',
			category: 'ai',
			aiModel: 'gpt-4',
			systemPrompt:
				'You are a cryptocurrency market sentiment analyst. Analyze market data and social sentiment to determine overall market mood.',
			userPromptTemplate:
				'Analyze market sentiment for {{asset}} based on this data: {{marketData}}',
			description: 'AI analysis of market sentiment and social indicators',
			outputFormat: 'json',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
			parameters: {
				sentimentSources: {
					type: 'array',
					required: false,
					description: 'Data sources for sentiment analysis',
					default: 'price_action,volume,social_media',
				},
				timeframe: {
					type: 'enum',
					required: false,
					description: 'Analysis timeframe',
					options: ['1h', '4h', '1d', '1w'],
					default: '1d',
				},
			},
		} as unknown as AIBlockData,
	],
};

// Combined block categories for easy access
export const allBlockCategories = {
	...noditBlockCategories,
	...aiBlockCategories,
};

// Utility functions
export function getBlockById(
	blockId: string
): NoditBlockData | AIBlockData | null {
	const allBlocks = [
		...noditBlockCategories.triggers,
		...noditBlockCategories.actions,
		...noditBlockCategories.transform,
		...noditBlockCategories.storage,
		...aiBlockCategories.ai,
	];

	return allBlocks.find((block) => block.id === blockId) || null;
}

export function getBlocksByNetwork(networkId: string): NoditBlockData[] {
	const allBlocks = [
		...noditBlockCategories.triggers,
		...noditBlockCategories.actions,
		...noditBlockCategories.transform,
		...noditBlockCategories.storage,
	];

	return allBlocks.filter(
		(block) => 'networks' in block && block.networks.includes(networkId)
	);
}

export function getBlocksByType(
	type: string
): (NoditBlockData | AIBlockData)[] {
	const allBlocks = [
		...noditBlockCategories.triggers,
		...noditBlockCategories.actions,
		...noditBlockCategories.transform,
		...noditBlockCategories.storage,
		...aiBlockCategories.ai,
	];

	return allBlocks.filter((block) => block.type === type);
}
