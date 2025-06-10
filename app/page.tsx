'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	BarChart,
	Zap,
	Shield,

	TrendingUp,
	Bot,
	Layers,
	GitBranch,
	ArrowRight,

	AlertTriangle,
	Database,
	Eye,
	Play,
	Hash,
	Upload,
	Download,
	Calculator,

	Monitor,
	HardDrive,
	Search,
	Bell,
	Heart,
	Box,
	Package,
	Code,
	Filter,
	RotateCcw,
	FileText,
	Trash2,
} from 'lucide-react';

// Block categories with detailed explanations
const blockCategories = {
	triggers: {
		title: 'Trigger Blocks',
		description:
			'Initiate workflows based on blockchain events, market conditions, or custom criteria',
		icon: Zap,
		color: 'from-yellow-500 to-orange-500',
		blocks: [
			{
				id: 'price-alert',
				name: 'Price Alert',
				icon: BarChart,
				description:
					'Monitors cryptocurrency prices and triggers when target thresholds are reached',
				useCases: [
					'Stop-loss automation',
					'Entry point alerts',
					'Portfolio rebalancing triggers',
				],
				features: [
					'Real-time price monitoring',
					'Multiple exchange support',
					'Customizable conditions',
				],
				example: 'Trigger when BTC price drops below $40,000',
			},
			{
				id: 'block-confirmation',
				name: 'Block Confirmation',
				icon: Box,
				description:
					'Triggers after a specified number of blockchain confirmations',
				useCases: [
					'Transaction finality checks',
					'Security confirmations',
					'Payment processing',
				],
				features: [
					'Multi-chain support',
					'Configurable confirmation count',
					'Real-time monitoring',
				],
				example: 'Execute after 12 confirmations on Ethereum',
			},
			{
				id: 'transaction-detected',
				name: 'Transaction Detected',
				icon: Hash,
				description:
					'Monitors blockchain for specific transaction patterns or wallet activities',
				useCases: [
					'Wallet monitoring',
					'Large transaction alerts',
					'MEV detection',
				],
				features: [
					'Address filtering',
					'Amount thresholds',
					'Multi-chain scanning',
				],
				example: 'Alert when whale wallet moves >1000 ETH',
			},
			{
				id: 'smart-contract-event',
				name: 'Smart Contract Event',
				icon: Code,
				description: 'Listens for specific events emitted by smart contracts',
				useCases: [
					'DeFi protocol monitoring',
					'NFT mint detection',
					'Governance voting',
				],
				features: ['Event filtering', 'Parameter extraction', 'ABI decoding'],
				example: 'Monitor Uniswap swap events for arbitrage',
			},
			{
				id: 'wallet-balance-change',
				name: 'Wallet Balance Change',
				icon: Database,
				description:
					'Triggers when wallet balance increases or decreases by specified amounts',
				useCases: [
					'Balance monitoring',
					'Funds movement tracking',
					'Security alerts',
				],
				features: [
					'Percentage or absolute thresholds',
					'Multi-token support',
					'Historical tracking',
				],
				example: 'Alert when portfolio value drops by 10%',
			},
			{
				id: 'market-signal',
				name: 'Market Signal',
				icon: GitBranch,
				description:
					'Responds to technical analysis signals and market indicators',
				useCases: ['Technical trading', 'Trend following', 'Market timing'],
				features: [
					'RSI, MACD, Bollinger Bands',
					'Custom indicators',
					'Multi-timeframe analysis',
				],
				example: 'Buy signal when RSI drops below 30',
			},
			{
				id: 'order-fill',
				name: 'Order Filled',
				icon: Package,
				description: 'Triggers when trading orders are executed on exchanges',
				useCases: ['Order chain execution', 'Profit taking', 'Risk management'],
				features: [
					'Partial fill detection',
					'Multi-exchange support',
					'Order status tracking',
				],
				example: 'Place stop-loss after buy order fills',
			},
			{
				id: 'gas-price-threshold',
				name: 'Gas Price Threshold',
				icon: Zap,
				description:
					'Monitors network gas prices and triggers when optimal conditions are met',
				useCases: ['Gas optimization', 'Transaction timing', 'Cost reduction'],
				features: [
					'Real-time gas tracking',
					'Network congestion analysis',
					'Predictive timing',
				],
				example: 'Execute transaction when gas <20 gwei',
			},
		],
	},
	actions: {
		title: 'Action Blocks',
		description:
			'Execute trades, transactions, and blockchain operations automatically',
		icon: Play,
		color: 'from-green-500 to-emerald-500',
		blocks: [
			{
				id: 'execute-trade',
				name: 'Execute Trade',
				icon: Play,
				description:
					'Automatically executes buy/sell orders on centralized and decentralized exchanges',
				useCases: [
					'Automated trading',
					'Arbitrage execution',
					'Portfolio rebalancing',
				],
				features: [
					'Multi-exchange support',
					'Slippage protection',
					'Order type flexibility',
				],
				example: 'Market buy 0.1 BTC on Binance',
			},
			{
				id: 'send-transaction',
				name: 'Send Transaction',
				icon: Upload,
				description:
					'Sends blockchain transactions with custom parameters and gas optimization',
				useCases: [
					'Token transfers',
					'Contract interactions',
					'Batch transactions',
				],
				features: [
					'Gas optimization',
					'Nonce management',
					'Transaction queuing',
				],
				example: 'Send 100 USDC to cold storage wallet',
			},
			{
				id: 'deploy-contract',
				name: 'Deploy Contract',
				icon: Code,
				description:
					'Deploys smart contracts to blockchain networks with optimal gas settings',
				useCases: [
					'Automated deployments',
					'Factory pattern execution',
					'Multi-chain deployment',
				],
				features: [
					'Gas estimation',
					'Constructor parameters',
					'Verification support',
				],
				example: 'Deploy new liquidity pool contract',
			},
			{
				id: 'place-order',
				name: 'Place Order',
				icon: Package,
				description:
					'Places limit, market, and advanced orders on trading platforms',
				useCases: [
					'Strategic positioning',
					'Dollar-cost averaging',
					'Grid trading',
				],
				features: [
					'Advanced order types',
					'Time-in-force options',
					'Conditional orders',
				],
				example: 'Place limit sell at $50,000 for BTC',
			},
			{
				id: 'cancel-order',
				name: 'Cancel Order',
				icon: Trash2,
				description:
					'Cancels pending orders based on market conditions or time constraints',
				useCases: ['Order management', 'Strategy adjustments', 'Risk control'],
				features: [
					'Selective cancellation',
					'Batch operations',
					'Condition-based cancellation',
				],
				example: 'Cancel all orders if market drops 5%',
			},
			{
				id: 'transfer-tokens',
				name: 'Transfer Tokens',
				icon: Download,
				description:
					'Transfers ERC-20 tokens and native assets between wallets and protocols',
				useCases: [
					'Portfolio management',
					'Yield farming',
					'Cross-chain bridging',
				],
				features: [
					'Batch transfers',
					'Gas optimization',
					'Approval management',
				],
				example: 'Move idle USDC to high-yield protocol',
			},
			{
				id: 'stake-tokens',
				name: 'Stake Tokens',
				icon: Layers,
				description:
					'Stakes tokens in various protocols for yield generation and governance',
				useCases: ['Yield farming', 'Validator staking', 'Liquidity provision'],
				features: [
					'Multi-protocol support',
					'Yield comparison',
					'Auto-compounding',
				],
				example: 'Stake ETH in Ethereum 2.0 validators',
			},
			{
				id: 'swap-tokens',
				name: 'Swap Tokens',
				icon: RotateCcw,
				description:
					'Swaps tokens on DEXs with optimal routing and slippage protection',
				useCases: ['Token swapping', 'Arbitrage', 'Portfolio rebalancing'],
				features: ['DEX aggregation', 'MEV protection', 'Route optimization'],
				example: 'Swap 1000 USDC for ETH on Uniswap',
			},
			{
				id: 'bridge-tokens',
				name: 'Bridge Tokens',
				icon: GitBranch,
				description:
					'Bridges assets between different blockchain networks securely',
				useCases: [
					'Cross-chain transfers',
					'Yield farming',
					'Arbitrage opportunities',
				],
				features: [
					'Multi-bridge support',
					'Fee optimization',
					'Security validation',
				],
				example: 'Bridge USDC from Ethereum to Polygon',
			},
			{
				id: 'claim-rewards',
				name: 'Claim Rewards',
				icon: Heart,
				description:
					'Automatically claims rewards from staking, farming, and governance protocols',
				useCases: ['Yield optimization', 'Compounding', 'Reward harvesting'],
				features: [
					'Multi-protocol support',
					'Gas optimization',
					'Auto-reinvestment',
				],
				example: 'Claim and compound Uniswap LP rewards',
			},
		],
	},
	logic: {
		title: 'Logic Blocks',
		description:
			'Implement conditional logic, comparisons, and decision-making algorithms',
		icon: GitBranch,
		color: 'from-blue-500 to-cyan-500',
		blocks: [
			{
				id: 'price-comparison',
				name: 'Price Comparison',
				icon: BarChart,
				description:
					'Compares prices across exchanges and time periods for optimal decision making',
				useCases: [
					'Arbitrage detection',
					'Best price finding',
					'Market analysis',
				],
				features: [
					'Multi-exchange comparison',
					'Historical analysis',
					'Percentage calculations',
				],
				example: 'Buy if Coinbase price > Binance price by 2%',
			},
			{
				id: 'portfolio-rebalance',
				name: 'Portfolio Rebalance',
				icon: Layers,
				description:
					'Automatically rebalances portfolio to maintain target asset allocations',
				useCases: [
					'Risk management',
					'Strategic allocation',
					'Automated investing',
				],
				features: [
					'Target allocation tracking',
					'Rebalancing thresholds',
					'Tax optimization',
				],
				example: 'Maintain 60% BTC, 40% ETH allocation',
			},
			{
				id: 'stop-loss',
				name: 'Stop Loss Logic',
				icon: AlertTriangle,
				description: 'Implements stop-loss mechanisms to limit downside risk',
				useCases: ['Risk management', 'Loss prevention', 'Position sizing'],
				features: [
					'Trailing stops',
					'Percentage-based stops',
					'Time-based exits',
				],
				example: 'Sell if position drops 10% from entry',
			},
			{
				id: 'take-profit',
				name: 'Take Profit Logic',
				icon: Heart,
				description:
					'Automatically takes profits when price targets are reached',
				useCases: [
					'Profit taking',
					'Position management',
					'Target achievement',
				],
				features: [
					'Multiple profit levels',
					'Partial profit taking',
					'Trailing profits',
				],
				example: 'Sell 50% position at 20% profit',
			},
			{
				id: 'arbitrage-check',
				name: 'Arbitrage Check',
				icon: GitBranch,
				description:
					'Identifies and validates arbitrage opportunities across platforms',
				useCases: [
					'Arbitrage trading',
					'Price inefficiency detection',
					'Profit optimization',
				],
				features: [
					'Cross-exchange analysis',
					'Fee calculation',
					'Execution validation',
				],
				example: 'Detect 1%+ price difference between DEXs',
			},
			{
				id: 'risk-assessment',
				name: 'Risk Assessment',
				icon: Filter,
				description:
					'Evaluates risk metrics and adjusts strategies accordingly',
				useCases: [
					'Risk management',
					'Position sizing',
					'Strategy optimization',
				],
				features: ['VaR calculation', 'Correlation analysis', 'Stress testing'],
				example: 'Reduce position size if portfolio VaR >5%',
			},
		],
	},
	transform: {
		title: 'Transform Blocks',
		description:
			'Process, calculate, and analyze data for informed decision making',
		icon: Calculator,
		color: 'from-purple-500 to-pink-500',
		blocks: [
			{
				id: 'price-calculator',
				name: 'Price Calculator',
				icon: Calculator,
				description: 'Performs complex price calculations and conversions',
				useCases: ['Price analysis', 'Unit conversion', 'Profit calculation'],
				features: [
					'Multi-currency support',
					'Historical pricing',
					'Custom formulas',
				],
				example: 'Calculate USD value of 10 ETH position',
			},
			{
				id: 'portfolio-analyzer',
				name: 'Portfolio Analyzer',
			icon: BarChart,
				description:
					'Analyzes portfolio performance, risk, and optimization opportunities',
				useCases: ['Performance tracking', 'Risk analysis', 'Optimization'],
				features: ['Sharpe ratio', 'Beta calculation', 'Correlation analysis'],
				example: 'Calculate portfolio Sharpe ratio over 30 days',
			},
			{
				id: 'technical-indicators',
				name: 'Technical Indicators',
				icon: Monitor,
				description:
					'Calculates technical analysis indicators for trading decisions',
				useCases: [
					'Technical analysis',
					'Signal generation',
					'Trend identification',
				],
				features: [
					'RSI, MACD, Bollinger Bands',
					'Custom indicators',
					'Multiple timeframes',
				],
				example: 'Calculate 14-period RSI for BTC',
			},
			{
				id: 'gas-optimizer',
				name: 'Gas Optimizer',
				icon: Zap,
				description:
					'Optimizes transaction gas prices and timing for cost efficiency',
				useCases: [
					'Cost reduction',
					'Transaction timing',
					'Batch optimization',
				],
				features: [
					'Gas price prediction',
					'Network congestion analysis',
					'Batch processing',
				],
				example: 'Optimize gas for multi-token swap',
			},
			{
				id: 'token-converter',
				name: 'Token Converter',
				icon: RotateCcw,
				description: 'Converts between different token standards and formats',
				useCases: ['Token bridging', 'Standard conversion', 'Interoperability'],
				features: [
					'Multi-standard support',
					'Metadata preservation',
					'Validation checks',
				],
				example: 'Convert ERC-20 to BEP-20 format',
			},
			{
				id: 'profit-loss-calc',
				name: 'P&L Calculator',
				icon: Calculator,
				description:
					'Calculates profit and loss for trading positions and strategies',
				useCases: [
					'Performance tracking',
					'Tax reporting',
					'Strategy evaluation',
				],
				features: ['Real-time P&L', 'Fee inclusion', 'Multi-position tracking'],
				example: 'Calculate realized P&L for closed positions',
			},
		],
	},
	storage: {
		title: 'Storage Blocks',
		description:
			'Store, retrieve, and manage data for analysis and record keeping',
		icon: Database,
		color: 'from-indigo-500 to-purple-500',
		blocks: [
			{
				id: 'transaction-history',
				name: 'Transaction History',
				icon: FileText,
			description:
					'Stores and retrieves comprehensive transaction history across chains',
				useCases: ['Record keeping', 'Tax reporting', 'Analysis'],
				features: [
					'Multi-chain support',
					'Search functionality',
					'Export options',
				],
				example: 'Store all DEX transactions for tax reporting',
			},
			{
				id: 'portfolio-tracker',
				name: 'Portfolio Tracker',
				icon: BarChart,
			description:
					'Tracks portfolio composition, value, and performance over time',
				useCases: ['Portfolio management', 'Performance analysis', 'Reporting'],
				features: [
					'Real-time tracking',
					'Historical data',
					'Performance metrics',
				],
				example: 'Track portfolio value and allocation changes',
			},
			{
				id: 'trade-logs',
				name: 'Trade Logs',
				icon: Database,
			description:
					'Maintains detailed logs of all trading activities and decisions',
				useCases: ['Audit trails', 'Strategy analysis', 'Compliance'],
				features: [
					'Detailed logging',
					'Search filters',
					'Export functionality',
				],
				example: 'Log all automated trading decisions',
			},
			{
				id: 'performance-metrics',
				name: 'Performance Metrics',
				icon: Monitor,
				description: 'Stores and analyzes comprehensive performance metrics',
				useCases: ['Strategy evaluation', 'Benchmarking', 'Optimization'],
				features: [
					'Custom metrics',
					'Benchmark comparison',
					'Time series analysis',
				],
				example: 'Track Sharpe ratio and max drawdown',
			},
			{
				id: 'wallet-backup',
				name: 'Wallet Backup',
				icon: HardDrive,
				description: 'Securely backs up wallet data and configuration settings',
				useCases: ['Security', 'Disaster recovery', 'Multi-device sync'],
				features: ['Encrypted backup', 'Automated scheduling', 'Cloud storage'],
				example: 'Daily encrypted backup to secure cloud',
			},
		],
	},
	ai: {
		title: 'AI Blocks',
		description:
			'Leverage artificial intelligence for market analysis and trading decisions',
			icon: Bot,
		color: 'from-emerald-500 to-teal-500',
		blocks: [
			{
				id: 'trading-signals',
				name: 'AI Trading Signals',
				icon: Search,
				description:
					'Generates trading signals using advanced AI and machine learning models',
				useCases: ['Signal generation', 'Strategy automation', 'Market timing'],
				features: [
					'Multiple AI models',
					'Confidence scoring',
					'Real-time analysis',
				],
				example: 'GPT-4 analysis suggests BTC bullish signal',
			},
			{
				id: 'market-sentiment',
				name: 'Market Sentiment AI',
				icon: Heart,
				description:
					'Analyzes social media, news, and market data for sentiment insights',
				useCases: ['Sentiment analysis', 'News trading', 'Market psychology'],
				features: [
					'Multi-source analysis',
					'Sentiment scoring',
					'Trend detection',
				],
				example: 'Detect bullish sentiment spike on Twitter',
			},
			{
				id: 'price-prediction',
				name: 'Price Prediction AI',
				icon: Eye,
			description:
					'Predicts future price movements using machine learning algorithms',
				useCases: ['Price forecasting', 'Strategy planning', 'Risk assessment'],
				features: [
					'Multiple ML models',
					'Confidence intervals',
					'Time horizon flexibility',
				],
				example: 'Predict ETH price movement next 24 hours',
			},
			{
				id: 'risk-ai',
				name: 'AI Risk Assessment',
				icon: AlertTriangle,
			description:
					'Assesses portfolio and market risk using AI-powered analytics',
				useCases: [
					'Risk management',
					'Portfolio optimization',
					'Stress testing',
				],
				features: [
					'Real-time risk scoring',
					'Scenario analysis',
					'Correlation detection',
				],
				example: 'AI detects increased correlation risk',
			},
			{
				id: 'pattern-recognition',
				name: 'Pattern Recognition',
				icon: Search,
			description:
					'Identifies chart patterns and market structures using computer vision',
				useCases: ['Technical analysis', 'Pattern trading', 'Market structure'],
				features: [
					'Chart pattern detection',
					'Support/resistance levels',
					'Trend analysis',
				],
				example: 'Detect head and shoulders pattern forming',
			},
		],
	},
	notification: {
		title: 'Notification Blocks',
		description:
			'Send alerts and notifications across multiple channels and platforms',
		icon: Bell,
		color: 'from-red-500 to-orange-500',
		blocks: [
			{
				id: 'trade-alert',
				name: 'Trade Alert',
				icon: Bell,
			description:
					'Sends real-time notifications about trading activities and opportunities',
				useCases: [
					'Trade notifications',
					'Opportunity alerts',
					'Status updates',
				],
				features: [
					'Multi-channel delivery',
					'Custom templates',
					'Priority levels',
				],
				example: 'Push notification: BTC trade executed',
			},
			{
				id: 'price-notification',
				name: 'Price Notification',
				icon: BarChart,
			description:
					'Alerts users when price targets or thresholds are reached',
				useCases: [
					'Price alerts',
					'Target notifications',
					'Threshold warnings',
				],
				features: [
					'Customizable conditions',
					'Multiple assets',
					'Delivery scheduling',
				],
				example: 'Email alert: ETH reached $3,000 target',
			},
			{
				id: 'portfolio-update',
				name: 'Portfolio Update',
				icon: Monitor,
			description:
					'Provides regular updates on portfolio performance and changes',
				useCases: [
					'Performance reporting',
					'Daily summaries',
					'Change notifications',
				],
				features: ['Scheduled reports', 'Custom metrics', 'Visual charts'],
				example: 'Daily portfolio performance summary',
			},
			{
				id: 'risk-warning',
				name: 'Risk Warning',
				icon: AlertTriangle,
				description: 'Sends urgent alerts when risk thresholds are exceeded',
				useCases: ['Risk management', 'Emergency alerts', 'Threshold warnings'],
				features: [
					'Urgency levels',
					'Escalation rules',
					'Multi-channel delivery',
				],
				example: 'Critical alert: Portfolio risk exceeded 15%',
			},
			{
				id: 'gas-alert',
				name: 'Gas Price Alert',
				icon: Zap,
			description:
					'Notifies users about optimal gas prices for transaction execution',
				useCases: ['Gas optimization', 'Transaction timing', 'Cost alerts'],
				features: [
					'Network monitoring',
					'Price predictions',
					'Timing recommendations',
				],
				example: 'Alert: Gas prices dropped to 15 gwei',
			},
		],
	},
};

const stats = [
	{ label: 'Total Blocks', value: '48+', icon: Package },
	{ label: 'Categories', value: '7', icon: Layers },
	{ label: 'Blockchain Networks', value: '15+', icon: GitBranch },
	{ label: 'Exchange Integrations', value: '25+', icon: Database },
];

export default function Home() {
  return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50'>
				<div className='container mx-auto px-4 py-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Zap className='w-8 h-8 text-primary' />
						<span className='text-2xl font-bold'>TaskWeave</span>
					</div>
					<nav className='flex items-center gap-6'>
						<Link
							href='#blocks'
							className='text-muted-foreground hover:text-foreground transition-colors'>
							Blocks
						</Link>
						<Link
							href='#features'
							className='text-muted-foreground hover:text-foreground transition-colors'>
							Features
						</Link>
						<Link href='/project'>
							<Button>
								Start Building
								<ArrowRight className='w-4 h-4 ml-2' />
							</Button>
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<section className='py-20 px-4'>
				<div className='container mx-auto text-center'>
					<Badge variant='secondary' className='mb-4'>
						Powered by NODIT MCP
					</Badge>
					<h1 className='text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'>
						48+ Blockchain Automation Blocks
						<br />
						for Smart Trading & DeFi
					</h1>
					<p className='text-xl text-muted-foreground mb-8 max-w-3xl mx-auto'>
						Discover our comprehensive library of drag-and-drop blocks designed
						for blockchain automation. From simple price alerts to complex
						AI-powered trading strategies, we have everything you need.
					</p>
					<div className='flex gap-4 justify-center mb-12'>
						<Link href='/project'>
							<Button size='lg' className='text-lg px-8 py-4'>
								<Play className='w-5 h-5 mr-2' />
								Start Building
							</Button>
						</Link>
						<Button variant='outline' size='lg' className='text-lg px-8 py-4'>
							<Database className='w-5 h-5 mr-2' />
							View Documentation
						</Button>
					</div>

					{/* Stats */}
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto'>
						{stats.map((stat, index) => (
							<div key={index} className='text-center'>
								<stat.icon className='w-8 h-8 mx-auto mb-2 text-primary' />
								<div className='text-3xl font-bold text-primary'>
									{stat.value}
								</div>
								<div className='text-sm text-muted-foreground'>
									{stat.label}
				</div>
					</div>
						))}
					</div>
				</div>
			</section>

			{/* Use Cases Section */}
			<section className='py-20 px-4'>
				<div className='container mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold mb-4'>Real-World Use Cases</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							See how traders and DeFi users leverage TaskWeave to automate
							complex blockchain workflows and maximize their returns.
						</p>
					</div>

					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						<Card className='hover:shadow-lg transition-shadow'>
								<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<BarChart className='w-6 h-6 text-primary' />
									DeFi Yield Farming
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground mb-4'>
									Automatically compound rewards, switch between pools, and
									maximize yield across multiple DeFi protocols.
								</p>
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Auto-compound
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Pool switching
										</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Yield optimization
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Gas efficiency
											</Badge>
									</div>
									</div>
								</CardContent>
							</Card>

						<Card className='hover:shadow-lg transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<GitBranch className='w-6 h-6 text-primary' />
									Cross-Chain Arbitrage
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-muted-foreground mb-4'>
									Detect price differences across chains and exchanges, execute
									arbitrage trades with optimal gas timing.
								</p>
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Price monitoring
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Cross-chain
										</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											MEV protection
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Auto-execution
										</Badge>
					</div>
				</div>
							</CardContent>
						</Card>

						<Card className='hover:shadow-lg transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Shield className='w-6 h-6 text-primary' />
									Risk Management
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-muted-foreground mb-4'>
									Implement sophisticated stop-loss, take-profit, and portfolio
									rebalancing strategies with AI insights.
								</p>
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Stop-loss
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Take-profit
										</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											AI analysis
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Portfolio balance
										</Badge>
					</div>
							</div>
							</CardContent>
						</Card>

						<Card className='hover:shadow-lg transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Bot className='w-6 h-6 text-primary' />
									AI Trading Strategies
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-muted-foreground mb-4'>
									Leverage machine learning for market sentiment analysis, price
									predictions, and automated trading decisions.
								</p>
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Sentiment AI
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Price prediction
										</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Pattern recognition
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Auto-trading
										</Badge>
						</div>
							</div>
							</CardContent>
						</Card>

						<Card className='hover:shadow-lg transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Database className='w-6 h-6 text-primary' />
									Smart Contract Monitoring
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-muted-foreground mb-4'>
									Monitor on-chain events, track large transactions, and react
									instantly to smart contract activities.
								</p>
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Event tracking
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Whale watching
										</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Real-time alerts
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Multi-chain
										</Badge>
						</div>
							</div>
							</CardContent>
						</Card>

						<Card className='hover:shadow-lg transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<TrendingUp className='w-6 h-6 text-primary' />
									Portfolio Automation
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-muted-foreground mb-4'>
									Automate portfolio rebalancing, dollar-cost averaging, and
									performance tracking across multiple wallets.
								</p>
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Auto-rebalance
										</Badge>
										<Badge variant='outline' className='text-xs'>
											DCA strategies
										</Badge>
									</div>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='text-xs'>
											Performance tracking
										</Badge>
										<Badge variant='outline' className='text-xs'>
											Multi-wallet
										</Badge>
									</div>
						</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Block Documentation Section */}
			<section id='blocks' className='py-20 px-4 bg-muted/50'>
				<div className='container mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold mb-4'>Block Documentation</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Complete reference guide for all automation blocks. Each block is
							shown exactly as it appears in the workflow builder.
						</p>
					</div>

					<Tabs defaultValue='triggers' className='w-full'>
						<TabsList className='grid grid-cols-4 lg:grid-cols-7 w-full'>
							{Object.entries(blockCategories).map(
								([categoryKey, category]) => (
									<TabsTrigger
										key={categoryKey}
										value={categoryKey}
										className='flex items-center gap-2'>
										<category.icon className='w-4 h-4' />
										<span className='hidden sm:inline'>
											{category.title.replace(' Blocks', '')}
										</span>
									</TabsTrigger>
								)
							)}
						</TabsList>

						{Object.entries(blockCategories).map(([categoryKey, category]) => (
							<TabsContent
								key={categoryKey}
								value={categoryKey}
								className='mt-8'>
								<div className='mb-6'>
									<div className='flex items-center gap-4 mb-4'>
										<div
											className={`p-3 rounded-lg bg-gradient-to-r ${category.color}`}>
											<category.icon className='w-8 h-8 text-white' />
										</div>
										<div>
											<h3 className='text-3xl font-bold'>{category.title}</h3>
											<p className='text-lg text-muted-foreground'>
												{category.description}
							</p>
						</div>
									</div>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
									{category.blocks.map((block) => (
										<Card
											key={block.id}
											className='hover:shadow-lg transition-all duration-200 border rounded-lg bg-card text-card-foreground w-full'>
											<CardHeader className='pb-3'>
												<div className='flex items-center gap-2 mb-1'>
													<block.icon className='w-4 h-4 text-primary' />
													<span className='text-sm font-medium truncate'>
														{block.name}
													</span>
						</div>
												<Badge variant='secondary' className='text-xs w-fit'>
													{categoryKey}
												</Badge>
											</CardHeader>
											<CardContent className='space-y-3'>
												<p className='text-xs text-muted-foreground'>
													{block.description}
												</p>

												<div>
													<h5 className='text-xs font-medium mb-1'>
														Use Cases:
													</h5>
													<div className='flex flex-wrap gap-1'>
														{block.useCases
															.slice(0, 2)
															.map((useCase, index) => (
																<Badge
																	key={index}
																	variant='outline'
																	className='text-xs'>
																	{useCase}
																</Badge>
															))}
						</div>
					</div>

												<div className='bg-muted/50 rounded p-2'>
													<p className='text-xs font-medium mb-1'>Example:</p>
													<code className='text-xs text-muted-foreground'>
														{block.example}
													</code>
												</div>

												<div className='text-xs text-green-600 flex items-center gap-1'>
													<div className='w-2 h-2 bg-green-500 rounded-full' />
													Available
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 px-4'>
				<div className='container mx-auto text-center'>
					<h2 className='text-4xl font-bold mb-4'>Ready to Start Building?</h2>
					<p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
						Combine these powerful blocks to create sophisticated blockchain
						automation workflows. Drag, drop, and configure your way to smarter
						trading and DeFi strategies.
					</p>
					<div className='flex gap-4 justify-center'>
						<Link href='/project'>
							<Button size='lg' className='text-lg px-8 py-4'>
								<Play className='w-5 h-5 mr-2' />
								Open Workflow Builder
							</Button>
						</Link>
						<Button variant='outline' size='lg' className='text-lg px-8 py-4'>
							<FileText className='w-5 h-5 mr-2' />
							View Examples
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t py-12 px-4 bg-muted/50'>
				<div className='container mx-auto text-center'>
					<div className='flex items-center justify-center gap-2 mb-4'>
							<Zap className='w-6 h-6 text-primary' />
						<span className='text-xl font-bold'>TaskWeave</span>
					</div>
					<p className='text-sm text-muted-foreground'>
						Blockchain Automation Platform • Built with NODIT MCP
						</p>
        </div>
      </footer>
    </div>
  );
}
