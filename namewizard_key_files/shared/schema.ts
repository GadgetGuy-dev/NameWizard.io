import { pgTable, text, serial, integer, jsonb, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "god_admin"]);

// Enhanced User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// API key status enum
export const apiKeyStatusEnum = pgEnum("api_key_status", ["active", "inactive", "problem"]);

// LLM type enum
export const llmTypeEnum = pgEnum("llm_type", [
  "claude_3_5_sonnet",
  "gpt_4o",
  "gpt_4o_mini",
  "gpt_3_5_turbo",
  "gpt_4_turbo",
  "llama_3",
  "llama_3_70b",
  "llama_3_2_90b",
  "llava_1_6",
  "inflection_2_5",
  "gemini_1_5_pro",
  "ollama"
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
