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
	type LucideIcon,
} from 'lucide-react';

// Type definitions
interface BlockData {
	id: string;
	label: string;
	icon: LucideIcon;
	type: 'trigger' | 'action' | 'logic';
}

interface CustomNodeData {
	label: string;
	icon: LucideIcon;
	blockType: 'trigger' | 'action' | 'logic';
	blockId: string;
	configured: boolean;
	[key: string]: unknown; // Add index signature
}

// Block types for the library
const blockCategories: {
	triggers: BlockData[];
	actions: BlockData[];
	logic: BlockData[];
} = {
	triggers: [
		{
			id: 'webhook',
			label: 'Webhook Listener',
			icon: Webhook,
			type: 'trigger',
		},
		{ id: 'nodit-event', label: 'NODIT MCP Event', icon: Zap, type: 'trigger' },
	],
	actions: [
		{
			id: 'nodit-action',
			label: 'NODIT MCP Action',
			icon: Zap,
			type: 'action',
		},
		{ id: 'email', label: 'Send Email', icon: Mail, type: 'action' },
		{ id: 'delay', label: 'Delay', icon: Clock, type: 'action' },
		{
			id: 'http-request',
			label: 'HTTP Request',
			icon: Database,
			type: 'action',
		},
	],
	logic: [
		{
			id: 'conditional',
			label: 'Conditional Logic',
			icon: GitBranch,
			type: 'logic',
		},
	],
};

// Custom node component
const CustomNode = ({
	data,
	selected,
}: {
	data: CustomNodeData;
	selected: boolean;
}) => {
	const IconComponent = data.icon;

	return (
		<div
			className={`px-4 py-2 border rounded-md bg-card text-card-foreground min-w-[150px] ${
				selected ? 'border-primary shadow-lg' : 'border-border'
			}`}>
			<div className='flex items-center gap-2'>
				<IconComponent className='w-4 h-4' />
				<span className='text-sm font-medium'>{data.label}</span>
			</div>
			{data.configured && (
				<div className='text-xs text-muted-foreground mt-1'>Configured</div>
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

	const onConnect = useCallback(
		(connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
		[]
	);

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
			];
			const originalBlock = allBlocks.find((b) => b.id === blockData.id);

			if (!originalBlock) return;

			const newNode: Node<CustomNodeData> = {
				id: `${blockData.id}-${Date.now()}`,
				type: 'custom',
				position,
				data: {
					label: blockData.label,
					icon: originalBlock.icon,
					blockType: originalBlock.type as 'trigger' | 'action' | 'logic',
					blockId: blockData.id,
					configured: false,
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
				defaultValue={['triggers', 'actions', 'logic']}>
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
							defaultViewport={{ x: 0, y: 0, zoom: 1 }}>
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
