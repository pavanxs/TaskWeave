import OpenAI from 'openai';
import { AIBlockConfig, AIDecisionRule } from '../db/schema';

export interface AIAnalysisResult {
	decision: boolean;
	confidence: number;
	reasoning: string;
	suggestedAction?: string;
	data?: Record<string, unknown>;
}

export interface AIPortfolioInsight {
	analysis: string;
	recommendations: string[];
	riskLevel: 'low' | 'medium' | 'high';
	diversificationScore: number;
	marketSentiment?: string;
}

export interface AITradingSignal {
	action: 'buy' | 'sell' | 'hold';
	confidence: number;
	reasoning: string;
	targetPrice?: number;
	stopLoss?: number;
	timeframe: string;
}

export class OpenAIClient {
	private client: OpenAI;
	private defaultModel: string;

	constructor(apiKey: string, defaultModel: string = 'gpt-4') {
		this.client = new OpenAI({
			apiKey: apiKey,
		});
		this.defaultModel = defaultModel;
	}

	// Execute AI block with custom configuration
	async executeAIBlock(
		blockConfig: AIBlockConfig,
		inputData: Record<string, unknown>,
		contextData?: Record<string, unknown>
	): Promise<Record<string, unknown>> {
		try {
			const userPrompt = this.interpolateTemplate(
				blockConfig.userPromptTemplate,
				{ ...inputData, ...contextData }
			);

			const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
				{ role: 'system', content: blockConfig.systemPrompt },
				{ role: 'user', content: userPrompt },
			];

			const response = await this.client.chat.completions.create({
				model: blockConfig.model || this.defaultModel,
				messages,
				max_tokens: blockConfig.maxTokens || 1000,
				temperature: blockConfig.temperature || 0.7,
				response_format:
					blockConfig.outputFormat === 'json'
						? { type: 'json_object' }
						: undefined,
			});

			const result = response.choices[0]?.message?.content;

			if (!result) {
				throw new Error('No response from AI model');
			}

			// Parse JSON response if specified
			if (blockConfig.outputFormat === 'json') {
				try {
					return JSON.parse(result);
				} catch (error) {
					console.error('Failed to parse JSON response:', error);
					return { error: 'Invalid JSON response', raw: result };
				}
			}

			return {
				response: result,
				model: blockConfig.model,
				tokensUsed: response.usage?.total_tokens || 0,
				executionTime: Date.now(),
			};
		} catch (error) {
			console.error('AI block execution failed:', error);

			if (blockConfig.fallbackResponse) {
				return { response: blockConfig.fallbackResponse, fallback: true };
			}

			throw error;
		}
	}

	// AI Decision Maker - evaluates conditions and makes routing decisions
	async makeDecision(
		rule: AIDecisionRule,
		contextData: Record<string, unknown>,
		blockchainData?: Record<string, unknown>
	): Promise<AIAnalysisResult> {
		try {
			const systemPrompt = `
You are an AI decision maker for blockchain workflow automation. 
Analyze the provided data and determine if the condition is met.

Condition to evaluate: "${rule.condition}"

Respond with a JSON object containing:
- decision: boolean (true if condition is met, false otherwise)
- confidence: number (0-1, where 1 is highest confidence)
- reasoning: string (detailed explanation of your decision)
- suggestedAction: string (optional recommendation)

Be precise and data-driven in your analysis.
      `;

			const userPrompt = `
Context Data: ${JSON.stringify(contextData, null, 2)}
${
	blockchainData
		? `Blockchain Data: ${JSON.stringify(blockchainData, null, 2)}`
		: ''
}

Please evaluate the condition and provide your analysis.
      `;

			const response = await this.client.chat.completions.create({
				model: this.defaultModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
				temperature: 0.3, // Lower temperature for more consistent decisions
			});

			const result = JSON.parse(response.choices[0]?.message?.content || '{}');

			return {
				decision: result.decision || false,
				confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
				reasoning: result.reasoning || 'No reasoning provided',
				suggestedAction: result.suggestedAction,
				data: result,
			};
		} catch (error) {
			console.error('AI decision making failed:', error);
			return {
				decision: false,
				confidence: 0,
				reasoning: 'AI decision making failed due to error',
				data: {
					error: error instanceof Error ? error.message : 'Unknown error',
				},
			};
		}
	}

	// Portfolio Analysis with AI insights
	async analyzePortfolio(
		portfolioData: Record<string, unknown>,
		marketData?: Record<string, unknown>,
		userPreferences?: Record<string, unknown>
	): Promise<AIPortfolioInsight> {
		try {
			const systemPrompt = `
You are an expert blockchain portfolio analyst. Analyze the provided portfolio data and provide insights.

Provide analysis on:
1. Portfolio composition and diversification
2. Risk assessment based on holdings
3. Market exposure and correlation
4. Recommendations for optimization
5. Current market sentiment impact

Respond with a JSON object containing:
- analysis: string (comprehensive portfolio analysis)
- recommendations: array of strings (actionable recommendations)
- riskLevel: 'low' | 'medium' | 'high'
- diversificationScore: number (0-100, where 100 is perfectly diversified)
- marketSentiment: string (current market sentiment analysis)
      `;

			const userPrompt = `
Portfolio Data: ${JSON.stringify(portfolioData, null, 2)}
${marketData ? `Market Data: ${JSON.stringify(marketData, null, 2)}` : ''}
${
	userPreferences
		? `User Preferences: ${JSON.stringify(userPreferences, null, 2)}`
		: ''
}

Please provide a comprehensive portfolio analysis.
      `;

			const response = await this.client.chat.completions.create({
				model: this.defaultModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
				temperature: 0.4,
			});

			const result = JSON.parse(response.choices[0]?.message?.content || '{}');

			return {
				analysis: result.analysis || 'No analysis provided',
				recommendations: result.recommendations || [],
				riskLevel: ['low', 'medium', 'high'].includes(result.riskLevel)
					? result.riskLevel
					: 'medium',
				diversificationScore: Math.min(
					Math.max(result.diversificationScore || 0, 0),
					100
				),
				marketSentiment: result.marketSentiment || 'neutral',
			};
		} catch (error) {
			console.error('Portfolio analysis failed:', error);
			return {
				analysis: 'Portfolio analysis failed due to error',
				recommendations: ['Unable to analyze portfolio at this time'],
				riskLevel: 'medium',
				diversificationScore: 0,
				marketSentiment: 'unknown',
			};
		}
	}

	// Generate AI-powered trading signals
	async generateTradingSignal(
		tokenData: Record<string, unknown>,
		marketData: Record<string, unknown>,
		userStrategy?: Record<string, unknown>
	): Promise<AITradingSignal> {
		try {
			const systemPrompt = `
You are an expert crypto trading analyst. Analyze the provided token and market data to generate trading signals.

Consider:
1. Price action and technical indicators
2. Market sentiment and trends
3. Volume and liquidity analysis
4. Risk-reward ratios
5. User strategy preferences

Respond with a JSON object containing:
- action: 'buy' | 'sell' | 'hold'
- confidence: number (0-1, where 1 is highest confidence)
- reasoning: string (detailed explanation of your signal)
- targetPrice: number (optional price target)
- stopLoss: number (optional stop loss price)
- timeframe: string (expected timeframe for signal)

Be conservative and prioritize risk management.
      `;

			const userPrompt = `
Token Data: ${JSON.stringify(tokenData, null, 2)}
Market Data: ${JSON.stringify(marketData, null, 2)}
${userStrategy ? `User Strategy: ${JSON.stringify(userStrategy, null, 2)}` : ''}

Please provide a trading signal with detailed analysis.
      `;

			const response = await this.client.chat.completions.create({
				model: this.defaultModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
				temperature: 0.3,
			});

			const result = JSON.parse(response.choices[0]?.message?.content || '{}');

			return {
				action: ['buy', 'sell', 'hold'].includes(result.action)
					? result.action
					: 'hold',
				confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
				reasoning: result.reasoning || 'No reasoning provided',
				targetPrice: result.targetPrice,
				stopLoss: result.stopLoss,
				timeframe: result.timeframe || 'short-term',
			};
		} catch (error) {
			console.error('Trading signal generation failed:', error);
			return {
				action: 'hold',
				confidence: 0,
				reasoning: 'Trading signal generation failed due to error',
				timeframe: 'unknown',
			};
		}
	}

	// AI-powered risk assessment
	async assessRisk(
		transactionData: Record<string, unknown>,
		walletData: Record<string, unknown>,
		networkData?: Record<string, unknown>
	): Promise<AIAnalysisResult> {
		try {
			const systemPrompt = `
You are an expert blockchain security analyst. Assess the risk of the provided transaction and wallet data.

Analyze:
1. Transaction patterns and anomalies
2. Wallet composition and history
3. Network security considerations
4. Potential red flags or suspicious activity
5. Overall risk level

Respond with a JSON object containing:
- decision: boolean (true if HIGH risk detected, false if low/medium risk)
- confidence: number (0-1, confidence in risk assessment)
- reasoning: string (detailed risk analysis)
- suggestedAction: string (recommended actions)

Be thorough and prioritize security.
      `;

			const userPrompt = `
Transaction Data: ${JSON.stringify(transactionData, null, 2)}
Wallet Data: ${JSON.stringify(walletData, null, 2)}
${networkData ? `Network Data: ${JSON.stringify(networkData, null, 2)}` : ''}

Please provide a comprehensive risk assessment.
      `;

			const response = await this.client.chat.completions.create({
				model: this.defaultModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
				temperature: 0.2,
			});

			const result = JSON.parse(response.choices[0]?.message?.content || '{}');

			return {
				decision: result.decision || false,
				confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
				reasoning: result.reasoning || 'No risk analysis provided',
				suggestedAction: result.suggestedAction || 'Monitor closely',
				data: result,
			};
		} catch (error) {
			console.error('Risk assessment failed:', error);
			return {
				decision: false,
				confidence: 0,
				reasoning: 'Risk assessment failed due to error',
				suggestedAction: 'Unable to assess risk at this time',
				data: {
					error: error instanceof Error ? error.message : 'Unknown error',
				},
			};
		}
	}

	// Process natural language queries about blockchain data
	async processQuery(
		query: string,
		availableData: Record<string, unknown>,
		supportedOperations?: string[]
	): Promise<Record<string, unknown>> {
		try {
			const systemPrompt = `
You are an AI assistant for blockchain data analysis. Process natural language queries and provide insights.

Available data: ${Object.keys(availableData).join(', ')}
${
	supportedOperations
		? `Supported operations: ${supportedOperations.join(', ')}`
		: ''
}

Respond with a JSON object containing:
- answer: string (direct answer to the query)
- insights: array of strings (additional insights)
- suggestedActions: array of strings (recommended next steps)
- dataUsed: array of strings (which data sources were used)

Be helpful and provide actionable insights.
      `;

			const userPrompt = `
Query: ${query}
Available Data: ${JSON.stringify(availableData, null, 2)}

Please process this query and provide insights.
      `;

			const response = await this.client.chat.completions.create({
				model: this.defaultModel,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				response_format: { type: 'json_object' },
				temperature: 0.5,
			});

			const result = JSON.parse(response.choices[0]?.message?.content || '{}');

			return {
				answer: result.answer || 'Unable to process query',
				insights: result.insights || [],
				suggestedActions: result.suggestedActions || [],
				dataUsed: result.dataUsed || [],
				rawResult: result,
			};
		} catch (error) {
			console.error('Query processing failed:', error);
			return {
				answer: 'Query processing failed due to error',
				insights: [],
				suggestedActions: [],
				dataUsed: [],
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	// Utility method to interpolate templates with data
	private interpolateTemplate(
		template: string,
		data: Record<string, unknown>
	): string {
		return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			return data[key] !== undefined ? String(data[key]) : match;
		});
	}

	// Get available AI models
	async getAvailableModels(): Promise<string[]> {
		try {
			const models = await this.client.models.list();
			return models.data
				.filter((model) => model.id.includes('gpt'))
				.map((model) => model.id);
		} catch (error) {
			console.error('Failed to fetch available models:', error);
			return ['gpt-3.5-turbo', 'gpt-4'];
		}
	}
}
