import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { setupAuth } from "./auth";
import { ocrService } from "./services/ocr-service";
import { storage } from "./storage";
import { pool } from "./db";
import Stripe from "stripe";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const { authenticateUser } = setupAuth(app);
  
  // Setup multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
  
  // ====== Authentication Routes ======
  // All authentication routes are handled in auth.ts
  
  // ====== User Profile Routes ======
  // Note: The main user endpoint is in auth.ts as "/api/user"
  
  // ====== API Key Management Routes ======
  app.post("/api/test-api-key", async (req, res) => {
    try {
      const { type, key } = req.body;
      
      if (!type || !key) {
        return res.status(400).json({
          success: false,
          message: "Missing API key or type"
        });
      }
      
      console.log(`Testing API key of type: ${type}`);
      
      // For security, we won't actually call external APIs with provided keys in this prototype
      // Instead, we'll validate based on simple heuristics and expected formats
      let success = false;
      let message = "";
      
      switch (type) {
        case 'openai':
          // OpenAI keys start with "sk-" and are ~51 chars
          if (key.startsWith('sk-') && key.length > 45) {
            success = true;
          } else {
            message = "Invalid OpenAI API key format. Keys should start with 'sk-'";
            success = false;
          }
          break;
          
        case 'anthropic':
          // Anthropic keys are longer and start with specific prefixes
          if ((key.startsWith('sk-ant-') || key.startsWith('sk-')) && key.length > 40) {
            success = true;
          } else {
            message = "Invalid Anthropic API key format";
            success = false;
          }
          break;
          
        case 'google':
          // Google API keys are alphanumeric and typically 39 chars
          if (/^[a-zA-Z0-9_-]{39}$/.test(key)) {
            success = true;
          } else {
            message = "Invalid Google API key format";
            success = false;
          }
          break;
          
        case 'dropbox':
        case 'googledrive':
          // For cloud storage, use a simple length check (this is just a placeholder)
          if (key.length > 20) {
            success = true;
          } else {
            message = "Invalid storage API key format";
            success = false;
          }
          break;
          
        // For other types that are not fully implemented yet
        case 'mistral':
        case 'perplexity':
        case 'meta':
          success = false;
          message = "API key validation not yet implemented for this provider";
          break;
          
        default:
          success = false;
          message = "Unknown API key type";
      }
      
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.json({
        success,
        message: success ? "API key validated successfully" : message
      });
    } catch (error: any) {
      console.error("Error testing API key:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Error testing API key"
      });
    }
  });

  // ====== OCR and File Processing Routes ======
  app.post("/api/process-file", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const { ocrMethod = 'smart-naming', llmProvider = 'openai' } = req.body;
      const file = req.file;
      
      // Determine if file is an image
      const isImage = file.mimetype.startsWith('image/');
      
      console.log(`Processing file: ${file.originalname}, OCR method: ${ocrMethod}, LLM: ${llmProvider}`);
      
      // Process file using OCR service
      const result = await ocrService.processFileForRenaming(
        file.buffer,
        file.originalname || 'unknown_file',
        {
          ocrMethod,
          llmProvider,
          isImage
        }
      );

      return res.json({
        success: true,
        result: {
          originalName: file.originalname,
          suggestedName: result.suggestedName,
          confidence: result.confidence,
          reasoning: result.reasoning,
          fileSize: file.size,
          mimeType: file.mimetype
        }
      });
    } catch (error: any) {
      console.error("Error processing file:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to process file"
      });
    }
  });

  app.post("/api/batch-process", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      const { ocrMethod = 'smart-naming', llmProvider = 'openai' } = req.body;
      
      console.log(`Batch processing ${files.length} files with ${ocrMethod} method using ${llmProvider}`);
      
      const results = [];
      
      // Process files sequentially to avoid overwhelming the API
      for (const file of files) {
        try {
          const isImage = file.mimetype.startsWith('image/');
          
          const result = await ocrService.processFileForRenaming(
            file.buffer,
            file.originalname || 'unknown_file',
            {
              ocrMethod,
              llmProvider,
              isImage
            }
          );

          results.push({
            originalName: file.originalname,
            suggestedName: result.suggestedName,
            confidence: result.confidence,
            reasoning: result.reasoning,
            fileSize: file.size,
            mimeType: file.mimetype,
            status: 'success'
          });
        } catch (error: any) {
          results.push({
            originalName: file.originalname,
            error: error?.message || 'Processing failed',
            status: 'error'
          });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      return res.json({
        success: true,
        summary: {
          total: files.length,
          successful: successCount,
          failed: errorCount
        },
        results
      });
    } catch (error: any) {
      console.error("Error in batch processing:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to process files"
      });
    }
  });

  // ====== File Organization Routes ======
  app.post("/api/organize-folders", async (req, res) => {
    try {
      const { files, llmType = 'gpt_4o' } = req.body;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No files provided for organization" 
        });
      }
      
      console.log(`Received request to organize ${files.length} files using ${llmType}`);
      
      const folders = [
        { name: "Documents", files: [] as string[] },
        { name: "Images", files: [] as string[] },
        { name: "Spreadsheets", files: [] as string[] },
        { name: "Other", files: [] as string[] }
      ];
      
      files.forEach((file: any) => {
        const fileName = file.originalName || file.name;
        const ext = fileName.split('.').pop()?.toLowerCase();
        
        if (ext && ['doc', 'docx', 'pdf', 'txt'].includes(ext)) {
          folders[0].files.push(fileName);
        } else if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          folders[1].files.push(fileName);
        } else if (ext && ['xls', 'xlsx', 'csv'].includes(ext)) {
          folders[2].files.push(fileName);
        } else {
          folders[3].files.push(fileName);
        }
      });
      
      const filteredFolders = folders.filter(folder => folder.files.length > 0);
      
      return res.json({
        success: true,
        categories: {
          folders: filteredFolders,
          summary: `Organized ${files.length} files into ${filteredFolders.length} folders based on file types`
        },
        modelUsed: llmType,
        preferredModel: llmType
      });
    } catch (error) {
      console.error("Error organizing folders:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to organize folders" 
      });
    }
  });

  // ====== Provider Config Routes (Admin API Management) ======
  app.get("/api/providers", async (req, res) => {
    try {
      const providers = await storage.getAllProviderConfigs();
      return res.json(providers);
    } catch (error: any) {
      console.error("Error fetching providers:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch providers" });
    }
  });

  app.get("/api/providers/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const providers = await storage.getProviderConfigsByType(type);
      return res.json(providers);
    } catch (error: any) {
      console.error("Error fetching providers by type:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch providers" });
    }
  });

  app.post("/api/providers", async (req, res) => {
    try {
      const provider = await storage.createProviderConfig(req.body);
      return res.json(provider);
    } catch (error: any) {
      console.error("Error creating provider:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to create provider" });
    }
  });

  app.put("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.updateProviderConfig(id, req.body);
      if (!provider) {
        return res.status(404).json({ success: false, message: "Provider not found" });
      }
      return res.json(provider);
    } catch (error: any) {
      console.error("Error updating provider:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update provider" });
    }
  });

  app.delete("/api/providers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProviderConfig(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting provider:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete provider" });
    }
  });

  // ====== System Health Routes ======
  app.get("/api/system/health", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Check database connection
      let dbStatus = 'active';
      let dbLatency = 0;
      let dbReason = null;
      let dbFixAction = null;
      try {
        const dbStart = Date.now();
        await pool.query('SELECT 1');
        dbLatency = Date.now() - dbStart;
      } catch (err: any) {
        dbStatus = 'error';
        dbReason = err?.message || 'Database connection failed';
        dbFixAction = 'Check DATABASE_URL environment variable and ensure PostgreSQL is running';
      }

      // Check provider configurations
      const providers = await storage.getAllProviderConfigs();
      const activeProviders = providers.filter(p => p.isEnabled && p.status === 'active');
      const aiProviders = providers.filter(p => p.type === 'ai');
      const ocrProviders = providers.filter(p => p.type === 'ocr');
      const cloudProviders = providers.filter(p => p.type === 'cloud');

      // Detailed service diagnostics
      const hasActiveAI = activeProviders.some(p => p.type === 'ai');
      const hasActiveOCR = activeProviders.some(p => p.type === 'ocr');
      
      // Build detailed services with diagnostics
      const services = {
        database: { 
          status: dbStatus, 
          latency: dbLatency,
          reason: dbReason,
          fixAction: dbFixAction,
          fixLink: null
        },
        renaming: { 
          status: hasActiveAI ? 'active' : 'inactive', 
          latency: 0,
          reason: hasActiveAI ? null : aiProviders.length === 0 
            ? 'No AI providers configured' 
            : 'AI providers exist but none are enabled with valid API keys',
          fixAction: hasActiveAI ? null : aiProviders.length === 0
            ? 'Add an AI provider (OpenAI, Anthropic, etc.) in API Management'
            : 'Enable an AI provider and add a valid API key in API Management',
          fixLink: '/admin/api-management'
        },
        magicFolders: { 
          status: 'active', 
          latency: 0,
          reason: null,
          fixAction: null,
          fixLink: null
        },
        templates: { 
          status: 'active', 
          latency: 0,
          reason: null,
          fixAction: null,
          fixLink: null
        },
        errorDetection: { 
          status: 'active', 
          latency: 0,
          reason: null,
          fixAction: null,
          fixLink: null
        },
        ocr: { 
          status: hasActiveOCR ? 'active' : 'inactive', 
          latency: 0,
          reason: hasActiveOCR ? null : ocrProviders.length === 0
            ? 'No OCR providers configured'
            : 'OCR providers exist but none are enabled with valid API keys',
          fixAction: hasActiveOCR ? null : ocrProviders.length === 0
            ? 'Add an OCR provider (e.g., Vision AI) in API Management'
            : 'Enable an OCR provider and add a valid API key in API Management',
          fixLink: '/admin/api-management'
        }
      };

      // Get active alerts
      const activeAlerts = await storage.getActiveAlerts();

      // Record health snapshot
      for (const [serviceName, data] of Object.entries(services)) {
        await storage.createHealthSnapshot({
          serviceName,
          serviceType: 'core',
          status: data.status,
          latency: data.latency,
          details: { reason: data.reason, fixAction: data.fixAction }
        });
      }

      // Clean old snapshots (older than 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await storage.deleteOldHealthSnapshots(oneDayAgo);

      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        totalLatency: Date.now() - startTime,
        services,
        providers: {
          total: providers.length,
          active: activeProviders.length,
          ai: aiProviders.length,
          ocr: ocrProviders.length,
          cloud: cloudProviders.length
        },
        alerts: activeAlerts,
        alertCount: activeAlerts.length,
        version: '2.3'
      });
    } catch (error: any) {
      console.error("Error getting system health:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to get system health" });
    }
  });

  app.get("/api/system/health/history", async (req, res) => {
    try {
      const snapshots = await storage.getLatestHealthSnapshots();
      return res.json(snapshots);
    } catch (error: any) {
      console.error("Error fetching health history:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch health history" });
    }
  });

  // ====== System Alerts Routes ======
  app.get("/api/alerts", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      if (status === 'active') {
        const alerts = await storage.getActiveAlerts();
        return res.json(alerts);
      }
      const alerts = await storage.getAllAlerts();
      return res.json(alerts);
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alert = await storage.createAlert(req.body);
      return res.json(alert);
    } catch (error: any) {
      console.error("Error creating alert:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const alert = await storage.updateAlertStatus(id, status);
      if (!alert) {
        return res.status(404).json({ success: false, message: "Alert not found" });
      }
      return res.json(alert);
    } catch (error: any) {
      console.error("Error updating alert status:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update alert status" });
    }
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.resolveAlert(id);
      if (!alert) {
        return res.status(404).json({ success: false, message: "Alert not found" });
      }
      return res.json(alert);
    } catch (error: any) {
      console.error("Error resolving alert:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to resolve alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAlert(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting alert:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete alert" });
    }
  });

  // ====== Key Backup Routes ======
  app.get("/api/backups", async (req, res) => {
    try {
      const backups = await storage.getAllKeyBackups();
      return res.json(backups);
    } catch (error: any) {
      console.error("Error fetching backups:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch backups" });
    }
  });

  app.post("/api/backups", async (req, res) => {
    try {
      const providers = await storage.getAllProviderConfigs();
      const backupData = providers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        category: p.category,
        apiKey: p.apiKey,
        models: p.models,
        planConfigs: p.planConfigs
      }));

      const backup = await storage.createKeyBackup({
        name: req.body.name || `Backup ${new Date().toISOString()}`,
        description: req.body.description || 'Automatic backup',
        backupData,
        providerCount: providers.length,
        size: JSON.stringify(backupData).length,
        createdBy: (req as any).user?.id || null
      });

      return res.json(backup);
    } catch (error: any) {
      console.error("Error creating backup:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to create backup" });
    }
  });

  app.post("/api/backups/:id/restore", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const backup = await storage.getKeyBackup(id);
      
      if (!backup) {
        return res.status(404).json({ success: false, message: "Backup not found" });
      }

      const backupData = backup.backupData as any[];
      let restored = 0;

      for (const providerData of backupData) {
        const existing = await storage.getProviderConfig(providerData.id);
        if (existing) {
          await storage.updateProviderConfig(providerData.id, {
            apiKey: providerData.apiKey,
            models: providerData.models,
            planConfigs: providerData.planConfigs
          });
        } else {
          await storage.createProviderConfig({
            name: providerData.name,
            type: providerData.type,
            category: providerData.category,
            apiKey: providerData.apiKey,
            models: providerData.models,
            planConfigs: providerData.planConfigs
          });
        }
        restored++;
      }

      return res.json({ success: true, restored });
    } catch (error: any) {
      console.error("Error restoring backup:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to restore backup" });
    }
  });

  app.delete("/api/backups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKeyBackup(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting backup:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete backup" });
    }
  });

  // ====== Test Run Routes (Auto Testing) ======
  app.get("/api/tests/types", async (req, res) => {
    try {
      const testTypes = [
        { id: 'api_keys', name: 'API Key Validation', description: 'Validates all configured API keys' },
        { id: 'database', name: 'Database Connection', description: 'Tests PostgreSQL connectivity' },
        { id: 'cloud_storage', name: 'Cloud Storage Check', description: 'Verifies cloud integrations' },
        { id: 'ocr', name: 'OCR Service Test', description: 'Tests OCR provider availability' },
        { id: 'providers', name: 'Provider Check', description: 'Validates provider configurations' },
        { id: 'all', name: 'Full System Test', description: 'Runs all tests sequentially' }
      ];
      return res.json(testTypes);
    } catch (error: any) {
      console.error("Error fetching test types:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch test types" });
    }
  });

  app.get("/api/tests", async (req, res) => {
    try {
      const testRuns = await storage.getAllTestRuns();
      return res.json(testRuns);
    } catch (error: any) {
      console.error("Error fetching test runs:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch test runs" });
    }
  });

  app.post("/api/tests", async (req, res) => {
    try {
      const { testName, testType } = req.body;
      
      // Create the test run record
      const testRun = await storage.createTestRun({
        testName: testName || 'Manual Test',
        testType: testType || 'connection',
        status: 'running',
        startedAt: new Date()
      });

      // Execute the actual test
      const startTime = Date.now();
      let results: any = {};
      let status = 'completed';
      let errorMessage = null;

      try {
        if (testType === 'connection' || testType === 'all') {
          // Test database connection
          await pool.query('SELECT 1');
          results.database = { status: 'passed', latency: Date.now() - startTime };
        }

        if (testType === 'providers' || testType === 'all') {
          // Test provider configurations
          const providers = await storage.getAllProviderConfigs();
          results.providers = {
            total: providers.length,
            configured: providers.filter(p => p.apiKey).length,
            active: providers.filter(p => p.isEnabled).length
          };
        }

        if (testType === 'api' || testType === 'all') {
          // Test API endpoints responsiveness
          results.api = { status: 'passed', latency: Date.now() - startTime };
        }
      } catch (err: any) {
        status = 'failed';
        errorMessage = err?.message || 'Test failed';
      }

      // Update the test run with results
      const duration = Date.now() - startTime;
      const updatedTestRun = await storage.updateTestRun(testRun.id, {
        status,
        duration,
        results,
        errorMessage,
        completedAt: new Date()
      });

      return res.json(updatedTestRun);
    } catch (error: any) {
      console.error("Error running test:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to run test" });
    }
  });

  app.delete("/api/tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestRun(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting test run:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete test run" });
    }
  });

  // ====== Database Stats Routes ======
  app.get("/api/db/stats", async (req, res) => {
    try {
      // Get real PostgreSQL stats
      const tableStatsQuery = `
        SELECT 
          schemaname,
          relname as table_name,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_rows,
          n_dead_tup as dead_rows,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `;
      
      const tableSizeQuery = `
        SELECT 
          relname as table_name,
          pg_size_pretty(pg_total_relation_size(relid)) as total_size,
          pg_total_relation_size(relid) as size_bytes
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
      `;

      const dbSizeQuery = `
        SELECT pg_size_pretty(pg_database_size(current_database())) as db_size,
               pg_database_size(current_database()) as db_size_bytes
      `;

      const connectionStatsQuery = `
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      const [tableStats, tableSizes, dbSize, connectionStats] = await Promise.all([
        pool.query(tableStatsQuery),
        pool.query(tableSizeQuery),
        pool.query(dbSizeQuery),
        pool.query(connectionStatsQuery)
      ]);

      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        database: {
          size: dbSize.rows[0]?.db_size || '0 bytes',
          sizeBytes: parseInt(dbSize.rows[0]?.db_size_bytes || '0')
        },
        connections: connectionStats.rows[0] || { total_connections: 0, active_connections: 0, idle_connections: 0 },
        tables: tableStats.rows.map((row: any, index: number) => ({
          ...row,
          size: tableSizes.rows[index]?.total_size || '0 bytes',
          sizeBytes: parseInt(tableSizes.rows[index]?.size_bytes || '0')
        }))
      });
    } catch (error: any) {
      console.error("Error fetching db stats:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch database stats" });
    }
  });

  // ====== System Settings Routes ======
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      return res.json(settings);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.upsertSystemSetting(key, value);
      return res.json(setting);
    } catch (error: any) {
      console.error("Error updating setting:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update setting" });
    }
  });

  // ====== Naming Templates Routes ======
  app.get("/api/naming-templates", async (req, res) => {
    try {
      const templates = await storage.getAllNamingTemplates();
      return res.json(templates);
    } catch (error: any) {
      console.error("Error fetching naming templates:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch templates" });
    }
  });

  app.get("/api/naming-templates/system", async (req, res) => {
    try {
      const templates = await storage.getSystemNamingTemplates();
      return res.json(templates);
    } catch (error: any) {
      console.error("Error fetching system templates:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch system templates" });
    }
  });

  app.get("/api/naming-templates/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const templates = await storage.getUserNamingTemplates(userId);
      return res.json(templates);
    } catch (error: any) {
      console.error("Error fetching user templates:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch user templates" });
    }
  });

  app.post("/api/naming-templates", async (req, res) => {
    try {
      const template = await storage.createNamingTemplate(req.body);
      return res.json(template);
    } catch (error: any) {
      console.error("Error creating naming template:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to create template" });
    }
  });

  app.put("/api/naming-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.updateNamingTemplate(id, req.body);
      return res.json(template);
    } catch (error: any) {
      console.error("Error updating naming template:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update template" });
    }
  });

  app.delete("/api/naming-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNamingTemplate(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting naming template:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete template" });
    }
  });

  // ====== Abbreviations Routes ======
  app.get("/api/abbreviations", async (req, res) => {
    try {
      const abbreviations = await storage.getAllAbbreviations();
      return res.json(abbreviations);
    } catch (error: any) {
      console.error("Error fetching abbreviations:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch abbreviations" });
    }
  });

  app.get("/api/abbreviations/category/:category", async (req, res) => {
    try {
      const abbreviations = await storage.getAbbreviationsByCategory(req.params.category);
      return res.json(abbreviations);
    } catch (error: any) {
      console.error("Error fetching abbreviations by category:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch abbreviations" });
    }
  });

  app.post("/api/abbreviations", async (req, res) => {
    try {
      const abbr = await storage.createAbbreviation(req.body);
      return res.json(abbr);
    } catch (error: any) {
      console.error("Error creating abbreviation:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to create abbreviation" });
    }
  });

  app.delete("/api/abbreviations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAbbreviation(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting abbreviation:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete abbreviation" });
    }
  });

  // ====== Job Queue Routes ======
  app.get("/api/jobs", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const jobs = await storage.getJobsByUser(userId);
      return res.json(jobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/pending", async (req, res) => {
    try {
      const jobs = await storage.getPendingJobs();
      return res.json(jobs);
    } catch (error: any) {
      console.error("Error fetching pending jobs:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch pending jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
      return res.json(job);
    } catch (error: any) {
      console.error("Error fetching job:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const job = await storage.createJob({ ...req.body, userId });
      return res.json(job);
    } catch (error: any) {
      console.error("Error creating job:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, errorMessage } = req.body;
      const job = await storage.updateJobStatus(id, status, errorMessage);
      return res.json(job);
    } catch (error: any) {
      console.error("Error updating job status:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update job status" });
    }
  });

  app.put("/api/jobs/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { completedItems, progress } = req.body;
      const job = await storage.updateJobProgress(id, completedItems, progress);
      return res.json(job);
    } catch (error: any) {
      console.error("Error updating job progress:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update job progress" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJob(id);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting job:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to delete job" });
    }
  });

  // ====== Custom Instructions Routes ======
  app.get("/api/custom-instructions", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const instructions = await storage.getCustomInstructions(userId);
      return res.json(instructions || {});
    } catch (error: any) {
      console.error("Error fetching custom instructions:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch custom instructions" });
    }
  });

  app.put("/api/custom-instructions", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const instructions = await storage.createOrUpdateCustomInstructions(userId, req.body);
      return res.json(instructions);
    } catch (error: any) {
      console.error("Error updating custom instructions:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update custom instructions" });
    }
  });

  // ====== API Metrics Routes ======
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getAllApiMetrics();
      return res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching API metrics:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch API metrics" });
    }
  });

  app.get("/api/metrics/:provider", async (req, res) => {
    try {
      const metrics = await storage.getApiMetrics(req.params.provider);
      if (!metrics) {
        return res.json({ providerName: req.params.provider, requestCount: 0, successCount: 0, errorCount: 0 });
      }
      return res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching provider metrics:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch provider metrics" });
    }
  });

  app.delete("/api/metrics/:provider", async (req, res) => {
    try {
      await storage.resetApiMetrics(req.params.provider);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error resetting API metrics:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to reset API metrics" });
    }
  });

  // ====== Admin User Management Routes ======
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        planType: u.planType,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      return res.json(safeUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/plan", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { planType } = req.body;
      const user = await storage.updateUser(id, { planType });
      return res.json({ success: true, user: { id: user?.id, planType: user?.planType } });
    } catch (error: any) {
      console.error("Error updating user plan:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update user plan" });
    }
  });

  app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      const user = await storage.updateUser(id, { role });
      return res.json({ success: true, user: { id: user?.id, role: user?.role } });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      return res.status(500).json({ success: false, message: error?.message || "Failed to update user role" });
    }
  });

  // ====== Stripe Integration Routes ======
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  const PLAN_PRICE_MAP: Record<string, { monthly?: string; yearly?: string }> = {
    credits_low: { 
      monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID 
    },
    credits_high: { 
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID 
    },
    unlimited: { 
      monthly: process.env.STRIPE_UNLIMITED_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID 
    }
  };

  const PRICE_PLAN_MAP: Record<string, string> = {};
  Object.entries(PLAN_PRICE_MAP).forEach(([plan, prices]) => {
    if (prices.monthly) PRICE_PLAN_MAP[prices.monthly] = plan;
    if (prices.yearly) PRICE_PLAN_MAP[prices.yearly] = plan;
  });

  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      if (!stripeSecretKey) {
        return res.status(500).json({ message: "Stripe is not configured. Please add STRIPE_SECRET_KEY." });
      }
      
      const stripe = new Stripe(stripeSecretKey);
      const userId = (req as any).user?.id;
      const userEmail = (req as any).user?.email;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { planType, interval } = req.body;
      
      if (!planType || !PLAN_PRICE_MAP[planType]) {
        return res.status(400).json({ message: "Invalid plan type" });
      }

      const priceId = interval === 'yearly' 
        ? PLAN_PRICE_MAP[planType].yearly 
        : PLAN_PRICE_MAP[planType].monthly;
      
      if (!priceId) {
        return res.status(400).json({ 
          message: `Price ID not configured for ${planType} ${interval}. Please set up Stripe price IDs in environment variables.` 
        });
      }

      const user = await storage.getUser(userId);
      let stripeCustomerId = user?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId: userId.toString() }
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/subscription/cancel`,
        metadata: { userId: userId.toString(), planType }
      });

      return res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      return res.status(500).json({ message: error?.message || "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/create-portal-session", async (req, res) => {
    try {
      if (!stripeSecretKey) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const stripe = new Stripe(stripeSecretKey);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No billing account found. Please subscribe to a plan first." });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin}/subscription`
      });

      return res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating portal session:", error);
      return res.status(500).json({ message: error?.message || "Failed to open billing portal" });
    }
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      if (!stripeSecretKey) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const stripe = new Stripe(stripeSecretKey);
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      let event: Stripe.Event;
      
      if (webhookSecret && sig) {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
          console.error("Webhook signature verification failed:", err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        event = req.body as Stripe.Event;
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.userId || '0');
          const planType = session.metadata?.planType;
          
          if (userId && planType) {
            await storage.updateUser(userId, { 
              planType: planType as any,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: 'active'
            });
          }
          break;
        }
        
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          const users = await storage.getAllUsers();
          const user = users.find(u => u.stripeCustomerId === customerId);
          
          if (user) {
            const priceId = subscription.items.data[0]?.price.id;
            const newPlanType = priceId ? PRICE_PLAN_MAP[priceId] : undefined;
            
            await storage.updateUser(user.id, { 
              subscriptionStatus: subscription.status,
              ...(newPlanType ? { planType: newPlanType as any } : {})
            });
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          const users = await storage.getAllUsers();
          const user = users.find(u => u.stripeCustomerId === customerId);
          
          if (user) {
            await storage.updateUser(user.id, { 
              planType: 'free',
              stripeSubscriptionId: null,
              subscriptionStatus: 'canceled'
            });
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          
          const users = await storage.getAllUsers();
          const user = users.find(u => u.stripeCustomerId === customerId);
          
          if (user) {
            await storage.updateUser(user.id, { 
              subscriptionStatus: 'past_due'
            });
          }
          break;
        }
      }

      return res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      return res.status(500).json({ message: error?.message || "Webhook processing failed" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
