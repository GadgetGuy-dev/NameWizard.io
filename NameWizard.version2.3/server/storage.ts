import { 
  users, 
  apiKeys, 
  cloudConnections, 
  folders,
  files, 
  presets,
  fileHistory,
  aiFeatures,
  agents,
  documentSegmentTemplates,
  renamingConversations,
  providerConfigs,
  healthSnapshots,
  keyBackups,
  testRuns,
  systemSettings,
  systemAlerts,
  namingTemplates,
  abbreviations,
  jobQueue,
  customInstructions,
  passwordResetTokens,
  apiMetrics,
  fileHashCache,
  type User, 
  type InsertUser,
  type ApiKey,
  type InsertApiKey,
  type CloudConnection,
  type InsertCloudConnection,
  type Folder,
  type InsertFolder,
  type File,
  type InsertFile,
  type Preset,
  type InsertPreset,
  type FileHistory,
  type InsertFileHistory,
  type AIFeature,
  type InsertAIFeature,
  type Agent,
  type InsertAgent,
  type DocumentSegmentTemplate,
  type InsertDocumentSegmentTemplate,
  type RenamingConversation,
  type InsertRenamingConversation,
  type ProviderConfig,
  type InsertProviderConfig,
  type HealthSnapshot,
  type InsertHealthSnapshot,
  type KeyBackup,
  type InsertKeyBackup,
  type TestRun,
  type InsertTestRun,
  type SystemSetting,
  type InsertSystemSetting,
  type SystemAlert,
  type InsertSystemAlert,
  type NamingTemplate,
  type InsertNamingTemplate,
  type Abbreviation,
  type InsertAbbreviation,
  type JobQueue,
  type InsertJobQueue,
  type CustomInstructions,
  type InsertCustomInstructions,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type ApiMetrics,
  type InsertApiMetrics,
  type FileHashCache,
  type InsertFileHashCache
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, SQL, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // API Key methods
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeysByUser(userId: number): Promise<ApiKey[]>;
  getApiKeyByType(userId: number, llmType: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, data: Partial<Omit<InsertApiKey, 'userId'>>): Promise<ApiKey | undefined>;
  updateApiKeyStatus(id: number, status: string): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Cloud Connection methods
  getCloudConnection(id: number): Promise<CloudConnection | undefined>;
  getCloudConnectionsByUser(userId: number): Promise<CloudConnection[]>;
  getCloudConnectionByProvider(userId: number, provider: string): Promise<CloudConnection | undefined>;
  createCloudConnection(cloudConnection: InsertCloudConnection): Promise<CloudConnection>;
  updateCloudConnection(id: number, data: Partial<Omit<InsertCloudConnection, 'userId'>>): Promise<CloudConnection | undefined>;
  deleteCloudConnection(id: number): Promise<boolean>;
  
  // Folder methods
  getFolder(id: number): Promise<Folder | undefined>;
  getFoldersByUser(userId: number): Promise<Folder[]>;
  getChildFolders(parentId: number): Promise<Folder[]>;
  getRootFolders(userId: number): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, data: Partial<Omit<InsertFolder, 'userId'>>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // File methods
  getFile(id: number): Promise<File | undefined>;
  getFilesByUser(userId: number): Promise<File[]>;
  getFilesByFolder(folderId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, data: Partial<Omit<InsertFile, 'userId'>>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Preset methods
  getPreset(id: number): Promise<Preset | undefined>;
  getPresetsByUser(userId: number): Promise<Preset[]>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  updatePreset(id: number, data: Partial<Omit<InsertPreset, 'userId'>>): Promise<Preset | undefined>;
  deletePreset(id: number): Promise<boolean>;
  
  // File History methods
  getFileHistory(id: number): Promise<FileHistory | undefined>;
  getFileHistoryByUser(userId: number): Promise<FileHistory[]>;
  createFileHistory(history: InsertFileHistory): Promise<FileHistory>;
  deleteFileHistory(id: number): Promise<boolean>;
  
  // AI Feature methods
  getAIFeature(id: number): Promise<AIFeature | undefined>;
  getAIFeatureByFeatureId(userId: number, featureId: string): Promise<AIFeature | undefined>;
  getAIFeaturesByUser(userId: number): Promise<AIFeature[]>;
  createAIFeature(feature: InsertAIFeature): Promise<AIFeature>;
  updateAIFeature(id: number, data: Partial<Omit<InsertAIFeature, 'userId'>>): Promise<AIFeature | undefined>;
  updateAIFeatureStatus(id: number, status: string): Promise<AIFeature | undefined>;
  deleteAIFeature(id: number): Promise<boolean>;
  
  // Agent methods
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentsByUser(userId: number): Promise<Agent[]>;
  getAgentsByType(userId: number, type: string): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, data: Partial<Omit<InsertAgent, 'userId'>>): Promise<Agent | undefined>;
  updateAgentStatus(id: number, status: string): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  
  // Document Segment Template methods
  getDocumentSegmentTemplate(id: number): Promise<DocumentSegmentTemplate | undefined>;
  getDocumentSegmentTemplateByType(segmentType: string): Promise<DocumentSegmentTemplate | undefined>;
  getAllDocumentSegmentTemplates(): Promise<DocumentSegmentTemplate[]>;
  createDocumentSegmentTemplate(template: InsertDocumentSegmentTemplate): Promise<DocumentSegmentTemplate>;
  updateDocumentSegmentTemplate(id: number, data: Partial<InsertDocumentSegmentTemplate>): Promise<DocumentSegmentTemplate | undefined>;
  deleteDocumentSegmentTemplate(id: number): Promise<boolean>;
  
  // Renaming Conversation methods
  getRenamingConversation(id: number): Promise<RenamingConversation | undefined>;
  getRenamingConversationsByUser(userId: number): Promise<RenamingConversation[]>;
  getRenamingConversationsByTemplate(segmentTemplateId: number): Promise<RenamingConversation[]>;
  getRenamingConversationsByUserAndTemplate(userId: number, segmentTemplateId: number): Promise<RenamingConversation[]>;
  getPublicRenamingConversations(): Promise<RenamingConversation[]>;
  createRenamingConversation(conversation: InsertRenamingConversation): Promise<RenamingConversation>;
  updateRenamingConversation(id: number, data: Partial<Omit<InsertRenamingConversation, 'userId'>>): Promise<RenamingConversation | undefined>;
  deleteRenamingConversation(id: number): Promise<boolean>;
  
  // Provider Config methods (Admin API Management)
  getProviderConfig(id: number): Promise<ProviderConfig | undefined>;
  getProviderConfigsByType(type: string): Promise<ProviderConfig[]>;
  getAllProviderConfigs(): Promise<ProviderConfig[]>;
  createProviderConfig(config: InsertProviderConfig): Promise<ProviderConfig>;
  updateProviderConfig(id: number, data: Partial<InsertProviderConfig>): Promise<ProviderConfig | undefined>;
  deleteProviderConfig(id: number): Promise<boolean>;
  
  // Health Snapshot methods (System Status)
  getLatestHealthSnapshots(): Promise<HealthSnapshot[]>;
  getHealthSnapshotsByService(serviceName: string): Promise<HealthSnapshot[]>;
  createHealthSnapshot(snapshot: InsertHealthSnapshot): Promise<HealthSnapshot>;
  deleteOldHealthSnapshots(olderThan: Date): Promise<boolean>;
  
  // Key Backup methods
  getKeyBackup(id: number): Promise<KeyBackup | undefined>;
  getAllKeyBackups(): Promise<KeyBackup[]>;
  createKeyBackup(backup: InsertKeyBackup): Promise<KeyBackup>;
  deleteKeyBackup(id: number): Promise<boolean>;
  
  // Test Run methods (Auto Testing)
  getTestRun(id: number): Promise<TestRun | undefined>;
  getAllTestRuns(): Promise<TestRun[]>;
  getRecentTestRuns(limit: number): Promise<TestRun[]>;
  createTestRun(testRun: InsertTestRun): Promise<TestRun>;
  updateTestRun(id: number, data: Partial<InsertTestRun>): Promise<TestRun | undefined>;
  deleteTestRun(id: number): Promise<boolean>;
  
  // System Settings methods
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
  upsertSystemSetting(key: string, value: any): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<boolean>;
  
  // System Alerts methods
  getActiveAlerts(): Promise<SystemAlert[]>;
  getAllAlerts(): Promise<SystemAlert[]>;
  getAlertsByService(serviceName: string): Promise<SystemAlert[]>;
  createAlert(alert: InsertSystemAlert): Promise<SystemAlert>;
  updateAlertStatus(id: number, status: 'active' | 'acknowledged' | 'resolved'): Promise<SystemAlert | undefined>;
  resolveAlert(id: number): Promise<SystemAlert | undefined>;
  resolveAlertsByService(serviceName: string): Promise<boolean>;
  deleteAlert(id: number): Promise<boolean>;
  
  // Naming Template methods
  getNamingTemplate(id: number): Promise<NamingTemplate | undefined>;
  getNamingTemplatesByCategory(category: string): Promise<NamingTemplate[]>;
  getSystemNamingTemplates(): Promise<NamingTemplate[]>;
  getUserNamingTemplates(userId: number): Promise<NamingTemplate[]>;
  getAllNamingTemplates(): Promise<NamingTemplate[]>;
  createNamingTemplate(template: InsertNamingTemplate): Promise<NamingTemplate>;
  updateNamingTemplate(id: number, data: Partial<InsertNamingTemplate>): Promise<NamingTemplate | undefined>;
  deleteNamingTemplate(id: number): Promise<boolean>;
  
  // Abbreviation methods
  getAbbreviation(id: number): Promise<Abbreviation | undefined>;
  getAbbreviationByText(fullText: string): Promise<Abbreviation | undefined>;
  getAbbreviationsByCategory(category: string): Promise<Abbreviation[]>;
  getSystemAbbreviations(): Promise<Abbreviation[]>;
  getAllAbbreviations(): Promise<Abbreviation[]>;
  createAbbreviation(abbr: InsertAbbreviation): Promise<Abbreviation>;
  deleteAbbreviation(id: number): Promise<boolean>;
  
  // Job Queue methods
  getJob(id: number): Promise<JobQueue | undefined>;
  getJobsByUser(userId: number): Promise<JobQueue[]>;
  getPendingJobs(): Promise<JobQueue[]>;
  getProcessingJobs(): Promise<JobQueue[]>;
  createJob(job: InsertJobQueue): Promise<JobQueue>;
  updateJob(id: number, data: Partial<InsertJobQueue>): Promise<JobQueue | undefined>;
  updateJobStatus(id: number, status: string, errorMessage?: string): Promise<JobQueue | undefined>;
  updateJobProgress(id: number, completedItems: number, progress: number): Promise<JobQueue | undefined>;
  deleteJob(id: number): Promise<boolean>;
  
  // Custom Instructions methods
  getCustomInstructions(userId: number): Promise<CustomInstructions | undefined>;
  createOrUpdateCustomInstructions(userId: number, data: Partial<InsertCustomInstructions>): Promise<CustomInstructions>;
  deleteCustomInstructions(userId: number): Promise<boolean>;
  
  // Password Reset Token methods
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenUsed(id: number): Promise<boolean>;
  deleteExpiredTokens(): Promise<boolean>;
  
  // API Metrics methods
  getApiMetrics(providerName: string): Promise<ApiMetrics | undefined>;
  getAllApiMetrics(): Promise<ApiMetrics[]>;
  recordApiRequest(providerName: string, latencyMs: number, success: boolean, errorMessage?: string): Promise<ApiMetrics>;
  resetApiMetrics(providerName: string): Promise<boolean>;
  
  // File Hash Cache methods
  getFileHashCache(fileHash: string): Promise<FileHashCache | undefined>;
  createFileHashCache(cache: InsertFileHashCache): Promise<FileHashCache>;
  deleteExpiredFileHashes(): Promise<number>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  constructor() {
    // Initialize PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true; // If no error is thrown, we assume success
  }
  
  // API Key methods
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey;
  }
  
  async getApiKeysByUser(userId: number): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
  }
  
  async getApiKeyByType(userId: number, llmType: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.userId, userId), 
        // Cast the string to the enum type
        eq(apiKeys.llmType, llmType as any)
      ));
    return apiKey;
  }
  
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(insertApiKey).returning();
    return apiKey;
  }
  
  async updateApiKey(id: number, data: Partial<Omit<InsertApiKey, 'userId'>> & { status?: string, lastUsed?: Date }): Promise<ApiKey | undefined> {
    // Create a new object without status and lastUsed
    const { status, lastUsed, ...restData } = data;
    
    // Base update data
    const updateData: Record<string, any> = {
      ...restData,
      updatedAt: new Date()
    };
    
    // Add status if present (cast to enum)
    if (status) {
      updateData.status = status as any;
    }
    
    // Add lastUsed if present
    if (lastUsed) {
      updateData.lastUsed = lastUsed;
    }
    
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set(updateData)
      .where(eq(apiKeys.id, id))
      .returning();
    return updatedApiKey;
  }
  
  async updateApiKeyStatus(id: number, status: 'active' | 'inactive' | 'problem'): Promise<ApiKey | undefined> {
    console.log(`Storage: updateApiKeyStatus called for ID ${id} with status ${status}`);
    try {
      const [updatedApiKey] = await db
        .update(apiKeys)
        .set({ 
          // Cast the string to the enum type
          status: status as any,
          updatedAt: new Date() 
        })
        .where(eq(apiKeys.id, id))
        .returning();
      
      console.log(`Storage: updateApiKeyStatus successful:`, updatedApiKey ? {
        id: updatedApiKey.id,
        llmType: updatedApiKey.llmType,
        status: updatedApiKey.status,
        updatedAt: updatedApiKey.updatedAt
      } : null);
      
      return updatedApiKey;
    } catch (error) {
      console.error(`Storage: updateApiKeyStatus error:`, error);
      throw error;
    }
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return true;
  }
  
  // Cloud Connection methods
  async getCloudConnection(id: number): Promise<CloudConnection | undefined> {
    const [cloudConnection] = await db.select().from(cloudConnections).where(eq(cloudConnections.id, id));
    return cloudConnection;
  }
  
  async getCloudConnectionsByUser(userId: number): Promise<CloudConnection[]> {
    return await db.select().from(cloudConnections).where(eq(cloudConnections.userId, userId));
  }
  
  async getCloudConnectionByProvider(userId: number, provider: string): Promise<CloudConnection | undefined> {
    const [cloudConnection] = await db
      .select()
      .from(cloudConnections)
      .where(and(
        eq(cloudConnections.userId, userId), 
        // Cast the string to the enum type
        eq(cloudConnections.provider, provider as any)
      ));
    return cloudConnection;
  }
  
  async createCloudConnection(insertCloudConnection: InsertCloudConnection): Promise<CloudConnection> {
    const [cloudConnection] = await db.insert(cloudConnections).values(insertCloudConnection).returning();
    return cloudConnection;
  }
  
  async updateCloudConnection(id: number, data: Partial<Omit<InsertCloudConnection, 'userId'>>): Promise<CloudConnection | undefined> {
    const [updatedCloudConnection] = await db
      .update(cloudConnections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cloudConnections.id, id))
      .returning();
    return updatedCloudConnection;
  }
  
  async deleteCloudConnection(id: number): Promise<boolean> {
    await db.delete(cloudConnections).where(eq(cloudConnections.id, id));
    return true;
  }
  
  // Folder methods
  async getFolder(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }
  
  async getFoldersByUser(userId: number): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.userId, userId));
  }
  
  async getChildFolders(parentId: number): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.parentId, parentId));
  }
  
  async getRootFolders(userId: number): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(and(
        eq(folders.userId, userId),
        // Get folders with null parentId (root folders)
        sql`"parent_id" IS NULL`
      ));
  }
  
  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const [folder] = await db.insert(folders).values(insertFolder).returning();
    return folder;
  }
  
  async updateFolder(id: number, data: Partial<Omit<InsertFolder, 'userId'>>): Promise<Folder | undefined> {
    const [updatedFolder] = await db
      .update(folders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning();
    return updatedFolder;
  }
  
  async deleteFolder(id: number): Promise<boolean> {
    await db.delete(folders).where(eq(folders.id, id));
    return true;
  }
  
  // File methods
  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }
  
  async getFilesByUser(userId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId));
  }
  
  async getFilesByFolder(folderId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folderId, folderId));
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }
  
  async updateFile(id: number, data: Partial<Omit<InsertFile, 'userId'>>): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }
  
  async deleteFile(id: number): Promise<boolean> {
    await db.delete(files).where(eq(files.id, id));
    return true;
  }
  
  // Preset methods
  async getPreset(id: number): Promise<Preset | undefined> {
    const [preset] = await db.select().from(presets).where(eq(presets.id, id));
    return preset;
  }
  
  async getPresetsByUser(userId: number): Promise<Preset[]> {
    return await db.select().from(presets).where(eq(presets.userId, userId));
  }
  
  async createPreset(insertPreset: InsertPreset): Promise<Preset> {
    const [preset] = await db.insert(presets).values(insertPreset).returning();
    return preset;
  }
  
  async updatePreset(id: number, data: Partial<Omit<InsertPreset, 'userId'>>): Promise<Preset | undefined> {
    const [updatedPreset] = await db
      .update(presets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(presets.id, id))
      .returning();
    return updatedPreset;
  }
  
  async deletePreset(id: number): Promise<boolean> {
    await db.delete(presets).where(eq(presets.id, id));
    return true;
  }
  
  // File History methods
  async getFileHistory(id: number): Promise<FileHistory | undefined> {
    const [history] = await db.select().from(fileHistory).where(eq(fileHistory.id, id));
    return history;
  }
  
  async getFileHistoryByUser(userId: number): Promise<FileHistory[]> {
    return await db.select().from(fileHistory)
      .where(eq(fileHistory.userId, userId))
      .orderBy(desc(fileHistory.renamedAt)); // Sort by most recent first
  }
  
  async createFileHistory(insertFileHistory: InsertFileHistory): Promise<FileHistory> {
    const [history] = await db.insert(fileHistory).values(insertFileHistory).returning();
    return history;
  }
  
  async deleteFileHistory(id: number): Promise<boolean> {
    await db.delete(fileHistory).where(eq(fileHistory.id, id));
    return true;
  }
  
  // AI Feature methods
  async getAIFeature(id: number): Promise<AIFeature | undefined> {
    const [feature] = await db.select().from(aiFeatures).where(eq(aiFeatures.id, id));
    return feature;
  }
  
  async getAIFeatureByFeatureId(userId: number, featureId: string): Promise<AIFeature | undefined> {
    const [feature] = await db
      .select()
      .from(aiFeatures)
      .where(and(
        eq(aiFeatures.userId, userId),
        eq(aiFeatures.featureId, featureId)
      ));
    return feature;
  }
  
  async getAIFeaturesByUser(userId: number): Promise<AIFeature[]> {
    return await db.select().from(aiFeatures).where(eq(aiFeatures.userId, userId));
  }
  
  async createAIFeature(insertAIFeature: InsertAIFeature): Promise<AIFeature> {
    const [feature] = await db.insert(aiFeatures).values(insertAIFeature).returning();
    return feature;
  }
  
  async updateAIFeature(id: number, data: Partial<Omit<InsertAIFeature, 'userId'>>): Promise<AIFeature | undefined> {
    // Handle status separately as it's an enum
    const { status, ...restData } = data;
    
    // Base update data
    const updateData: Record<string, any> = {
      ...restData,
      updatedAt: new Date()
    };
    
    // Add status if present (cast to enum)
    if (status) {
      updateData.status = status as any;
    }
    
    const [updatedFeature] = await db
      .update(aiFeatures)
      .set(updateData)
      .where(eq(aiFeatures.id, id))
      .returning();
    return updatedFeature;
  }
  
  async updateAIFeatureStatus(id: number, status: 'active' | 'inactive' | 'problem'): Promise<AIFeature | undefined> {
    const [updatedFeature] = await db
      .update(aiFeatures)
      .set({ 
        // Cast the string to the enum type
        status: status as any,
        updatedAt: new Date() 
      })
      .where(eq(aiFeatures.id, id))
      .returning();
    return updatedFeature;
  }
  
  async deleteAIFeature(id: number): Promise<boolean> {
    await db.delete(aiFeatures).where(eq(aiFeatures.id, id));
    return true;
  }
  
  // Agent methods
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }
  
  async getAgentsByUser(userId: number): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.userId, userId));
  }
  
  async getAgentsByType(userId: number, type: string): Promise<Agent[]> {
    return await db
      .select()
      .from(agents)
      .where(and(
        eq(agents.userId, userId),
        // Cast the string to the enum type
        eq(agents.type, type as any)
      ));
  }
  
  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }
  
  async updateAgent(id: number, data: Partial<Omit<InsertAgent, 'userId'>>): Promise<Agent | undefined> {
    // Handle type and status separately as they're enums
    const { type, status, ...restData } = data;
    
    // Base update data
    const updateData: Record<string, any> = {
      ...restData,
      updatedAt: new Date()
    };
    
    // Add type if present (cast to enum)
    if (type) {
      updateData.type = type as any;
    }
    
    // Add status if present (cast to enum)
    if (status) {
      updateData.status = status as any;
    }
    
    const [updatedAgent] = await db
      .update(agents)
      .set(updateData)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }
  
  async updateAgentStatus(id: number, status: 'idle' | 'running' | 'completed' | 'failed'): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set({ 
        // Cast the string to the enum type
        status: status as any,
        updatedAt: new Date(),
        ...(status === 'completed' || status === 'failed' ? { lastRun: new Date() } : {})
      })
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }
  
  async deleteAgent(id: number): Promise<boolean> {
    await db.delete(agents).where(eq(agents.id, id));
    return true;
  }

  // Document Segment Template methods
  async getDocumentSegmentTemplate(id: number): Promise<DocumentSegmentTemplate | undefined> {
    const [template] = await db.select().from(documentSegmentTemplates).where(eq(documentSegmentTemplates.id, id));
    return template;
  }
  
  async getDocumentSegmentTemplateByType(segmentType: string): Promise<DocumentSegmentTemplate | undefined> {
    const [template] = await db
      .select()
      .from(documentSegmentTemplates)
      .where(eq(documentSegmentTemplates.segmentType, segmentType as any));
    return template;
  }
  
  async getAllDocumentSegmentTemplates(): Promise<DocumentSegmentTemplate[]> {
    return await db.select().from(documentSegmentTemplates);
  }
  
  async createDocumentSegmentTemplate(insertTemplate: InsertDocumentSegmentTemplate): Promise<DocumentSegmentTemplate> {
    const [template] = await db.insert(documentSegmentTemplates).values(insertTemplate).returning();
    return template;
  }
  
  async updateDocumentSegmentTemplate(id: number, data: Partial<InsertDocumentSegmentTemplate>): Promise<DocumentSegmentTemplate | undefined> {
    // Handle segmentType separately as it's an enum
    const { segmentType, ...restData } = data;
    
    // Base update data
    const updateData: Record<string, any> = {
      ...restData,
      updatedAt: new Date()
    };
    
    // Add segmentType if present (cast to enum)
    if (segmentType) {
      updateData.segmentType = segmentType as any;
    }
    
    const [updatedTemplate] = await db
      .update(documentSegmentTemplates)
      .set(updateData)
      .where(eq(documentSegmentTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteDocumentSegmentTemplate(id: number): Promise<boolean> {
    await db.delete(documentSegmentTemplates).where(eq(documentSegmentTemplates.id, id));
    return true;
  }
  
  // Renaming Conversation methods
  async getRenamingConversation(id: number): Promise<RenamingConversation | undefined> {
    const [conversation] = await db.select().from(renamingConversations).where(eq(renamingConversations.id, id));
    return conversation;
  }
  
  async getRenamingConversationsByUser(userId: number): Promise<RenamingConversation[]> {
    return await db
      .select()
      .from(renamingConversations)
      .where(eq(renamingConversations.userId, userId))
      .orderBy(desc(renamingConversations.updatedAt)); // Sort by most recent update
  }
  
  async getRenamingConversationsByTemplate(segmentTemplateId: number): Promise<RenamingConversation[]> {
    return await db
      .select()
      .from(renamingConversations)
      .where(eq(renamingConversations.segmentTemplateId, segmentTemplateId))
      .orderBy(desc(renamingConversations.updatedAt)); // Sort by most recent update
  }
  
  async getRenamingConversationsByUserAndTemplate(userId: number, segmentTemplateId: number): Promise<RenamingConversation[]> {
    return await db
      .select()
      .from(renamingConversations)
      .where(and(
        eq(renamingConversations.userId, userId),
        eq(renamingConversations.segmentTemplateId, segmentTemplateId)
      ))
      .orderBy(desc(renamingConversations.updatedAt)); // Sort by most recent update
  }
  
  async getPublicRenamingConversations(): Promise<RenamingConversation[]> {
    return await db
      .select()
      .from(renamingConversations)
      .where(eq(renamingConversations.isPublic, true))
      .orderBy(desc(renamingConversations.updatedAt)); // Sort by most recent update
  }
  
  async createRenamingConversation(insertConversation: InsertRenamingConversation): Promise<RenamingConversation> {
    const [conversation] = await db.insert(renamingConversations).values(insertConversation).returning();
    return conversation;
  }
  
  async updateRenamingConversation(id: number, data: Partial<Omit<InsertRenamingConversation, 'userId'>>): Promise<RenamingConversation | undefined> {
    const [updatedConversation] = await db
      .update(renamingConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(renamingConversations.id, id))
      .returning();
    return updatedConversation;
  }
  
  async deleteRenamingConversation(id: number): Promise<boolean> {
    await db.delete(renamingConversations).where(eq(renamingConversations.id, id));
    return true;
  }
  
  // Provider Config methods (Admin API Management)
  async getProviderConfig(id: number): Promise<ProviderConfig | undefined> {
    const [config] = await db.select().from(providerConfigs).where(eq(providerConfigs.id, id));
    return config;
  }
  
  async getProviderConfigsByType(type: string): Promise<ProviderConfig[]> {
    return await db.select().from(providerConfigs).where(eq(providerConfigs.type, type as any));
  }
  
  async getAllProviderConfigs(): Promise<ProviderConfig[]> {
    return await db.select().from(providerConfigs).orderBy(providerConfigs.name);
  }
  
  async createProviderConfig(insertConfig: InsertProviderConfig): Promise<ProviderConfig> {
    const [config] = await db.insert(providerConfigs).values(insertConfig).returning();
    return config;
  }
  
  async updateProviderConfig(id: number, data: Partial<InsertProviderConfig>): Promise<ProviderConfig | undefined> {
    const [updatedConfig] = await db
      .update(providerConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(providerConfigs.id, id))
      .returning();
    return updatedConfig;
  }
  
  async deleteProviderConfig(id: number): Promise<boolean> {
    await db.delete(providerConfigs).where(eq(providerConfigs.id, id));
    return true;
  }
  
  // Health Snapshot methods (System Status)
  async getLatestHealthSnapshots(): Promise<HealthSnapshot[]> {
    return await db
      .select()
      .from(healthSnapshots)
      .orderBy(desc(healthSnapshots.checkedAt))
      .limit(50);
  }
  
  async getHealthSnapshotsByService(serviceName: string): Promise<HealthSnapshot[]> {
    return await db
      .select()
      .from(healthSnapshots)
      .where(eq(healthSnapshots.serviceName, serviceName))
      .orderBy(desc(healthSnapshots.checkedAt))
      .limit(20);
  }
  
  async createHealthSnapshot(insertSnapshot: InsertHealthSnapshot): Promise<HealthSnapshot> {
    const [snapshot] = await db.insert(healthSnapshots).values(insertSnapshot).returning();
    return snapshot;
  }
  
  async deleteOldHealthSnapshots(olderThan: Date): Promise<boolean> {
    await db.delete(healthSnapshots).where(sql`${healthSnapshots.checkedAt} < ${olderThan}`);
    return true;
  }
  
  // Key Backup methods
  async getKeyBackup(id: number): Promise<KeyBackup | undefined> {
    const [backup] = await db.select().from(keyBackups).where(eq(keyBackups.id, id));
    return backup;
  }
  
  async getAllKeyBackups(): Promise<KeyBackup[]> {
    return await db.select().from(keyBackups).orderBy(desc(keyBackups.createdAt));
  }
  
  async createKeyBackup(insertBackup: InsertKeyBackup): Promise<KeyBackup> {
    const [backup] = await db.insert(keyBackups).values(insertBackup).returning();
    return backup;
  }
  
  async deleteKeyBackup(id: number): Promise<boolean> {
    await db.delete(keyBackups).where(eq(keyBackups.id, id));
    return true;
  }
  
  // Test Run methods (Auto Testing)
  async getTestRun(id: number): Promise<TestRun | undefined> {
    const [testRun] = await db.select().from(testRuns).where(eq(testRuns.id, id));
    return testRun;
  }
  
  async getAllTestRuns(): Promise<TestRun[]> {
    return await db.select().from(testRuns).orderBy(desc(testRuns.createdAt));
  }
  
  async getRecentTestRuns(limit: number): Promise<TestRun[]> {
    return await db.select().from(testRuns).orderBy(desc(testRuns.createdAt)).limit(limit);
  }
  
  async createTestRun(insertTestRun: InsertTestRun): Promise<TestRun> {
    const [testRun] = await db.insert(testRuns).values(insertTestRun).returning();
    return testRun;
  }
  
  async updateTestRun(id: number, data: Partial<InsertTestRun>): Promise<TestRun | undefined> {
    const [updatedTestRun] = await db
      .update(testRuns)
      .set(data)
      .where(eq(testRuns.id, id))
      .returning();
    return updatedTestRun;
  }
  
  async deleteTestRun(id: number): Promise<boolean> {
    await db.delete(testRuns).where(eq(testRuns.id, id));
    return true;
  }
  
  // System Settings methods
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }
  
  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }
  
  async upsertSystemSetting(key: string, value: any): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(key);
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(systemSettings).values({ key, value }).returning();
      return created;
    }
  }
  
  async deleteSystemSetting(key: string): Promise<boolean> {
    await db.delete(systemSettings).where(eq(systemSettings.key, key));
    return true;
  }
  
  // System Alerts methods
  async getActiveAlerts(): Promise<SystemAlert[]> {
    return await db.select().from(systemAlerts)
      .where(eq(systemAlerts.status, 'active'))
      .orderBy(desc(systemAlerts.createdAt));
  }
  
  async getAllAlerts(): Promise<SystemAlert[]> {
    return await db.select().from(systemAlerts).orderBy(desc(systemAlerts.createdAt));
  }
  
  async getAlertsByService(serviceName: string): Promise<SystemAlert[]> {
    return await db.select().from(systemAlerts)
      .where(eq(systemAlerts.serviceName, serviceName))
      .orderBy(desc(systemAlerts.createdAt));
  }
  
  async createAlert(alert: InsertSystemAlert): Promise<SystemAlert> {
    const [created] = await db.insert(systemAlerts).values(alert).returning();
    return created;
  }
  
  async updateAlertStatus(id: number, status: 'active' | 'acknowledged' | 'resolved'): Promise<SystemAlert | undefined> {
    const updates: Partial<SystemAlert> = { 
      status, 
      updatedAt: new Date() 
    };
    if (status === 'resolved') {
      updates.resolvedAt = new Date();
    }
    const [updated] = await db.update(systemAlerts).set(updates).where(eq(systemAlerts.id, id)).returning();
    return updated;
  }
  
  async resolveAlert(id: number): Promise<SystemAlert | undefined> {
    return this.updateAlertStatus(id, 'resolved');
  }
  
  async resolveAlertsByService(serviceName: string): Promise<boolean> {
    await db.update(systemAlerts)
      .set({ status: 'resolved', resolvedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(systemAlerts.serviceName, serviceName), eq(systemAlerts.status, 'active')));
    return true;
  }
  
  async deleteAlert(id: number): Promise<boolean> {
    await db.delete(systemAlerts).where(eq(systemAlerts.id, id));
    return true;
  }
  
  // Naming Template methods
  async getNamingTemplate(id: number): Promise<NamingTemplate | undefined> {
    const [template] = await db.select().from(namingTemplates).where(eq(namingTemplates.id, id));
    return template;
  }
  
  async getNamingTemplatesByCategory(category: string): Promise<NamingTemplate[]> {
    return await db.select().from(namingTemplates).where(eq(namingTemplates.category, category as any));
  }
  
  async getSystemNamingTemplates(): Promise<NamingTemplate[]> {
    return await db.select().from(namingTemplates).where(eq(namingTemplates.isSystem, true));
  }
  
  async getUserNamingTemplates(userId: number): Promise<NamingTemplate[]> {
    return await db.select().from(namingTemplates).where(eq(namingTemplates.userId, userId));
  }
  
  async getAllNamingTemplates(): Promise<NamingTemplate[]> {
    return await db.select().from(namingTemplates).orderBy(namingTemplates.name);
  }
  
  async createNamingTemplate(template: InsertNamingTemplate): Promise<NamingTemplate> {
    const [created] = await db.insert(namingTemplates).values(template).returning();
    return created;
  }
  
  async updateNamingTemplate(id: number, data: Partial<InsertNamingTemplate>): Promise<NamingTemplate | undefined> {
    const [updated] = await db.update(namingTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(namingTemplates.id, id))
      .returning();
    return updated;
  }
  
  async deleteNamingTemplate(id: number): Promise<boolean> {
    await db.delete(namingTemplates).where(eq(namingTemplates.id, id));
    return true;
  }
  
  // Abbreviation methods
  async getAbbreviation(id: number): Promise<Abbreviation | undefined> {
    const [abbr] = await db.select().from(abbreviations).where(eq(abbreviations.id, id));
    return abbr;
  }
  
  async getAbbreviationByText(fullText: string): Promise<Abbreviation | undefined> {
    const [abbr] = await db.select().from(abbreviations).where(eq(abbreviations.fullText, fullText.toLowerCase()));
    return abbr;
  }
  
  async getAbbreviationsByCategory(category: string): Promise<Abbreviation[]> {
    return await db.select().from(abbreviations).where(eq(abbreviations.category, category));
  }
  
  async getSystemAbbreviations(): Promise<Abbreviation[]> {
    return await db.select().from(abbreviations).where(eq(abbreviations.isSystem, true));
  }
  
  async getAllAbbreviations(): Promise<Abbreviation[]> {
    return await db.select().from(abbreviations).orderBy(abbreviations.fullText);
  }
  
  async createAbbreviation(abbr: InsertAbbreviation): Promise<Abbreviation> {
    const [created] = await db.insert(abbreviations).values(abbr).returning();
    return created;
  }
  
  async deleteAbbreviation(id: number): Promise<boolean> {
    await db.delete(abbreviations).where(eq(abbreviations.id, id));
    return true;
  }
  
  // Job Queue methods
  async getJob(id: number): Promise<JobQueue | undefined> {
    const [job] = await db.select().from(jobQueue).where(eq(jobQueue.id, id));
    return job;
  }
  
  async getJobsByUser(userId: number): Promise<JobQueue[]> {
    return await db.select().from(jobQueue).where(eq(jobQueue.userId, userId)).orderBy(desc(jobQueue.createdAt));
  }
  
  async getPendingJobs(): Promise<JobQueue[]> {
    return await db.select().from(jobQueue).where(eq(jobQueue.status, 'pending')).orderBy(desc(jobQueue.priority), jobQueue.createdAt);
  }
  
  async getProcessingJobs(): Promise<JobQueue[]> {
    return await db.select().from(jobQueue).where(eq(jobQueue.status, 'processing'));
  }
  
  async createJob(job: InsertJobQueue): Promise<JobQueue> {
    const [created] = await db.insert(jobQueue).values(job).returning();
    return created;
  }
  
  async updateJob(id: number, data: Partial<InsertJobQueue>): Promise<JobQueue | undefined> {
    const [updated] = await db.update(jobQueue)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobQueue.id, id))
      .returning();
    return updated;
  }
  
  async updateJobStatus(id: number, status: string, errorMessage?: string): Promise<JobQueue | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === 'processing') updates.startedAt = new Date();
    if (status === 'completed' || status === 'failed') updates.completedAt = new Date();
    if (errorMessage) updates.errorMessage = errorMessage;
    const [updated] = await db.update(jobQueue).set(updates).where(eq(jobQueue.id, id)).returning();
    return updated;
  }
  
  async updateJobProgress(id: number, completedItems: number, progress: number): Promise<JobQueue | undefined> {
    const [updated] = await db.update(jobQueue)
      .set({ completedItems, progress, updatedAt: new Date() })
      .where(eq(jobQueue.id, id))
      .returning();
    return updated;
  }
  
  async deleteJob(id: number): Promise<boolean> {
    await db.delete(jobQueue).where(eq(jobQueue.id, id));
    return true;
  }
  
  // Custom Instructions methods
  async getCustomInstructions(userId: number): Promise<CustomInstructions | undefined> {
    const [instructions] = await db.select().from(customInstructions).where(eq(customInstructions.userId, userId));
    return instructions;
  }
  
  async createOrUpdateCustomInstructions(userId: number, data: Partial<InsertCustomInstructions>): Promise<CustomInstructions> {
    const existing = await this.getCustomInstructions(userId);
    if (existing) {
      const [updated] = await db.update(customInstructions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(customInstructions.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(customInstructions)
        .values({ userId, ...data } as any)
        .returning();
      return created;
    }
  }
  
  async deleteCustomInstructions(userId: number): Promise<boolean> {
    await db.delete(customInstructions).where(eq(customInstructions.userId, userId));
    return true;
  }
  
  // Password Reset Token methods
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [created] = await db.insert(passwordResetTokens)
      .values({ userId, token, expiresAt })
      .returning();
    return created;
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }
  
  async markTokenUsed(id: number): Promise<boolean> {
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
    return true;
  }
  
  async deleteExpiredTokens(): Promise<boolean> {
    await db.delete(passwordResetTokens).where(sql`expires_at < NOW()`);
    return true;
  }
  
  // API Metrics methods
  async getApiMetrics(providerName: string): Promise<ApiMetrics | undefined> {
    const [metrics] = await db.select().from(apiMetrics).where(eq(apiMetrics.providerName, providerName));
    return metrics;
  }
  
  async getAllApiMetrics(): Promise<ApiMetrics[]> {
    return await db.select().from(apiMetrics).orderBy(desc(apiMetrics.requestCount));
  }
  
  async recordApiRequest(providerName: string, latencyMs: number, success: boolean, errorMessage?: string): Promise<ApiMetrics> {
    const existing = await this.getApiMetrics(providerName);
    if (existing) {
      const newRequestCount = existing.requestCount + 1;
      const newSuccessCount = success ? existing.successCount + 1 : existing.successCount;
      const newErrorCount = success ? existing.errorCount : existing.errorCount + 1;
      const newTotalLatency = existing.totalLatencyMs + latencyMs;
      const newAvgLatency = Math.round(newTotalLatency / newRequestCount);
      const updates: any = {
        requestCount: newRequestCount,
        successCount: newSuccessCount,
        errorCount: newErrorCount,
        totalLatencyMs: newTotalLatency,
        avgLatencyMs: newAvgLatency,
        minLatencyMs: existing.minLatencyMs ? Math.min(existing.minLatencyMs, latencyMs) : latencyMs,
        maxLatencyMs: existing.maxLatencyMs ? Math.max(existing.maxLatencyMs, latencyMs) : latencyMs,
        lastRequestAt: new Date()
      };
      if (!success && errorMessage) {
        updates.lastErrorAt = new Date();
        updates.lastErrorMessage = errorMessage;
      }
      const [updated] = await db.update(apiMetrics).set(updates).where(eq(apiMetrics.providerName, providerName)).returning();
      return updated;
    } else {
      const [created] = await db.insert(apiMetrics).values({
        providerName,
        requestCount: 1,
        successCount: success ? 1 : 0,
        errorCount: success ? 0 : 1,
        totalLatencyMs: latencyMs,
        avgLatencyMs: latencyMs,
        minLatencyMs: latencyMs,
        maxLatencyMs: latencyMs,
        lastRequestAt: new Date(),
        lastErrorAt: success ? undefined : new Date(),
        lastErrorMessage: success ? undefined : errorMessage
      }).returning();
      return created;
    }
  }
  
  async resetApiMetrics(providerName: string): Promise<boolean> {
    await db.delete(apiMetrics).where(eq(apiMetrics.providerName, providerName));
    return true;
  }
  
  // File Hash Cache methods
  async getFileHashCache(fileHash: string): Promise<FileHashCache | undefined> {
    const [cache] = await db.select().from(fileHashCache).where(eq(fileHashCache.fileHash, fileHash));
    return cache;
  }
  
  async createFileHashCache(cache: InsertFileHashCache): Promise<FileHashCache> {
    const [created] = await db.insert(fileHashCache).values(cache).returning();
    return created;
  }
  
  async deleteExpiredFileHashes(): Promise<number> {
    const result = await db.delete(fileHashCache).where(sql`expires_at < NOW()`);
    return 0;
  }
  
  // Get all users for admin
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
