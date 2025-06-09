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
	Webhook,
	Play,
	Mail,
	Clock,
	GitBranch,
	Database,
	Zap,
	Settings,
	Trash2,
	Calendar,
	FileText,
	MessageSquare,
	Code,
	Filter,
	RotateCcw,
	AlertTriangle,
	CloudRain,
	Hash,
	FileJson,
	Upload,
	Download,
	Calculator,
	Image,
	Smartphone,
	Monitor,
	HardDrive,
	Globe,
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
			id: 'webhook',
			label: 'Webhook Listener',
			icon: Webhook,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
		{
			id: 'nodit-event',
			label: 'NODIT MCP Event',
			icon: Zap,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'schedule',
			label: 'Schedule Trigger',
			icon: Calendar,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'file-watcher',
			label: 'File Watcher',
			icon: Eye,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'email-received',
			label: 'Email Received',
			icon: Mail,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'database-change',
			label: 'Database Change',
			icon: Database,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'api-poll',
			label: 'API Polling',
			icon: RotateCcw,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'form-submit',
			label: 'Form Submission',
			icon: FileText,
			type: 'trigger',
			category: 'triggers',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
	],
	actions: [
		{
			id: 'nodit-action',
			label: 'NODIT MCP Action',
			icon: Zap,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'email',
			label: 'Send Email',
			icon: Mail,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
		{
			id: 'delay',
			label: 'Delay',
			icon: Clock,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'http-request',
			label: 'HTTP Request',
			icon: Database,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'file-upload',
			label: 'Upload File',
			icon: Upload,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
		{
			id: 'file-download',
			label: 'Download File',
			icon: Download,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'webhook-send',
			label: 'Send Webhook',
			icon: Webhook,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'sms-send',
			label: 'Send SMS',
			icon: Smartphone,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'slack-message',
			label: 'Slack Message',
			icon: MessageSquare,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'create-file',
			label: 'Create File',
			icon: FileText,
			type: 'action',
			category: 'actions',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
	],
	logic: [
		{
			id: 'conditional',
			label: 'Conditional Logic',
			icon: GitBranch,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'filter',
			label: 'Filter Data',
			icon: Filter,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'loop',
			label: 'Loop/Iterator',
			icon: RotateCcw,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'switch-case',
			label: 'Switch Case',
			icon: Code,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'error-handler',
			label: 'Error Handler',
			icon: AlertTriangle,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'parallel-execute',
			label: 'Parallel Execute',
			icon: Layers,
			type: 'logic',
			category: 'logic',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
	],
	transform: [
		{
			id: 'json-parser',
			label: 'JSON Parser',
			icon: FileJson,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'data-mapper',
			label: 'Data Mapper',
			icon: Hash,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'text-processor',
			label: 'Text Processor',
			icon: FileText,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'calculator',
			label: 'Math Calculator',
			icon: Calculator,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'image-processor',
			label: 'Image Processor',
			icon: Image,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'csv-parser',
			label: 'CSV Parser',
			icon: FileText,
			type: 'transform',
			category: 'transform',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
	],
	storage: [
		{
			id: 'database-insert',
			label: 'Database Insert',
			icon: Database,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'file-save',
			label: 'Save to File',
			icon: HardDrive,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'cloud-storage',
			label: 'Cloud Storage',
			icon: CloudRain,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'cache-store',
			label: 'Cache Store',
			icon: Box,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'switch',
		},
		{
			id: 'backup-create',
			label: 'Create Backup',
			icon: Package,
			type: 'storage',
			category: 'storage',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
	],
	ai: [
		{
			id: 'ai-classify',
			label: 'AI Text Classifier',
			icon: Search,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'ai-generate',
			label: 'AI Text Generator',
			icon: FileText,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'ai-sentiment',
			label: 'Sentiment Analysis',
			icon: Heart,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'ai-translate',
			label: 'AI Translator',
			icon: Globe,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'ai-vision',
			label: 'AI Image Analysis',
			icon: Eye,
			type: 'ai',
			category: 'ai',
			hasEmbeddedControls: true,
			controlType: 'button',
		},
	],
	notification: [
		{
			id: 'push-notification',
			label: 'Push Notification',
			icon: Bell,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'complex',
		},
		{
			id: 'desktop-notification',
			label: 'Desktop Alert',
			icon: Monitor,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'input',
		},
		{
			id: 'log-message',
			label: 'Log Message',
			icon: FileText,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'dropdown',
		},
		{
			id: 'analytics-track',
			label: 'Track Analytics',
			icon: BarChart,
			type: 'notification',
			category: 'notification',
			hasEmbeddedControls: true,
			controlType: 'complex',
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
						{data.blockId === 'email'
							? 'Send'
							: data.blockId === 'webhook'
							? 'Listen'
							: data.blockId === 'file-upload'
							? 'Upload'
							: data.blockId === 'backup-create'
							? 'Backup'
							: data.blockId === 'ai-vision'
							? 'Analyze'
							: 'Run'}
					</Button>
				);

			case 'input':
				return (
					<Input
						placeholder={
							data.blockId === 'delay'
								? 'Seconds'
								: data.blockId === 'file-watcher'
								? 'Path'
								: data.blockId === 'form-submit'
								? 'Form ID'
								: data.blockId === 'file-download'
								? 'URL'
								: data.blockId === 'sms-send'
								? 'Phone'
								: data.blockId === 'create-file'
								? 'Filename'
								: data.blockId === 'json-parser'
								? 'JSON Path'
								: data.blockId === 'calculator'
								? 'Formula'
								: data.blockId === 'file-save'
								? 'Path'
								: data.blockId === 'ai-generate'
								? 'Prompt'
								: data.blockId === 'desktop-notification'
								? 'Title'
								: data.blockId === 'parallel-execute'
								? 'Max Threads'
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
						case 'schedule':
							return ['Every hour', 'Daily', 'Weekly', 'Monthly'];
						case 'database-change':
							return ['INSERT', 'UPDATE', 'DELETE'];
						case 'http-request':
							return ['GET', 'POST', 'PUT', 'DELETE'];
						case 'filter':
							return ['Equals', 'Contains', 'Greater than', 'Less than'];
						case 'switch-case':
							return ['String match', 'Number range', 'Boolean'];
						case 'text-processor':
							return ['Uppercase', 'Lowercase', 'Replace', 'Extract'];
						case 'image-processor':
							return ['Resize', 'Crop', 'Compress', 'Format'];
						case 'cloud-storage':
							return ['AWS S3', 'Google Drive', 'Dropbox'];
						case 'ai-sentiment':
							return ['Positive/Negative', 'Detailed', 'Confidence'];
						case 'log-message':
							return ['Info', 'Warning', 'Error', 'Debug'];
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
							{data.blockId === 'nodit-event'
								? 'Active'
								: data.blockId === 'error-handler'
								? 'Enabled'
								: data.blockId === 'csv-parser'
								? 'Headers'
								: data.blockId === 'cache-store'
								? 'Auto-expire'
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
						{data.blockId === 'email-received' && (
							<>
								<Input placeholder='Email address' className='h-5 text-xs' />
								<Badge variant='outline' className='text-xs'>
									<Mail className='w-2 h-2 mr-1' />
									IMAP
								</Badge>
							</>
						)}
						{data.blockId === 'api-poll' && (
							<>
								<Input placeholder='API URL' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										30s
									</Badge>
									<Badge variant='outline' className='text-xs'>
										JSON
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'nodit-action' && (
							<>
								<Input placeholder='Library ID' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='secondary' className='text-xs'>
										MCP
									</Badge>
									<Badge variant='outline' className='text-xs'>
										{data.configured ? 'Ready' : 'Setup'}
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'webhook-send' && (
							<>
								<Input placeholder='Webhook URL' className='h-5 text-xs' />
								<Badge variant='outline' className='text-xs'>
									POST
								</Badge>
							</>
						)}
						{data.blockId === 'slack-message' && (
							<>
								<Input placeholder='Channel' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										#general
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Bot
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'conditional' && (
							<>
								<Input placeholder='Variable' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										==
									</Badge>
									<Badge variant='outline' className='text-xs'>
										Value
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'loop' && (
							<>
								<Input placeholder='Array/List' className='h-5 text-xs' />
								<Badge variant='outline' className='text-xs'>
									<RotateCcw className='w-2 h-2 mr-1' />
									Each item
								</Badge>
							</>
						)}
						{data.blockId === 'data-mapper' && (
							<>
								<Input placeholder='Input field' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										→
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Output
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'database-insert' && (
							<>
								<Input placeholder='Table name' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										MySQL
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										INSERT
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'ai-classify' && (
							<>
								<Input placeholder='Text input' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										GPT-4
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Category
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'ai-translate' && (
							<>
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										EN
									</Badge>
									<Badge variant='outline' className='text-xs'>
										→
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										ES
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'push-notification' && (
							<>
								<Input placeholder='Title' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										<Smartphone className='w-2 h-2 mr-1' />
										Mobile
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Push
									</Badge>
								</div>
							</>
						)}
						{data.blockId === 'analytics-track' && (
							<>
								<Input placeholder='Event name' className='h-5 text-xs' />
								<div className='flex gap-1'>
									<Badge variant='outline' className='text-xs'>
										<BarChart className='w-2 h-2 mr-1' />
										Track
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										GA4
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

						{data.blockId === 'nodit-action' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='api-key'>API Key</Label>
										<Input
											id='api-key'
											type='password'
											placeholder='Enter your API key...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='library-id'>NODIT Library ID</Label>
										<Input
											id='library-id'
											placeholder='e.g., /org/project'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='function-name'>Function Name</Label>
										<Input
											id='function-name'
											placeholder='Enter function name...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='auth-type'>Authentication Type</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select auth type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='bearer'>Bearer Token</SelectItem>
												<SelectItem value='api-key'>API Key</SelectItem>
												<SelectItem value='oauth'>OAuth 2.0</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</>
						)}

						{data.blockId === 'conditional' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='value-a'>Value A</Label>
										<Input
											id='value-a'
											placeholder='First value...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='operator'>Operator</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select operator' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='equals'>Equals</SelectItem>
												<SelectItem value='contains'>Contains</SelectItem>
												<SelectItem value='greater'>Greater Than</SelectItem>
												<SelectItem value='less'>Less Than</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='value-b'>Value B</Label>
										<Input
											id='value-b'
											placeholder='Second value...'
											className='mt-1'
										/>
									</div>
								</div>
							</>
						)}

						{data.blockId === 'webhook' && (
							<>
								<Separator />
								<div className='space-y-3'>
									<div>
										<Label htmlFor='webhook-url'>Webhook URL</Label>
										<Input
											id='webhook-url'
											placeholder='https://...'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='http-method'>HTTP Method</Label>
										<Select>
											<SelectTrigger className='mt-1'>
												<SelectValue placeholder='Select method' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='get'>GET</SelectItem>
												<SelectItem value='post'>POST</SelectItem>
												<SelectItem value='put'>PUT</SelectItem>
												<SelectItem value='delete'>DELETE</SelectItem>
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
