'use client';

import { useState, useCallback, useRef } from 'react';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
	ReactFlow,
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	Controls,
	type Node,
	type Edge,
	type NodeChange,
	type EdgeChange,
	type Connection,
	MiniMap,
	type ReactFlowInstance,
	Handle,
	Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
	Play,
	GitBranch,
	Database,
	Zap,
	Settings,
	Trash2,
	FileText,
	Code,
	Filter,
	RotateCcw,
	AlertTriangle,
	Hash,
	Upload,
	Download,
	Calculator,
	Smartphone,
	Monitor,
	HardDrive,
	Search,
	Bell,
	Heart,
	Eye,
	BarChart,
	Layers,
	Box,
	Package,
	type LucideIcon,
} from 'lucide-react';

// Type definitions
interface BlockData {
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
	hasEmbeddedControls?: boolean;
	controlType?: 'button' | 'dropdown' | 'input' | 'switch' | 'complex';
}

interface CustomNodeData {
	label: string;
	icon: LucideIcon;
	blockType:
		| 'trigger'
		| 'action'
		| 'logic'
		| 'transform'
		| 'storage'
		| 'ai'
		| 'notification';
	blockId: string;
	configured: boolean;
	hasEmbeddedControls?: boolean;
	controlType?: 'button' | 'dropdown' | 'input' | 'switch' | 'complex';
	status?: 'active' | 'inactive' | 'running' | 'error';
	[key: string]: unknown;
}

// Expanded block categories with more variety
const blockCategories: {
	triggers: BlockData[];
	actions: BlockData[];
	logic: BlockData[];
	transform: BlockData[];
	storage: BlockData[];
	ai: BlockData[];
	notification: BlockData[];
} = {
	triggers: [
		{
			id: 'price-alert',
			label: 'Price Alert',
			icon: BarChart,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'block-confirmation',
			label: 'Block Confirmation',
			icon: Box,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'transaction-detected',
			label: 'Transaction Detected',
			icon: Hash,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'smart-contract-event',
			label: 'Smart Contract Event',
			icon: Code,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'wallet-balance-change',
			label: 'Wallet Balance Change',
			icon: Database,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'market-signal',
			label: 'Market Signal',
			icon: GitBranch,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'order-fill',
			label: 'Order Filled',
			icon: Package,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'gas-price-threshold',
			label: 'Gas Price Threshold',
			icon: Zap,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
	],
	actions: [
		{
			id: 'execute-trade',
			label: 'Execute Trade',
			icon: Play,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'send-transaction',
			label: 'Send Transaction',
			icon: Upload,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'deploy-contract',
			label: 'Deploy Contract',
			icon: Code,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
		{
			id: 'place-order',
			label: 'Place Order',
			icon: Package,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'cancel-order',
			label: 'Cancel Order',
			icon: Trash2,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'transfer-tokens',
			label: 'Transfer Tokens',
			icon: Download,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'stake-tokens',
			label: 'Stake Tokens',
			icon: Layers,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'swap-tokens',
			label: 'Swap Tokens',
			icon: RotateCcw,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'bridge-tokens',
			label: 'Bridge Tokens',
			icon: GitBranch,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'claim-rewards',
			label: 'Claim Rewards',
			icon: Heart,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
	],
	logic: [
		{
			id: 'price-comparison',
			label: 'Price Comparison',
			icon: BarChart,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'portfolio-rebalance',
			label: 'Portfolio Rebalance',
			icon: Layers,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'stop-loss',
			label: 'Stop Loss Logic',
			icon: AlertTriangle,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'take-profit',
			label: 'Take Profit Logic',
			icon: Heart,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'arbitrage-check',
			label: 'Arbitrage Check',
			icon: GitBranch,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'risk-assessment',
			label: 'Risk Assessment',
			icon: Filter,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
	],
	transform: [
		{
			id: 'price-calculator',
			label: 'Price Calculator',
			icon: Calculator,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'portfolio-analyzer',
			label: 'Portfolio Analyzer',
			icon: BarChart,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'technical-indicators',
			label: 'Technical Indicators',
			icon: Monitor,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'gas-optimizer',
			label: 'Gas Optimizer',
			icon: Zap,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'token-converter',
			label: 'Token Converter',
			icon: RotateCcw,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'profit-loss-calc',
			label: 'P&L Calculator',
			icon: Calculator,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
	],
	storage: [
		{
			id: 'transaction-history',
			label: 'Transaction History',
			icon: FileText,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'portfolio-tracker',
			label: 'Portfolio Tracker',
			icon: BarChart,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'trade-logs',
			label: 'Trade Logs',
			icon: Database,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
		{
			id: 'performance-metrics',
			label: 'Performance Metrics',
			icon: Monitor,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'wallet-backup',
			label: 'Wallet Backup',
			icon: HardDrive,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
	],
	ai: [
		{
			id: 'trading-signals',
			label: 'AI Trading Signals',
			icon: Search,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'market-sentiment',
			label: 'Market Sentiment AI',
			icon: Heart,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'price-prediction',
			label: 'Price Prediction AI',
			icon: Eye,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'risk-ai',
			label: 'AI Risk Assessment',
			icon: AlertTriangle,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'pattern-recognition',
			label: 'Pattern Recognition',
			icon: Search,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
	],
	notification: [
		{
			id: 'trade-alert',
			label: 'Trade Alert',
			icon: Bell,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'price-notification',
			label: 'Price Notification',
			icon: BarChart,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'portfolio-update',
			label: 'Portfolio Update',
			icon: Monitor,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'risk-warning',
			label: 'Risk Warning',
			icon: AlertTriangle,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'gas-alert',
			label: 'Gas Price Alert',
			icon: Zap,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
	],
};

// Enhanced Custom node component with embedded controls
const CustomNode = ({
	data,
	selected,
}: {
	data: CustomNodeData;
	selected: boolean;
}) => {
	const IconComponent = data.icon;
	const [localValue, setLocalValue] = useState('');
	const [isEnabled, setIsEnabled] = useState(false);
	const [dropdownValue, setDropdownValue] = useState('');

	const renderEmbeddedControl = () => {
		if (!data.hasEmbeddedControls) return null;

		switch (data.controlType) {
			case 'button':
				return (
					<Button
						size='sm'
						variant='outline'
						className='mt-2 w-full h-6 text-xs'
						onClick={(e) => e.stopPropagation()}>
						<Play className='w-3 h-3 mr-1' />
						{data.blockId === 'deploy-contract'
							? 'Deploy'
							: data.blockId === 'trade-logs'
							? 'Export'
							: data.blockId === 'wallet-backup'
							? 'Backup'
							: data.blockId === 'claim-rewards'
							? 'Claim'
							: 'Execute'}
					</Button>
				);

			case 'input':
				return (
					<Input
						placeholder={
							data.blockId === 'block-confirmation'
								? 'Block Count'
								: data.blockId === 'wallet-balance-change'
								? 'Wallet Address'
								: data.blockId === 'gas-price-threshold'
								? 'Gwei Limit'
								: data.blockId === 'cancel-order'
								? 'Order ID'
								: data.blockId === 'stop-loss'
								? 'Stop Price'
								: data.blockId === 'take-profit'
								? 'Target Price'
								: data.blockId === 'profit-loss-calc'
								? 'Entry Price'
								: data.blockId === 'price-notification'
								? 'Target Price'
								: data.blockId === 'gas-alert'
								? 'Max Gwei'
								: 'Value'
						}
						value={localValue}
						onChange={(e) => {
							e.stopPropagation();
							setLocalValue(e.target.value);
						}}
						className='mt-2 h-6 text-xs'
						onClick={(e) => e.stopPropagation()}
					/>
				);

			case 'dropdown':
				const getDropdownOptions = () => {
					switch (data.blockId) {
						case 'market-signal':
							return ['Bull Signal', 'Bear Signal', 'Neutral', 'Volume Spike'];
						case 'bridge-tokens':
							return ['Ethereum → BSC', 'BSC → Polygon', 'Polygon → Arbitrum'];
						case 'arbitrage-check':
							return ['CEX vs DEX', 'Cross-chain', 'Multi-pair'];
						case 'price-calculator':
							return ['USD Price', 'Token Ratio', 'Market Cap', 'Volume'];
						case 'technical-indicators':
							return ['RSI', 'MACD', 'Bollinger Bands', 'Moving Average'];
						case 'transaction-history':
							return ['Last 24h', 'Last Week', 'Last Month', 'All Time'];
						case 'market-sentiment':
							return ['Bullish', 'Bearish', 'Neutral', 'Fear/Greed'];
						case 'pattern-recognition':
							return [
								'Head & Shoulders',
								'Double Top',
								'Triangle',
								'Support/Resistance',
							];
						case 'risk-warning':
							return ['High Risk', 'Medium Risk', 'Low Risk', 'Critical'];
						default:
							return ['Option 1', 'Option 2', 'Option 3'];
					}
				};

				return (
					<Select value={dropdownValue} onValueChange={setDropdownValue}>
						<SelectTrigger
							className='mt-2 h-6 text-xs'
							onClick={(e) => e.stopPropagation()}>
							<SelectValue placeholder='Select...' />
						</SelectTrigger>
						<SelectContent>
							{getDropdownOptions().map((option) => (
								<SelectItem key={option} value={option} className='text-xs'>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case 'switch':
				return (
					<div
						className='flex items-center justify-between mt-2'
						onClick={(e) => e.stopPropagation()}>
						<span className='text-xs text-muted-foreground'>
							{data.blockId === 'order-fill'
								? 'Auto Fill'
								: data.blockId === 'gas-optimizer'
								? 'Optimize'
								: data.blockId === 'portfolio-tracker'
								? 'Live Track'
								: data.blockId === 'risk-ai'
								? 'AI Enabled'
								: data.blockId === 'portfolio-update'
								? 'Real-time'
								: 'Enable'}
						</span>
						<Switch
							checked={isEnabled}
							onCheckedChange={setIsEnabled}
							className='scale-75'
						/>
					</div>
				);

			case 'complex':
				return (
					<div className='mt-2 space-y-1' onClick={(e) => e.stopPropagation()}>
						{data.blockId === 'price-alert' && (
							<>
								<Input placeholder='Token Symbol' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										$45,000
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Above
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'transaction-detected' && (
							<>
								<Input placeholder='Wallet Address' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										ETH
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Incoming
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'smart-contract-event' && (
							<>
								<Input placeholder='Contract Address' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										Transfer
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Event
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'execute-trade' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='trading-pair'>Trading Pair</Label>
										<Input
											id='trading-pair'
											placeholder='e.g., BTC/USDT'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='order-type'>Order Type</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select order type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='market'>Market Order</SelectItem>
												<SelectItem value='limit'>Limit Order</SelectItem>
												<SelectItem value='stop-loss'>Stop Loss</SelectItem>
												<SelectItem value='take-profit'>Take Profit</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='amount'>Amount</Label>
										<Input
											id='amount'
											placeholder='Enter amount...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='exchange'>Exchange</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select exchange' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='binance'>Binance</SelectItem>
												<SelectItem value='coinbase'>Coinbase Pro</SelectItem>
												<SelectItem value='kraken'>Kraken</SelectItem>
												<SelectItem value='uniswap'>Uniswap</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}
						{data.blockId === 'send-transaction' && (
							<>
								<Input placeholder='To Address' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										0.1 ETH
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Fast
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'place-order' && (
							<>
								<Input placeholder='Price' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										Limit
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										GTC
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'transfer-tokens' && (
							<>
								<Input placeholder='Amount' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										USDC
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										L1
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'stake-tokens' && (
							<>
								<Input placeholder='Stake Amount' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										ETH 2.0
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										5.2% APY
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'swap-tokens' && (
							<>
								<Input placeholder='From → To' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										Uniswap
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Best Rate
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'price-comparison' && (
							<>
								<Input placeholder='Token A vs B' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										&gt;
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Ratio
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'portfolio-rebalance' && (
							<>
								<Input placeholder='Target %' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										60/40
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Auto
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'risk-assessment' && (
							<>
								<Input placeholder='Risk Score' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										7/10
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										High
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'portfolio-analyzer' && (
							<>
								<Input placeholder='Portfolio ID' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										+15.3%
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										YTD
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'token-converter' && (
							<>
								<Input placeholder='Convert Rate' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										1:1500
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										ETH/USD
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'performance-metrics' && (
							<>
								<Input placeholder='Timeframe' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										Sharpe: 2.1
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Metrics
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'trading-signals' && (
							<>
								<Input placeholder='Signal Type' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										GPT-4
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Bullish
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'price-prediction' && (
							<>
								<Input placeholder='Prediction Model' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										ML
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										$50K
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'trade-alert' && (
							<>
								<Input placeholder='Alert Type' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										<Smartphone className='w-2 h-2 mr-1' />
										Push
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Instant
									</Badge>
								</div>
							</>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	const getStatusColor = () => {
		switch (data.status) {
			case 'active':
				return 'bg-green-500';
			case 'running':
				return 'bg-blue-500 animate-pulse';
			case 'error':
				return 'bg-red-500';
			default:
				return 'bg-gray-400';
		}
	};

	return (
		<div
			className={`px-3 py-2 border rounded-lg bg-card text-card-foreground min-w-[180px] max-w-[220px] relative ${
				selected
					? 'border-primary shadow-lg ring-2 ring-primary/20'
					: 'border-border'
			} hover:shadow-md transition-all duration-200`}>
			{/* Connection Handles */}
			<Handle
				type='target'
				position={Position.Left}
				id='input'
				className='w-4 h-4 !bg-primary hover:!bg-primary/80 !border-2 !border-white rounded-full !opacity-100'
				style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }}
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='output'
				className='w-4 h-4 !bg-primary hover:!bg-primary/80 !border-2 !border-white rounded-full !opacity-100'
				style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }}
			/>

			{/* Additional handles for complex logic blocks */}
			{data.blockType === 'logic' &&
				(data.blockId === 'conditional' || data.blockId === 'switch-case') && (
					<>
						<Handle
							type='source'
							position={Position.Bottom}
							id='true'
							className='w-4 h-4 !bg-green-500 hover:!bg-green-400 !border-2 !border-white rounded-full !opacity-100'
							style={{ bottom: -8, left: '30%', transform: 'translateX(-50%)' }}
						/>
						<Handle
							type='source'
							position={Position.Bottom}
							id='false'
							className='w-4 h-4 !bg-red-500 hover:!bg-red-400 !border-2 !border-white rounded-full !opacity-100'
							style={{ bottom: -8, left: '70%', transform: 'translateX(-50%)' }}
						/>
					</>
				)}

			{/* Status indicator */}
			<div
				className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusColor()}`}
			/>

			{/* Header */}
			<div className='flex items-center gap-2 mb-1'>
				<IconComponent className='w-4 h-4 text-primary' />
				<span className='text-sm font-medium truncate'>{data.label}</span>
			</div>

			{/* Category badge */}
			<Badge variant='secondary' className='text-xs mb-2'>
				{data.blockType}
			</Badge>

			{/* Embedded controls */}
			{renderEmbeddedControl()}

			{/* Configuration status */}
			{data.configured && (
				<div className='text-xs text-green-600 mt-2 flex items-center gap-1'>
					<div className='w-2 h-2 bg-green-500 rounded-full' />
					Configured
				</div>
			)}
		</div>
	);
};

const nodeTypes = {
	custom: CustomNode,
};

export default function ProjectPage() {
	const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState('');
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) =>
			setNodes(
				(nds) => applyNodeChanges(changes, nds) as Node<CustomNodeData>[]
			),
		[]
	);

	const onEdgesChange = useCallback(
		(changes: EdgeChange[]) =>
			setEdges((eds) => applyEdgeChanges(changes, eds)),
		[]
	);

	const onConnect = useCallback((connection: Connection) => {
		// Ensure proper connection validation
		if (connection.source && connection.target) {
			setEdges((eds) => addEdge(connection, eds));
		}
	}, []);

	const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
		setSelectedNode(node as Node<CustomNodeData>);
	}, []);

	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();

			const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
			const blockData = JSON.parse(
				event.dataTransfer.getData('application/json')
			);

			if (!reactFlowBounds || !reactFlowInstance) return;

			// More precise position calculation with centering
			const dropPosition = reactFlowInstance.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Center the block on the drop position
			// Assuming block width ~150px and height ~40px based on CSS
			const position = {
				x: dropPosition.x - 75, // Half of min-width (150px)
				y: dropPosition.y - 20, // Half of estimated height
			};

			// Find the original block to get the icon
			const allBlocks = [
				...blockCategories.triggers,
				...blockCategories.actions,
				...blockCategories.logic,
				...blockCategories.transform,
				...blockCategories.storage,
				...blockCategories.ai,
				...blockCategories.notification,
			];
			const originalBlock = allBlocks.find((b) => b.id === blockData.id);

			if (!originalBlock) return;

			// Random status for demo purposes
			const statuses: ('active' | 'inactive' | 'running' | 'error')[] = [
				'active',
				'inactive',
				'running',
				'error',
			];
			const randomStatus =
				statuses[Math.floor(Math.random() * statuses.length)];

			const newNode: Node<CustomNodeData> = {
				id: `${blockData.id}-${Date.now()}`,
				type: 'custom',
				position,
				data: {
					label: blockData.label,
					icon: originalBlock.icon,
					blockType: originalBlock.type as
						| 'trigger'
						| 'action'
						| 'logic'
						| 'transform'
						| 'storage'
						| 'ai'
						| 'notification',
					blockId: blockData.id,
					configured: Math.random() > 0.7, // 30% chance of being pre-configured
					hasEmbeddedControls: originalBlock.hasEmbeddedControls,
					controlType: originalBlock.controlType,
					status: randomStatus,
				},
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[reactFlowInstance]
	);

	const onDragStart = (event: React.DragEvent, block: BlockData) => {
		// Store only serializable data, icon will be resolved later
		const blockData: Omit<BlockData, 'icon'> = {
			id: block.id,
			label: block.label,
			type: block.type,
			category: block.category,
			hasEmbeddedControls: block.hasEmbeddedControls,
			controlType: block.controlType,
		};
		event.dataTransfer.setData('application/json', JSON.stringify(blockData));
		event.dataTransfer.effectAllowed = 'move';
	};

	const updateNodeConfiguration = useCallback(() => {
		if (!selectedNode) return;

		setNodes((nds) =>
			nds.map((node) =>
				node.id === selectedNode.id
					? ({
							...node,
							data: { ...node.data, configured: true },
					  } as Node<CustomNodeData>)
					: node
			)
		);
	}, [selectedNode]);

	const deleteSelectedNode = useCallback(() => {
		if (!selectedNode) return;

		setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
		setEdges((eds) =>
			eds.filter(
				(edge) =>
					edge.source !== selectedNode.id && edge.target !== selectedNode.id
			)
		);
		setSelectedNode(null);
	}, [selectedNode]);

	const renderBlockLibrary = () => (
		<div className='p-4 h-full overflow-auto'>
			<div className='mb-4'>
				<Input
					placeholder='Search blocks...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='w-full'
				/>
			</div>

			<Accordion
				type='multiple'
				defaultValue={[
					'triggers',
					'actions',
					'logic',
					'transform',
					'storage',
					'ai',
					'notification',
				]}>
				{Object.entries(blockCategories).map(([category, blocks]) => (
					<AccordionItem key={category} value={category}>
						<AccordionTrigger className='capitalize text-sm font-medium'>
							{category}
						</AccordionTrigger>
						<AccordionContent>
							<div className='space-y-2'>
								{blocks
									.filter((block) =>
										block.label.toLowerCase().includes(searchTerm.toLowerCase())
									)
									.map((block) => (
										<div
											key={block.id}
											draggable
											onDragStart={(e) => onDragStart(e, block)}
											className='p-3 border border-border rounded-md bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors'>
											<div className='flex items-center gap-2'>
												<block.icon className='w-4 h-4' />
												<span className='text-sm font-medium'>
													{block.label}
												</span>
											</div>
										</div>
									))}
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);

	const renderConfigurationPanel = () => {
		if (!selectedNode) {
			return (
				<div className='p-4 h-full flex items-center justify-center text-center'>
					<div className='text-muted-foreground'>
						<Settings className='w-8 h-8 mx-auto mb-2' />
						<p className='text-sm'>
							Select a block to configure its properties
						</p>
					</div>
				</div>
			);
		}

		const { data } = selectedNode;

		return (
			<div className='p-4 h-full overflow-auto'>
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-base'>
							<data.icon className='w-4 h-4' />
							{data.label}
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div>
							<Label htmlFor='block-name'>Block Name</Label>
							<Input
								id='block-name'
								defaultValue={data.label}
								className='mt-1'
							/>
						</div>

						<div>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								placeholder='Enter block description...'
								className='mt-1'
							/>
						</div>

						{data.blockId === 'portfolio-rebalance' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='target-allocation'>Target Allocation</Label>
										<Input
											id='target-allocation'
											placeholder='e.g., 60% BTC, 40% ETH'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='rebalance-threshold'>
											Rebalance Threshold
										</Label>
										<Input
											id='rebalance-threshold'
											placeholder='e.g., 5%'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='rebalance-frequency'>Frequency</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select frequency' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='daily'>Daily</SelectItem>
												<SelectItem value='weekly'>Weekly</SelectItem>
												<SelectItem value='monthly'>Monthly</SelectItem>
												<SelectItem value='on-threshold'>
													On Threshold
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}

						{data.blockId === 'trading-signals' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='signal-source'>Signal Source</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select AI model' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='gpt4'>GPT-4 Analysis</SelectItem>
												<SelectItem value='claude'>Claude AI</SelectItem>
												<SelectItem value='custom'>Custom Model</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='confidence-threshold'>
											Confidence Threshold
										</Label>
										<Input
											id='confidence-threshold'
											placeholder='e.g., 75%'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='signal-timeframe'>Timeframe</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select timeframe' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='1m'>1 Minute</SelectItem>
												<SelectItem value='5m'>5 Minutes</SelectItem>
												<SelectItem value='1h'>1 Hour</SelectItem>
												<SelectItem value='1d'>1 Day</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}

						{data.blockId === 'execute-trade' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='trading-pair'>Trading Pair</Label>
										<Input
											id='trading-pair'
											placeholder='e.g., BTC/USDT'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='order-type'>Order Type</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select order type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='market'>Market Order</SelectItem>
												<SelectItem value='limit'>Limit Order</SelectItem>
												<SelectItem value='stop-loss'>Stop Loss</SelectItem>
												<SelectItem value='take-profit'>Take Profit</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='amount'>Amount</Label>
										<Input
											id='amount'
											placeholder='Enter amount...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='exchange'>Exchange</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select exchange' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='binance'>Binance</SelectItem>
												<SelectItem value='coinbase'>Coinbase Pro</SelectItem>
												<SelectItem value='kraken'>Kraken</SelectItem>
												<SelectItem value='uniswap'>Uniswap</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}

						{data.blockId === 'price-alert' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='token-symbol'>Token Symbol</Label>
										<Input
											id='token-symbol'
											placeholder='e.g., BTC, ETH, USDT'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='target-price'>Target Price</Label>
										<Input
											id='target-price'
											placeholder='Enter target price...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='condition'>Condition</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select condition' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='above'>Above Target</SelectItem>
												<SelectItem value='below'>Below Target</SelectItem>
												<SelectItem value='crosses'>Crosses Price</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}

						{data.blockId === 'smart-contract-event' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='contract-address'>Contract Address</Label>
										<Input
											id='contract-address'
											placeholder='0x...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='event-name'>Event Name</Label>
										<Input
											id='event-name'
											placeholder='e.g., Transfer, Approval'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='network'>Network</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select network' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='ethereum'>Ethereum</SelectItem>
												<SelectItem value='bsc'>BSC</SelectItem>
												<SelectItem value='polygon'>Polygon</SelectItem>
												<SelectItem value='arbitrum'>Arbitrum</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}

						<div className='flex gap-2 pt-4'>
							<Button onClick={updateNodeConfiguration} className='flex-1'>
								Save Changes
							</Button>
							<Button
								variant='destructive'
								size='icon'
								onClick={deleteSelectedNode}>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	};

	return (
		<div className='h-screen w-full'>
			<ResizablePanelGroup direction='horizontal'>
				{/* Left Panel - Block Library */}
				<ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
					<div className='h-full bg-card border-r border-border'>
						<div className='p-4 border-b border-border'>
							<h2 className='font-semibold text-card-foreground'>
								Block Library
							</h2>
						</div>
						{renderBlockLibrary()}
					</div>
				</ResizablePanel>

				<ResizableHandle />

				{/* Middle Panel - React Flow Canvas */}
				<ResizablePanel defaultSize={60} minSize={40}>
					<div className='h-full bg-background relative' ref={reactFlowWrapper}>
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesChange={onEdgesChange}
							onConnect={onConnect}
							onNodeClick={onNodeClick}
							onDrop={onDrop}
							onDragOver={onDragOver}
							onInit={setReactFlowInstance}
							nodeTypes={nodeTypes}
							className='bg-background'
							defaultViewport={{ x: 0, y: 0, zoom: 1 }}
							snapToGrid={true}
							snapGrid={[20, 20]}
							deleteKeyCode={['Backspace', 'Delete']}
							multiSelectionKeyCode='Shift'
							panOnDrag={true}
							selectionOnDrag={false}
							fitView={false}>
							<Background />
							<Controls />
							<MiniMap />
						</ReactFlow>

						{nodes.length === 0 && (
							<div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
								<div className='text-center text-muted-foreground'>
									<Play className='w-12 h-12 mx-auto mb-4 opacity-50' />
									<h3 className='text-lg font-medium mb-2'>
										Start Building Your Workflow
									</h3>
									<p className='text-sm max-w-md'>
										Drag blocks from the left panel to this canvas to start
										creating your automation workflow.
									</p>
								</div>
							</div>
						)}
					</div>
				</ResizablePanel>

				<ResizableHandle />

				{/* Right Panel - Configuration */}
				<ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
					<div className='h-full bg-card border-l border-border'>
						<div className='p-4 border-b border-border'>
							<h2 className='font-semibold text-card-foreground'>
								{selectedNode ? 'Block Configuration' : 'Properties'}
							</h2>
						</div>
						{renderConfigurationPanel()}
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
