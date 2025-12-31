import { pgTable, text, serial, integer, jsonb, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "god_admin"]);

// Plan types enum
export const planTypeEnum = pgEnum("plan_type", ["free", "credits_low", "credits_high", "unlimited"]);

// Enhanced User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").default("user").notNull(),
  planType: planTypeEnum("plan_type").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// API key status enum
export const apiKeyStatusEnum = pgEnum("api_key_status", ["active", "inactive", "problem"]);

// LLM type enum - Updated for GPT-5 stack with Gemini, Mistral, Llama fallbacks
export const llmTypeEnum = pgEnum("llm_type", [
  "gpt_5_nano",           // OpenAI GPT-5 Nano - Free/Basic primary
  "gpt_5_2",              // OpenAI GPT-5.2 - Pro/Unlimited primary
  "gemini_2_5_flash",     // Google Gemini 2.5 Flash - All tiers secondary
  "mistral_small_2025",   // Mistral Small 2025 - All tiers tertiary
  "llama_3_1_small"       // Meta Llama 3.1 Small - All tiers quaternary
]);

// OCR provider enum - Updated provider list
export const ocrProviderEnum = pgEnum("ocr_provider", [
  "techvision",           // TechVision - House/budget OCR (Tesseract-like)
  "google_vision",        // Google Cloud Vision - Primary OCR
  "azure_vision",         // Azure Computer Vision - Secondary OCR
  "aws_textract"          // AWS Textract - Forms/tables (Pro/Unlimited only)
]);

// Plan tier enum for orchestrator routing (maps to pricing tiers)
export const planTierEnum = pgEnum("plan_tier", [
  "free",                 // Free tier
  "medium",               // Basic $19 and Pro $49
  "premium"               // Unlimited $99
]);

// Plan name enum for specific plan identification
export const planNameEnum = pgEnum("plan_name", [
  "free",
  "basic",                // $19/mo
  "pro",                  // $49/mo  
  "unlimited"             // $99/mo
]);

// API keys table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  llmType: llmTypeEnum("llm_type").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  status: apiKeyStatusEnum("status").default("active").notNull(),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cloud storage providers enum
export const cloudProviderEnum = pgEnum("cloud_provider", ["dropbox", "google_drive"]);

// Cloud connections table
export const cloudConnections = pgTable("cloud_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: cloudProviderEnum("provider").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Folders table for organizing files
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  path: text("path").notNull(),
  parentId: integer("parent_id"),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  isAutomated: boolean("is_automated").default(false),
  autoRules: jsonb("auto_rules"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// File table for tracking files (enhanced with user relationship)
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "set null" }),
  originalName: text("original_name").notNull(),
  newName: text("new_name").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),
  path: text("path").notNull(),
  cloudProvider: cloudProviderEnum("cloud_provider"),
  cloudFileId: text("cloud_file_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Preset table for saving custom presets (enhanced with user relationship)
export const presets = pgTable("presets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  pattern: text("pattern").notNull(),
  isCustom: boolean("is_custom").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// File history table for tracking rename operations
export const fileHistory = pgTable("file_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originalName: text("original_name").notNull(),
  newName: text("new_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  renamePattern: text("rename_pattern"),
  usedAI: boolean("used_ai").default(false),
  aiModel: text("ai_model"),
  details: jsonb("details"),
  renamedAt: timestamp("renamed_at").defaultNow().notNull(),
});

// AI feature status enum
export const aiFeatureStatusEnum = pgEnum("ai_feature_status", ["active", "inactive", "problem"]);

// Agent status enum
export const agentStatusEnum = pgEnum("agent_status", ["idle", "running", "completed", "failed"]);

// Agent types enum
export const agentTypeEnum = pgEnum("agent_type", [
  "file_organizer", 
  "content_analyzer", 
  "batch_processor", 
  "file_sync",
  "intelligent_categorization",
  "performance_optimization",
  "file_annotation",
  "file_preview",
  "custom"
]);

// AI Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: agentTypeEnum("type").notNull(),
  description: text("description").notNull(),
  status: agentStatusEnum("status").default("idle").notNull(),
  config: jsonb("config"),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI features table
export const aiFeatures = pgTable("ai_features", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  featureId: text("feature_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: aiFeatureStatusEnum("status").default("inactive").notNull(),
  requiredLlmType: text("required_llm_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document segment type enum
export const documentSegmentTypeEnum = pgEnum("document_segment_type", [
  "pdf_management",
  "finance",
  "document_management",
  "collaboration_workflow",
  "legal",
  "search_retrieval",
  "custom"
]);

// Document segment templates
export const documentSegmentTemplates = pgTable("document_segment_templates", {
  id: serial("id").primaryKey(),
  segmentType: documentSegmentTypeEnum("segment_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Renaming conversations for document segments
export const renamingConversations = pgTable("renaming_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  segmentTemplateId: integer("segment_template_id").references(() => documentSegmentTemplates.id),
  title: text("title").notNull(),
  conversation: jsonb("conversation").notNull(),
  context: jsonb("context"),
  examples: jsonb("examples"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(apiKeys),
  cloudConnections: many(cloudConnections),
  folders: many(folders),
  files: many(files),
  presets: many(presets),
  fileHistory: many(fileHistory),
  aiFeatures: many(aiFeatures),
  agents: many(agents),
  renamingConversations: many(renamingConversations),
}));

export const agentsRelations = relations(agents, ({ one }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const cloudConnectionsRelations = relations(cloudConnections, ({ one }) => ({
  user: one(users, {
    fields: [cloudConnections.userId],
    references: [users.id],
  }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}));

export const presetsRelations = relations(presets, ({ one }) => ({
  user: one(users, {
    fields: [presets.userId],
    references: [users.id],
  }),
}));

export const fileHistoryRelations = relations(fileHistory, ({ one }) => ({
  user: one(users, {
    fields: [fileHistory.userId],
    references: [users.id],
  }),
}));

export const aiFeaturesRelations = relations(aiFeatures, ({ one }) => ({
  user: one(users, {
    fields: [aiFeatures.userId],
    references: [users.id],
  }),
}));

export const documentSegmentTemplatesRelations = relations(documentSegmentTemplates, ({ many }) => ({
  renamingConversations: many(renamingConversations),
}));

export const renamingConversationsRelations = relations(renamingConversations, ({ one }) => ({
  user: one(users, {
    fields: [renamingConversations.userId],
    references: [users.id],
  }),
  segmentTemplate: one(documentSegmentTemplates, {
    fields: [renamingConversations.segmentTemplateId],
    references: [documentSegmentTemplates.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  status: true,
  lastUsed: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCloudConnectionSchema = createInsertSchema(cloudConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPresetSchema = createInsertSchema(presets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileHistorySchema = createInsertSchema(fileHistory).omit({
  id: true,
  renamedAt: true,
});

export const insertAIFeatureSchema = createInsertSchema(aiFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  lastRun: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSegmentTemplateSchema = createInsertSchema(documentSegmentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRenamingConversationSchema = createInsertSchema(renamingConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertCloudConnection = z.infer<typeof insertCloudConnectionSchema>;
export type CloudConnection = typeof cloudConnections.$inferSelect;

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type Preset = typeof presets.$inferSelect;

export type InsertFileHistory = z.infer<typeof insertFileHistorySchema>;
export type FileHistory = typeof fileHistory.$inferSelect;

export type InsertAIFeature = z.infer<typeof insertAIFeatureSchema>;
export type AIFeature = typeof aiFeatures.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertDocumentSegmentTemplate = z.infer<typeof insertDocumentSegmentTemplateSchema>;
export type DocumentSegmentTemplate = typeof documentSegmentTemplates.$inferSelect;

export type InsertRenamingConversation = z.infer<typeof insertRenamingConversationSchema>;
export type RenamingConversation = typeof renamingConversations.$inferSelect;

// ====== System Administration Tables ======

// Provider type enum for admin management
export const providerTypeEnum = pgEnum("provider_type", ["ai", "cloud", "ocr"]);

// Provider status enum
export const providerStatusEnum = pgEnum("provider_status", ["active", "inactive", "problem", "testing"]);

// Priority type enum
export const priorityTypeEnum = pgEnum("priority_type", ["primary", "secondary", "tertiary", "optional"]);

// Provider configurations table (for admin API key management)
export const providerConfigs = pgTable("provider_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: providerTypeEnum("type").notNull(),
  category: text("category").notNull(),
  apiKey: text("api_key"),
  status: providerStatusEnum("status").default("inactive").notNull(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  isBackup: boolean("is_backup").default(false).notNull(),
  backupPriority: integer("backup_priority").default(0),
  latency: integer("latency"),
  lastTested: timestamp("last_tested"),
  usageCurrent: integer("usage_current").default(0),
  usageLimit: integer("usage_limit").default(100000),
  usageCost: integer("usage_cost").default(0),
  costRate: text("cost_rate"),
  models: jsonb("models"),
  planConfigs: jsonb("plan_configs"),
  supportAgentEnabled: boolean("support_agent_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Health snapshots table (for system status monitoring)
export const healthSnapshots = pgTable("health_snapshots", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  serviceType: text("service_type").notNull(),
  status: text("status").notNull(),
  latency: integer("latency"),
  errorMessage: text("error_message"),
  details: jsonb("details"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

// Key backups table
export const keyBackups = pgTable("key_backups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  backupData: jsonb("backup_data").notNull(),
  providerCount: integer("provider_count").default(0),
  size: integer("size").default(0),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Test runs table (for auto-testing)
export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  testName: text("test_name").notNull(),
  testType: text("test_type").notNull(),
  status: text("status").notNull(),
  duration: integer("duration"),
  results: jsonb("results"),
  errorMessage: text("error_message"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System alerts/problems table
export const alertSeverityEnum = pgEnum("alert_severity", ["critical", "warning", "info"]);
export const alertStatusEnum = pgEnum("alert_status", ["active", "acknowledged", "resolved"]);

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  status: alertStatusEnum("status").default("active").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  reason: text("reason"),
  fixAction: text("fix_action"),
  fixLink: text("fix_link"),
  autoFixAvailable: boolean("auto_fix_available").default(false),
  detectedBy: text("detected_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertProviderConfigSchema = createInsertSchema(providerConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthSnapshotSchema = createInsertSchema(healthSnapshots).omit({
  id: true,
  checkedAt: true,
});

export const insertKeyBackupSchema = createInsertSchema(keyBackups).omit({
  id: true,
  createdAt: true,
});

export const insertTestRunSchema = createInsertSchema(testRuns).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type InsertProviderConfig = z.infer<typeof insertProviderConfigSchema>;
export type ProviderConfig = typeof providerConfigs.$inferSelect;

export type InsertHealthSnapshot = z.infer<typeof insertHealthSnapshotSchema>;
export type HealthSnapshot = typeof healthSnapshots.$inferSelect;

export type InsertKeyBackup = z.infer<typeof insertKeyBackupSchema>;
export type KeyBackup = typeof keyBackups.$inferSelect;

export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type TestRun = typeof testRuns.$inferSelect;

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;

// ====== New Feature Tables ======

// Naming template category enum
export const namingTemplateCategoryEnum = pgEnum("naming_template_category", [
  "research", "financial", "design", "medical", "agile", "general", "custom"
]);

// Naming templates table (Research, Financial, Design, Medical, Agile, General)
export const namingTemplates = pgTable("naming_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: namingTemplateCategoryEnum("category").notNull(),
  pattern: text("pattern").notNull(),
  dateFormat: text("date_format").notNull(),
  separator: text("separator").notNull(),
  fields: jsonb("fields").notNull(),
  examples: jsonb("examples").notNull(),
  tips: text("tips"),
  isSystem: boolean("is_system").default(false).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Abbreviations dictionary table
export const abbreviations = pgTable("abbreviations", {
  id: serial("id").primaryKey(),
  fullText: text("full_text").notNull(),
  abbreviation: text("abbreviation").notNull(),
  category: text("category").notNull(),
  isSystem: boolean("is_system").default(true).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job queue status enum
export const jobStatusEnum = pgEnum("job_status", ["pending", "processing", "completed", "failed", "cancelled"]);

// Job queue table for background file processing
export const jobQueue = pgTable("job_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(),
  status: jobStatusEnum("status").default("pending").notNull(),
  priority: integer("priority").default(0).notNull(),
  progress: integer("progress").default(0).notNull(),
  totalItems: integer("total_items").default(0).notNull(),
  completedItems: integer("completed_items").default(0).notNull(),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  errorMessage: text("error_message"),
  providerUsed: text("provider_used"),
  processingTimeMs: integer("processing_time_ms"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Custom instructions table for user naming preferences
export const customInstructions = pgTable("custom_instructions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  namingStyle: text("naming_style").default("auto").notNull(),
  separator: text("separator").default("underscore").notNull(),
  dateFormat: text("date_format").default("YYYY-MM-DD").notNull(),
  datePosition: text("date_position").default("prefix").notNull(),
  customPrefix: text("custom_prefix").default(""),
  customSuffix: text("custom_suffix").default(""),
  maxLength: integer("max_length").default(100).notNull(),
  outputLanguage: text("output_language").default("en").notNull(),
  customPrompt: text("custom_prompt"),
  preserveExtension: boolean("preserve_extension").default(true).notNull(),
  lowercaseOutput: boolean("lowercase_output").default(false).notNull(),
  removeSpecialChars: boolean("remove_special_chars").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API metrics table for per-provider tracking
export const apiMetrics = pgTable("api_metrics", {
  id: serial("id").primaryKey(),
  providerName: text("provider_name").notNull(),
  endpoint: text("endpoint"),
  requestCount: integer("request_count").default(0).notNull(),
  successCount: integer("success_count").default(0).notNull(),
  errorCount: integer("error_count").default(0).notNull(),
  totalLatencyMs: integer("total_latency_ms").default(0).notNull(),
  avgLatencyMs: integer("avg_latency_ms").default(0).notNull(),
  minLatencyMs: integer("min_latency_ms"),
  maxLatencyMs: integer("max_latency_ms"),
  lastRequestAt: timestamp("last_request_at"),
  lastErrorAt: timestamp("last_error_at"),
  lastErrorMessage: text("last_error_message"),
  periodStart: timestamp("period_start").defaultNow().notNull(),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// File hash cache for deduplication and memory management
export const fileHashCache = pgTable("file_hash_cache", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  fileHash: text("file_hash").notNull(),
  fileName: text("file_name").notNull(),
  suggestedName: text("suggested_name"),
  fileSize: integer("file_size"),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Insert schemas for new tables
export const insertNamingTemplateSchema = createInsertSchema(namingTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAbbreviationSchema = createInsertSchema(abbreviations).omit({
  id: true,
  createdAt: true,
});

export const insertJobQueueSchema = createInsertSchema(jobQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomInstructionsSchema = createInsertSchema(customInstructions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertApiMetricsSchema = createInsertSchema(apiMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertFileHashCacheSchema = createInsertSchema(fileHashCache).omit({
  id: true,
  processedAt: true,
});

// Types for new tables
export type InsertNamingTemplate = z.infer<typeof insertNamingTemplateSchema>;
export type NamingTemplate = typeof namingTemplates.$inferSelect;

export type InsertAbbreviation = z.infer<typeof insertAbbreviationSchema>;
export type Abbreviation = typeof abbreviations.$inferSelect;

export type InsertJobQueue = z.infer<typeof insertJobQueueSchema>;
export type JobQueue = typeof jobQueue.$inferSelect;

export type InsertCustomInstructions = z.infer<typeof insertCustomInstructionsSchema>;
export type CustomInstructions = typeof customInstructions.$inferSelect;

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type InsertApiMetrics = z.infer<typeof insertApiMetricsSchema>;
export type ApiMetrics = typeof apiMetrics.$inferSelect;

export type InsertFileHashCache = z.infer<typeof insertFileHashCacheSchema>;
export type FileHashCache = typeof fileHashCache.$inferSelect;
