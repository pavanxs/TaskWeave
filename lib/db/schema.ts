import { relations } from 'drizzle-orm';
import {
	pgTable,
	text,
	integer,
	timestamp,
	boolean,
	jsonb,
	uuid,
} from 'drizzle-orm/pg-core';

// User Management
export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	clerkId: text('clerk_id').notNull().unique(),
	email: text('email').notNull(),
	name: text('name'),
	tier: text('tier', {
		enum: ['FREE', 'PRO', 'UNLIMITED'],
	})
		.notNull()
		.default('FREE'),
	credits: integer('credits').default(100),
	noditApiKey: text('nodit_api_key'),
	openaiApiKey: text('openai_api_key'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Workflow Configuration
export const workflows = pgTable('workflows', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	triggerType: text('trigger_type').notNull(),
	triggerConfig: jsonb('trigger_config').$type<WorkflowTriggerConfig>(),
	flowPath: jsonb('flow_path').$type<string[]>(),
	isActive: boolean('is_active').notNull().default(true),
	publish: boolean('publish').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	// Enhanced fields for Nodit MCP and AI integration
	noditBlocks: jsonb('nodit_blocks').$type<NoditBlockConfig[]>(),
	aiBlocks: jsonb('ai_blocks').$type<AIBlockConfig[]>(),
	aiDecisionRules: jsonb('ai_decision_rules').$type<AIDecisionRule[]>(),
	networkIds: jsonb('network_ids').$type<string[]>(),
	executionCount: integer('execution_count').default(0),
	lastExecuted: timestamp('last_executed'),
});

// Blockchain Events and Triggers
export const blockchainEvents = pgTable('blockchain_events', {
	id: uuid('id').defaultRandom().primaryKey(),
	workflowId: uuid('workflow_id')
		.notNull()
		.references(() => workflows.id, { onDelete: 'cascade' }),
	eventType: text('event_type').notNull(),
	networkId: text('network_id').notNull(),
	blockNumber: integer('block_number'),
	transactionHash: text('transaction_hash'),
	contractAddress: text('contract_address'),
	eventData: jsonb('event_data').$type<Record<string, unknown>>(),
	processed: boolean('processed').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI Execution Logs
export const aiExecutionLogs = pgTable('ai_execution_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	workflowId: uuid('workflow_id')
		.notNull()
		.references(() => workflows.id, { onDelete: 'cascade' }),
	blockId: text('block_id').notNull(),
	modelUsed: text('model_used').notNull(),
	inputTokens: integer('input_tokens'),
	outputTokens: integer('output_tokens'),
	executionTime: integer('execution_time'), // milliseconds
	success: boolean('success').notNull(),
	result: jsonb('result').$type<Record<string, unknown>>(),
	errorMessage: text('error_message'),
	executedAt: timestamp('executed_at').notNull().defaultNow(),
});

// Nodit Connection Management
export const noditConnections = pgTable('nodit_connections', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	connectionName: text('connection_name').notNull(),
	apiKeyHash: text('api_key_hash').notNull(),
	supportedNetworks: jsonb('supported_networks').$type<string[]>(),
	lastTested: timestamp('last_tested'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI Decision Rules
export const aiDecisionRules = pgTable('ai_decision_rules', {
	id: uuid('id').defaultRandom().primaryKey(),
	workflowId: uuid('workflow_id')
		.notNull()
		.references(() => workflows.id, { onDelete: 'cascade' }),
	ruleName: text('rule_name').notNull(),
	condition: text('condition').notNull(),
	aiModel: text('ai_model').notNull().default('gpt-4'),
	systemPrompt: text('system_prompt'),
	confidenceThreshold: integer('confidence_threshold').default(80),
	trueFlowPath: jsonb('true_flow_path').$type<string[]>(),
	falseFlowPath: jsonb('false_flow_path').$type<string[]>(),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	workflows: many(workflows),
	noditConnections: many(noditConnections),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
	user: one(users, {
		fields: [workflows.userId],
		references: [users.id],
	}),
	blockchainEvents: many(blockchainEvents),
	aiExecutionLogs: many(aiExecutionLogs),
	aiDecisionRules: many(aiDecisionRules),
}));

export const blockchainEventsRelations = relations(
	blockchainEvents,
	({ one }) => ({
		workflow: one(workflows, {
			fields: [blockchainEvents.workflowId],
			references: [workflows.id],
		}),
	})
);

export const aiExecutionLogsRelations = relations(
	aiExecutionLogs,
	({ one }) => ({
		workflow: one(workflows, {
			fields: [aiExecutionLogs.workflowId],
			references: [workflows.id],
		}),
	})
);

export const noditConnectionsRelations = relations(
	noditConnections,
	({ one }) => ({
		user: one(users, {
			fields: [noditConnections.userId],
			references: [users.id],
		}),
	})
);

export const aiDecisionRulesRelations = relations(
	aiDecisionRules,
	({ one }) => ({
		workflow: one(workflows, {
			fields: [aiDecisionRules.workflowId],
			references: [workflows.id],
		}),
	})
);

// Type Definitions
export interface WorkflowTriggerConfig {
	type: 'webhook' | 'schedule' | 'blockchain_event' | 'manual';
	schedule?: string;
	webhookUrl?: string;
	eventFilters?: Record<string, unknown>;
	networkId?: string;
}

export interface NoditBlockConfig {
	blockId: string;
	operationId: string;
	networkId: string;
	parameters: Record<string, unknown>;
	outputMapping?: Record<string, string>;
}

export interface AIBlockConfig {
	blockId: string;
	model: string;
	systemPrompt: string;
	userPromptTemplate: string;
	maxTokens?: number;
	temperature?: number;
	outputFormat: 'text' | 'json' | 'structured';
	fallbackResponse?: string;
}

export interface AIDecisionRule {
	blockId: string;
	condition: string;
	confidenceThreshold: number;
	trueFlowPath: string[];
	falseFlowPath: string[];
}

// Export types for use in other files
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type BlockchainEvent = typeof blockchainEvents.$inferSelect;
export type NewBlockchainEvent = typeof blockchainEvents.$inferInsert;
export type AIExecutionLog = typeof aiExecutionLogs.$inferSelect;
export type NewAIExecutionLog = typeof aiExecutionLogs.$inferInsert;
export type NoditConnection = typeof noditConnections.$inferSelect;
export type NewNoditConnection = typeof noditConnections.$inferInsert;
