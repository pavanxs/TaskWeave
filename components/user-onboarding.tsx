'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
	CheckCircle,
	AlertCircle,
	Key,
	Brain,
	Zap,
	Database,
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingStep {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	completed: boolean;
	required: boolean;
}

export function UserOnboarding() {
	useUser();
	const [loading, setLoading] = useState(false);
	const [noditApiKey, setNoditApiKey] = useState('');
	const [openaiApiKey, setOpenaiApiKey] = useState('');
	const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	const [steps, setSteps] = useState<OnboardingStep[]>([
		{
			id: 'api-keys',
			title: 'Configure API Keys',
			description:
				'Set up Nodit and OpenAI API keys for blockchain and AI operations',
			icon: <Key className='h-5 w-5' />,
			completed: false,
			required: true,
		},
		{
			id: 'test-connection',
			title: 'Test Connections',
			description: 'Verify your API keys work correctly',
			icon: <Zap className='h-5 w-5' />,
			completed: false,
			required: true,
		},
		{
			id: 'create-workflow',
			title: 'Create First Workflow',
			description: 'Build your first blockchain automation workflow',
			icon: <Brain className='h-5 w-5' />,
			completed: false,
			required: false,
		},
	]);

	useEffect(() => {
		checkApiKeysStatus();
	}, []);

	const checkApiKeysStatus = async () => {
		try {
			const response = await fetch('/api/user/status');
			const data = await response.json();

			if (data.success) {
				const hasNoditKey = data.data.hasNoditApiKey;
				const hasOpenAIKey = data.data.hasOpenaiApiKey;

				setApiKeysConfigured(hasNoditKey && hasOpenAIKey);

				setSteps((prev) =>
					prev.map((step) => {
						if (step.id === 'api-keys') {
							return { ...step, completed: hasNoditKey && hasOpenAIKey };
						}
						return step;
					})
				);

				if (hasNoditKey && hasOpenAIKey) {
					setCurrentStep(1);
				}
			}
		} catch (error) {
			console.error('Error checking API keys status:', error);
		}
	};

	const saveApiKeys = async () => {
		if (!noditApiKey || !openaiApiKey) {
			toast.error('Please provide both API keys');
			return;
		}

		setLoading(true);
		try {
			const response = await fetch('/api/user/configure', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					noditApiKey,
					openaiApiKey,
				}),
			});

			const data = await response.json();

			if (data.success) {
				toast.success('API keys configured successfully!');
				setApiKeysConfigured(true);
				setSteps((prev) =>
					prev.map((step) =>
						step.id === 'api-keys' ? { ...step, completed: true } : step
					)
				);
				setCurrentStep(1);

				// Clear the input fields for security
				setNoditApiKey('');
				setOpenaiApiKey('');
			} else {
				toast.error(data.error || 'Failed to save API keys');
			}
		} catch (error) {
			toast.error('Failed to save API keys');
			console.error('Error saving API keys:', error);
		} finally {
			setLoading(false);
		}
	};

	const testConnections = async () => {
		setLoading(true);
		try {
			// Test Nodit connection
			const noditTest = await fetch('/api/nodit/operations?action=categories');
			const noditData = await noditTest.json();

			// Test OpenAI connection
			const aiTest = await fetch('/api/ai/operations?action=models');
			const aiData = await aiTest.json();

			if (noditData.success && aiData.success) {
				toast.success('All connections tested successfully!');
				setSteps((prev) =>
					prev.map((step) =>
						step.id === 'test-connection' ? { ...step, completed: true } : step
					)
				);
				setCurrentStep(2);
			} else {
				toast.error('Connection test failed. Please check your API keys.');
			}
		} catch (error) {
			toast.error('Connection test failed');
			console.error('Error testing connections:', error);
		} finally {
			setLoading(false);
		}
	};

	const completedSteps = steps.filter((step) => step.completed).length;
	const progress = (completedSteps / steps.length) * 100;

	return (
		<div className='max-w-4xl mx-auto p-6 space-y-6'>
			<div className='text-center space-y-2'>
				<h1 className='text-3xl font-bold'>Welcome to NoditAuto!</h1>
				<p className='text-muted-foreground'>
					Let&apos;s get you set up with blockchain workflow automation
				</p>
				<div className='flex items-center justify-center space-x-2'>
					<Progress value={progress} className='w-64' />
					<span className='text-sm text-muted-foreground'>
						{completedSteps}/{steps.length} completed
					</span>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
				{steps.map((step, index) => (
					<Card
						key={step.id}
						className={`cursor-pointer transition-all ${
							step.completed
								? 'border-green-500 bg-green-50'
								: currentStep === index
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-200'
						}`}
						onClick={() => !step.completed && setCurrentStep(index)}>
						<CardHeader className='pb-3'>
							<div className='flex items-center space-x-2'>
								{step.completed ? (
									<CheckCircle className='h-5 w-5 text-green-500' />
								) : (
									step.icon
								)}
								<CardTitle className='text-sm'>{step.title}</CardTitle>
								{step.required && (
									<Badge variant='secondary' className='text-xs'>
										Required
									</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription className='text-xs'>
								{step.description}
							</CardDescription>
						</CardContent>
					</Card>
				))}
			</div>

			<Tabs value={steps[currentStep]?.id} className='w-full'>
				<TabsList className='grid w-full grid-cols-3'>
					{steps.map((step, index) => (
						<TabsTrigger
							key={step.id}
							value={step.id}
							disabled={index > currentStep && !step.completed}
							className='flex items-center space-x-2'>
							{step.completed && <CheckCircle className='h-4 w-4' />}
							<span>{step.title}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value='api-keys' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center space-x-2'>
								<Key className='h-5 w-5' />
								<span>API Key Configuration</span>
							</CardTitle>
							<CardDescription>
								Configure your Nodit and OpenAI API keys to enable blockchain
								and AI features
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<Alert>
								<AlertCircle className='h-4 w-4' />
								<AlertDescription>
									Your API keys are encrypted and stored securely. They&apos;re
									only used to make authenticated requests on your behalf.
								</AlertDescription>
							</Alert>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='nodit-key'>Nodit API Key</Label>
									<Input
										id='nodit-key'
										type='password'
										placeholder='Enter your Nodit API key'
										value={noditApiKey}
										onChange={(e) => setNoditApiKey(e.target.value)}
									/>
									<p className='text-xs text-muted-foreground'>
										Get your API key from{' '}
										<a
											href='https://developer.nodit.io'
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-500 hover:underline'>
											Nodit Developer Portal
										</a>
									</p>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='openai-key'>OpenAI API Key</Label>
									<Input
										id='openai-key'
										type='password'
										placeholder='Enter your OpenAI API key'
										value={openaiApiKey}
										onChange={(e) => setOpenaiApiKey(e.target.value)}
									/>
									<p className='text-xs text-muted-foreground'>
										Get your API key from{' '}
										<a
											href='https://platform.openai.com/api-keys'
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-500 hover:underline'>
											OpenAI Platform
										</a>
									</p>
								</div>
							</div>

							<Button
								onClick={saveApiKeys}
								disabled={loading || !noditApiKey || !openaiApiKey}
								className='w-full'>
								{loading ? 'Saving...' : 'Save API Keys'}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='test-connection' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center space-x-2'>
								<Zap className='h-5 w-5' />
								<span>Connection Testing</span>
							</CardTitle>
							<CardDescription>
								Test your API connections to ensure everything works correctly
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{apiKeysConfigured ? (
								<>
									<Alert>
										<CheckCircle className='h-4 w-4' />
										<AlertDescription>
											API keys are configured. Click the button below to test
											your connections.
										</AlertDescription>
									</Alert>

									<Button
										onClick={testConnections}
										disabled={loading}
										className='w-full'>
										{loading ? 'Testing Connections...' : 'Test Connections'}
									</Button>
								</>
							) : (
								<Alert>
									<AlertCircle className='h-4 w-4' />
									<AlertDescription>
										Please configure your API keys first before testing
										connections.
									</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='create-workflow' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center space-x-2'>
								<Brain className='h-5 w-5' />
								<span>Create Your First Workflow</span>
							</CardTitle>
							<CardDescription>
								Ready to build your first blockchain automation workflow!
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<Card className='border-dashed'>
									<CardHeader>
										<CardTitle className='text-sm'>
											Start from Template
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-xs text-muted-foreground mb-3'>
											Use pre-built templates for common automation patterns
										</p>
										<Button variant='outline' size='sm' className='w-full'>
											Browse Templates
										</Button>
									</CardContent>
								</Card>

								<Card className='border-dashed'>
									<CardHeader>
										<CardTitle className='text-sm'>
											Build from Scratch
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-xs text-muted-foreground mb-3'>
											Create a custom workflow using our visual editor
										</p>
										<Button size='sm' className='w-full'>
											Create Workflow
										</Button>
									</CardContent>
								</Card>
							</div>

							<Alert>
								<Database className='h-4 w-4' />
								<AlertDescription>
									You can always access this onboarding from your dashboard
									settings.
								</AlertDescription>
							</Alert>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
