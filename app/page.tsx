'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	BarChart,
	Zap,
	Shield,
	Clock,
	TrendingUp,
	Bot,
	Layers,
	GitBranch,
	ArrowRight,
	CheckCircle,
	AlertTriangle,
	Database,
	Eye,
	Play,
} from 'lucide-react';

export default function Home() {
	const features = [
		{
			icon: BarChart,
			title: 'Smart Trading Automation',
			description:
				'Execute trades automatically based on price alerts, technical indicators, and AI-powered signals.',
		},
		{
			icon: Shield,
			title: 'Risk Management',
			description:
				'Built-in stop-loss, take-profit, and portfolio rebalancing to protect your investments.',
		},
		{
			icon: Eye,
			title: 'Smart Contract Monitoring',
			description:
				'Track blockchain events, monitor transactions, and react to on-chain activities.',
		},
		{
			icon: Bot,
			title: 'AI-Powered Insights',
			description:
				'Leverage machine learning for market sentiment analysis, price predictions, and trading signals.',
		},
		{
			icon: Layers,
			title: 'Multi-Chain Support',
			description:
				'Works across Ethereum, BSC, Polygon, Arbitrum, and other major blockchain networks.',
		},
		{
			icon: Clock,
			title: 'Real-Time Execution',
			description:
				'Lightning-fast execution with gas optimization and MEV protection.',
		},
	];

	const useCases = [
		{
			title: 'DeFi Yield Farming',
			description:
				'Automatically compound rewards, switch pools, and maximize yield across protocols.',
			tags: ['Automated', 'DeFi', 'Yield'],
		},
		{
			title: 'Portfolio Rebalancing',
			description:
				'Maintain target allocations and rebalance based on market conditions.',
			tags: ['Portfolio', 'Automated', 'Risk Management'],
		},
		{
			title: 'Arbitrage Trading',
			description:
				'Detect and execute arbitrage opportunities across exchanges and chains.',
			tags: ['Trading', 'Cross-chain', 'MEV'],
		},
		{
			title: 'Smart Contract Analytics',
			description:
				'Monitor contract events, track large transactions, and analyze on-chain data.',
			tags: ['Analytics', 'On-chain', 'Intelligence'],
		},
	];

  return (
		<div className='min-h-screen bg-background'>
			{/* Header */}
			<header className='border-b'>
				<div className='container mx-auto px-4 py-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Zap className='w-8 h-8 text-primary' />
						<span className='text-2xl font-bold'>NoditAuto</span>
					</div>
					<nav className='flex items-center gap-6'>
						<Link
							href='#features'
							className='text-muted-foreground hover:text-foreground transition-colors'>
							Features
						</Link>
						<Link
							href='#use-cases'
							className='text-muted-foreground hover:text-foreground transition-colors'>
							Use Cases
						</Link>
						<Link href='/project'>
							<Button>
								Get Started
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
						Blockchain Automation for
						<br />
						Smart Trading & DeFi
					</h1>
					<p className='text-xl text-muted-foreground mb-8 max-w-3xl mx-auto'>
						Build sophisticated blockchain automation workflows with
						drag-and-drop simplicity. Execute trades, monitor contracts, and
						manage portfolios automatically across multiple chains.
					</p>
					<div className='flex gap-4 justify-center'>
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
				</div>
			</section>

			{/* Features Section */}
			<section id='features' className='py-20 px-4 bg-muted/50'>
				<div className='container mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold mb-4'>
							Everything you need for blockchain automation
						</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							From simple price alerts to complex multi-chain arbitrage
							strategies, NoditAuto provides all the tools you need.
						</p>
					</div>
					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{features.map((feature, index) => (
							<Card key={index} className='hover:shadow-lg transition-shadow'>
								<CardHeader>
									<feature.icon className='w-12 h-12 text-primary mb-4' />
									<CardTitle>{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground'>{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Use Cases Section */}
			<section id='use-cases' className='py-20 px-4'>
				<div className='container mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold mb-4'>
							Real-world automation scenarios
						</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							See how traders and DeFi users are leveraging NoditAuto to
							maximize their blockchain operations.
						</p>
					</div>
					<div className='grid md:grid-cols-2 gap-8'>
						{useCases.map((useCase, index) => (
							<Card key={index} className='hover:shadow-lg transition-shadow'>
								<CardHeader>
									<CardTitle className='flex items-start justify-between'>
										{useCase.title}
										<GitBranch className='w-5 h-5 text-primary' />
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground mb-4'>
										{useCase.description}
									</p>
									<div className='flex gap-2 flex-wrap'>
										{useCase.tags.map((tag, tagIndex) => (
											<Badge key={tagIndex} variant='outline'>
												{tag}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className='py-20 px-4 bg-muted/50'>
				<div className='container mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold mb-4'>How it works</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Three simple steps to automate your blockchain operations
						</p>
					</div>
					<div className='grid md:grid-cols-3 gap-8'>
						<div className='text-center'>
							<div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4'>
								<span className='text-2xl font-bold text-primary-foreground'>
									1
								</span>
							</div>
							<h3 className='text-xl font-semibold mb-2'>Drag & Drop Blocks</h3>
							<p className='text-muted-foreground'>
								Choose from triggers, actions, logic, and AI blocks to build
								your workflow
							</p>
						</div>
						<div className='text-center'>
							<div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4'>
								<span className='text-2xl font-bold text-primary-foreground'>
									2
								</span>
							</div>
							<h3 className='text-xl font-semibold mb-2'>Configure Logic</h3>
							<p className='text-muted-foreground'>
								Set up conditions, parameters, and connect to your wallets and
								exchanges
							</p>
						</div>
						<div className='text-center'>
							<div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4'>
								<span className='text-2xl font-bold text-primary-foreground'>
									3
								</span>
							</div>
							<h3 className='text-xl font-semibold mb-2'>Deploy & Monitor</h3>
							<p className='text-muted-foreground'>
								Launch your automation and monitor performance in real-time
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Security & Trust */}
			<section className='py-20 px-4'>
				<div className='container mx-auto'>
					<div className='text-center mb-16'>
						<h2 className='text-4xl font-bold mb-4'>
							Built for security & trust
						</h2>
						<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
							Your funds and data are protected with enterprise-grade security
						</p>
					</div>
					<div className='grid md:grid-cols-3 gap-8'>
						<div className='text-center'>
							<Shield className='w-12 h-12 text-green-500 mx-auto mb-4' />
							<h3 className='text-lg font-semibold mb-2'>Non-Custodial</h3>
							<p className='text-muted-foreground'>
								Your keys, your crypto. We never hold your funds
							</p>
						</div>
						<div className='text-center'>
							<CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-4' />
							<h3 className='text-lg font-semibold mb-2'>Open Source</h3>
							<p className='text-muted-foreground'>
								Transparent code that you can audit and verify
							</p>
						</div>
						<div className='text-center'>
							<AlertTriangle className='w-12 h-12 text-orange-500 mx-auto mb-4' />
							<h3 className='text-lg font-semibold mb-2'>Risk Controls</h3>
							<p className='text-muted-foreground'>
								Built-in safeguards and limits to protect your portfolio
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 px-4 bg-primary text-primary-foreground'>
				<div className='container mx-auto text-center'>
					<h2 className='text-4xl font-bold mb-4'>
						Ready to automate your blockchain operations?
					</h2>
					<p className='text-xl mb-8 opacity-90'>
						Join thousands of traders and DeFi users who trust NoditAuto with
						their automation.
					</p>
					<div className='flex gap-4 justify-center'>
						<Link href='/project'>
							<Button
								size='lg'
								variant='secondary'
								className='text-lg px-8 py-4'>
								<Play className='w-5 h-5 mr-2' />
								Build Your First Workflow
							</Button>
						</Link>
						<Button
							size='lg'
							variant='outline'
							className='text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary'>
							<TrendingUp className='w-5 h-5 mr-2' />
							View Examples
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t py-12 px-4'>
				<div className='container mx-auto'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Zap className='w-6 h-6 text-primary' />
							<span className='text-lg font-semibold'>NoditAuto</span>
						</div>
						<div className='flex gap-6'>
							<Link
								href='#'
								className='text-muted-foreground hover:text-foreground transition-colors'>
								Documentation
							</Link>
							<Link
								href='#'
								className='text-muted-foreground hover:text-foreground transition-colors'>
								Support
							</Link>
							<Link
								href='#'
								className='text-muted-foreground hover:text-foreground transition-colors'>
								GitHub
							</Link>
						</div>
					</div>
					<div className='mt-8 pt-8 border-t text-center text-muted-foreground'>
						<p>
							© 2024 NoditAuto. Built with NODIT MCP for blockchain automation.
						</p>
					</div>
        </div>
      </footer>
    </div>
  );
}
