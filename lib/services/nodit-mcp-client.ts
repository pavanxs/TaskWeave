import axios, { AxiosInstance } from 'axios';

export interface NoditMCPTool {
	name: string;
	description: string;
	schema: {
		type: string;
		properties: Record<string, unknown>;
		required: string[];
	};
}

export interface NoditAPICategory {
	name: string;
	description: string;
	operations: string[];
}

export interface NoditAPIOperation {
	operationId: string;
	summary: string;
	description: string;
	parameters: Record<string, unknown>;
	responses: Record<string, unknown>;
}

export class NoditMCPClient {
	private apiKey: string;
	private baseURL: string;
	private axiosInstance: AxiosInstance;

	constructor(apiKey: string, baseURL: string = 'https://web3.nodit.io/v1') {
		this.apiKey = apiKey;
		this.baseURL = baseURL;

		this.axiosInstance = axios.create({
			baseURL: this.baseURL,
			headers: {
				'X-API-KEY': this.apiKey,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			timeout: 30000,
		});
	}

	// List available API categories
	async listApiCategories(): Promise<NoditAPICategory[]> {
		try {
			// Since Nodit MCP Server provides tools for API discovery
			const categories = [
				{
					name: 'Node APIs',
					description: 'Direct blockchain node access and RPC calls',
					operations: [
						'eth_getBalance',
						'eth_sendRawTransaction',
						'eth_call',
						'eth_getTransactionReceipt',
					],
				},
				{
					name: 'Data APIs',
					description: 'High-level processed blockchain data',
					operations: [
						'getTokensOwnedByAccount',
						'getTokenTransfersByAccount',
						'getNftsOwnedByAccount',
					],
				},
				{
					name: 'Analytics APIs',
					description: 'Advanced blockchain analytics and insights',
					operations: [
						'getTokenPrice',
						'getPortfolioAnalysis',
						'getRiskAssessment',
					],
				},
			];

			return categories;
		} catch (error) {
			console.error('Error listing API categories:', error);
			throw new Error('Failed to list API categories');
		}
	}

	// List available operations for Node APIs
	async listNodeApis(): Promise<NoditAPIOperation[]> {
		try {
			const operations = [
				{
					operationId: 'eth_getBalance',
					summary: 'Get account balance',
					description: 'Get the balance of an account',
					parameters: {
						accountAddress: {
							type: 'string',
							required: true,
							description: 'Ethereum address',
						},
					},
					responses: { '200': { description: 'Balance in wei' } },
				},
				{
					operationId: 'eth_sendRawTransaction',
					summary: 'Send raw transaction',
					description: 'Broadcast a signed transaction',
					parameters: {
						signedTransaction: {
							type: 'string',
							required: true,
							description: 'Signed transaction hex',
						},
					},
					responses: { '200': { description: 'Transaction hash' } },
				},
				{
					operationId: 'eth_call',
					summary: 'Call contract function',
					description: 'Execute a contract function call',
					parameters: {
						to: {
							type: 'string',
							required: true,
							description: 'Contract address',
						},
						data: {
							type: 'string',
							required: true,
							description: 'Encoded function call',
						},
					},
					responses: { '200': { description: 'Function result' } },
				},
			];

			return operations;
		} catch (error) {
			console.error('Error listing node APIs:', error);
			throw new Error('Failed to list node APIs');
		}
	}

	// List available operations for Data APIs
	async listDataApis(): Promise<NoditAPIOperation[]> {
		try {
			const operations = [
				{
					operationId: 'getNativeBalanceByAccount',
					summary: 'Get native token balance',
					description: 'Get native token balance for an account',
					parameters: {
						accountAddress: {
							type: 'string',
							required: true,
							description: 'Account address',
						},
					},
					responses: { '200': { description: 'Native balance' } },
				},
				{
					operationId: 'getTokensOwnedByAccount',
					summary: 'Get owned tokens',
					description: 'Get all tokens owned by an account',
					parameters: {
						accountAddress: {
							type: 'string',
							required: true,
							description: 'Account address',
						},
						withMetadata: {
							type: 'boolean',
							required: false,
							description: 'Include token metadata',
						},
					},
					responses: { '200': { description: 'List of owned tokens' } },
				},
				{
					operationId: 'getTokenTransfersByAccount',
					summary: 'Get token transfers',
					description: 'Get token transfer history for an account',
					parameters: {
						accountAddress: {
							type: 'string',
							required: true,
							description: 'Account address',
						},
						page: {
							type: 'number',
							required: false,
							description: 'Page number',
						},
						rpp: {
							type: 'number',
							required: false,
							description: 'Results per page',
						},
					},
					responses: { '200': { description: 'Token transfer history' } },
				},
				{
					operationId: 'getNftsOwnedByAccount',
					summary: 'Get owned NFTs',
					description: 'Get all NFTs owned by an account',
					parameters: {
						accountAddress: {
							type: 'string',
							required: true,
							description: 'Account address',
						},
						withMetadata: {
							type: 'boolean',
							required: false,
							description: 'Include NFT metadata',
						},
					},
					responses: { '200': { description: 'List of owned NFTs' } },
				},
			];

			return operations;
		} catch (error) {
			console.error('Error listing data APIs:', error);
			throw new Error('Failed to list data APIs');
		}
	}

	// Get API specification for a specific operation
	async getApiSpec(operationId: string): Promise<NoditAPIOperation> {
		try {
			// Mock implementation - in real scenario, this would fetch from Nodit MCP server
			const mockSpec: NoditAPIOperation = {
				operationId,
				summary: `Operation ${operationId}`,
				description: `Execute ${operationId} operation`,
				parameters: {},
				responses: { '200': { description: 'Operation successful' } },
			};

			return mockSpec;
		} catch (error) {
			console.error(`Error getting API spec for ${operationId}:`, error);
			throw new Error(`Failed to get API spec for ${operationId}`);
		}
	}

	// Main API call method
	async callApi(
		operationId: string,
		parameters: Record<string, unknown>,
		network: string
	): Promise<Record<string, unknown>> {
		try {
			console.log(
				`Calling ${operationId} on ${network} with params:`,
				parameters
			);

			const response = await this.axiosInstance.post(
				`/${network}/${operationId}`,
				parameters
			);

			return response.data;
		} catch (error) {
			console.error(`API call failed for ${operationId}:`, error);
			throw error;
		}
	}

	// Specific blockchain operations
	async getTokenPrice(
		network: string,
		tokenAddress: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/token/${tokenAddress}/price`
			);
			return response.data;
		} catch (error) {
			console.error('Token price fetch failed:', error);
			return { error: 'Failed to fetch token price', details: error };
		}
	}

	async getNativeBalance(
		network: string,
		accountAddress: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/account/${accountAddress}/balance`
			);
			return response.data;
		} catch (error) {
			console.error('Native balance fetch failed:', error);
			return { error: 'Failed to fetch native balance', details: error };
		}
	}

	async getTransactionsByAccount(
		network: string,
		accountAddress: string,
		options?: Record<string, unknown>
	): Promise<Record<string, unknown>> {
		try {
			const params = new URLSearchParams();
			if (options?.page) params.append('page', String(options.page));
			if (options?.rpp) params.append('rpp', String(options.rpp));

			const response = await this.axiosInstance.get(
				`/${network}/account/${accountAddress}/transactions?${params}`
			);
			return response.data;
		} catch (error) {
			console.error('Transaction history fetch failed:', error);
			return { error: 'Failed to fetch transaction history', details: error };
		}
	}

	async getTokensOwned(
		network: string,
		accountAddress: string,
		withMetadata: boolean = true
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/account/${accountAddress}/tokens?withMetadata=${withMetadata}`
			);
			return response.data;
		} catch (error) {
			console.error('Tokens owned fetch failed:', error);
			return { error: 'Failed to fetch owned tokens', details: error };
		}
	}

	async getNftsOwned(
		network: string,
		accountAddress: string,
		withMetadata: boolean = true
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/account/${accountAddress}/nfts?withMetadata=${withMetadata}`
			);
			return response.data;
		} catch (error) {
			console.error('NFTs owned fetch failed:', error);
			return { error: 'Failed to fetch owned NFTs', details: error };
		}
	}

	async getPortfolioAnalysis(
		network: string,
		accountAddress: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/account/${accountAddress}/portfolio`
			);
			return response.data;
		} catch (error) {
			console.error('Portfolio analysis failed:', error);
			return {
				error: 'Failed to fetch portfolio analysis',
				details: error,
				mockData: {
					totalValue: 0,
					tokens: [],
					nfts: [],
					riskScore: 'unknown',
				},
			};
		}
	}

	async getRiskAssessment(
		network: string,
		accountAddress: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/account/${accountAddress}/risk`
			);
			return response.data;
		} catch (error) {
			console.error('Risk assessment failed:', error);
			return {
				error: 'Failed to fetch risk assessment',
				details: error,
				mockData: {
					riskLevel: 'unknown',
					factors: [],
					recommendations: [],
				},
			};
		}
	}

	// Block and transaction methods
	async getLatestBlock(network: string): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(`/${network}/block/latest`);
			return response.data;
		} catch (error) {
			console.error('Latest block fetch failed:', error);
			return { error: 'Failed to fetch latest block', details: error };
		}
	}

	async getBlockByNumber(
		network: string,
		blockNumber: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/block/${blockNumber}`
			);
			return response.data;
		} catch (error) {
			console.error('Block fetch failed:', error);
			return { error: 'Failed to fetch block', details: error };
		}
	}

	async getTransactionByHash(
		network: string,
		txHash: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/transaction/${txHash}`
			);
			return response.data;
		} catch (error) {
			console.error('Transaction fetch failed:', error);
			return { error: 'Failed to fetch transaction', details: error };
		}
	}

	async getTransactionReceipt(
		network: string,
		txHash: string
	): Promise<Record<string, unknown>> {
		try {
			const response = await this.axiosInstance.get(
				`/${network}/transaction/${txHash}/receipt`
			);
			return response.data;
		} catch (error) {
			console.error('Transaction receipt fetch failed:', error);
			return { error: 'Failed to fetch transaction receipt', details: error };
		}
	}
}
