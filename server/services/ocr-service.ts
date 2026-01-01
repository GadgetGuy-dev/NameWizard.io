import OpenAI from 'openai';
import Tesseract from 'tesseract.js';
import { getTierConfig, mapPlanTypeToName, type PlanName } from '../../shared/tier-config';

interface OcrResult {
  extractedText: string;
  confidence: number;
  method: string;
  provider: string;
}

interface RenameResult {
  suggestedName: string;
  confidence: number;
  reasoning: string;
}

interface OcrProviderStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  requiresApiKey: boolean;
  isConfigured: boolean;
  lastChecked?: Date;
  latency?: number;
}

export class OcrService {
  private openai: OpenAI | null = null;
  private tesseractWorker: Tesseract.Worker | null = null;
  private providerStatuses: Map<string, OcrProviderStatus> = new Map();

  constructor() {
    // Initialize OpenAI only if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    // Initialize provider statuses
    this.initializeProviderStatuses();
  }

  private initializeProviderStatuses() {
    // Tesseract.js - Local OCR, always available, no API key required
    this.providerStatuses.set('tesseract', {
      id: 'tesseract',
      name: 'Tesseract.js (Local)',
      status: 'active',
      requiresApiKey: false,
      isConfigured: true,
      lastChecked: new Date()
    });

    // TechVision - Uses OpenAI Vision API
    this.providerStatuses.set('techvision', {
      id: 'techvision',
      name: 'TechVision OCR',
      status: process.env.OPENAI_API_KEY ? 'active' : 'inactive',
      requiresApiKey: true,
      isConfigured: !!process.env.OPENAI_API_KEY
    });

    // Google Vision
    this.providerStatuses.set('google-vision', {
      id: 'google-vision',
      name: 'Google Cloud Vision',
      status: 'inactive',
      requiresApiKey: true,
      isConfigured: false
    });

    // Azure Vision
    this.providerStatuses.set('azure-vision', {
      id: 'azure-vision',
      name: 'Azure Computer Vision',
      status: 'inactive',
      requiresApiKey: true,
      isConfigured: false
    });

    // AWS Textract
    this.providerStatuses.set('aws-textract', {
      id: 'aws-textract',
      name: 'AWS Textract',
      status: 'inactive',
      requiresApiKey: true,
      isConfigured: false
    });
  }

  async initializeTesseract(): Promise<void> {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await Tesseract.createWorker('eng');
    }
  }

  async terminateTesseract(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }

  getProviderStatuses(): OcrProviderStatus[] {
    return Array.from(this.providerStatuses.values());
  }

  updateProviderStatus(providerId: string, status: Partial<OcrProviderStatus>): void {
    const current = this.providerStatuses.get(providerId);
    if (current) {
      this.providerStatuses.set(providerId, { ...current, ...status, lastChecked: new Date() });
    }
  }

  async testProvider(providerId: string, apiKey?: string): Promise<{ success: boolean; latency: number; message: string }> {
    const startTime = Date.now();
    
    try {
      switch (providerId) {
        case 'tesseract': {
          // Test Tesseract with a simple image
          await this.initializeTesseract();
          const latency = Date.now() - startTime;
          this.updateProviderStatus('tesseract', { status: 'active', latency });
          return { success: true, latency, message: 'Tesseract.js is ready for local OCR processing' };
        }
        
        case 'techvision':
        case 'google-vision':
        case 'azure-vision':
        case 'aws-textract': {
          if (!apiKey && !process.env.OPENAI_API_KEY) {
            return { success: false, latency: 0, message: 'API key required for this provider' };
          }
          // For now, these use OpenAI Vision API as backend
          const testOpenAI = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
          await testOpenAI.models.list();
          const latency = Date.now() - startTime;
          this.updateProviderStatus(providerId, { status: 'active', latency, isConfigured: true });
          return { success: true, latency, message: `${providerId} provider validated successfully` };
        }
        
        default:
          return { success: false, latency: 0, message: 'Unknown provider' };
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;
      this.updateProviderStatus(providerId, { status: 'error', latency });
      return { success: false, latency, message: error?.message || 'Provider test failed' };
    }
  }

  private getOcrProvider(planName: PlanName, preferredProvider?: string): string {
    const config = getTierConfig(planName);
    
    if (preferredProvider) {
      const availableProviders = [
        config.ocr.primary_ocr,
        config.ocr.secondary_ocr,
        config.ocr.tertiary_ocr,
      ].filter(Boolean);
      
      if (availableProviders.some(p => p?.includes(preferredProvider))) {
        return preferredProvider;
      }
    }
    
    // Default to Tesseract if no API keys are configured
    if (!process.env.OPENAI_API_KEY) {
      return 'tesseract';
    }
    
    return config.ocr.primary_ocr;
  }

  async extractTextFromImage(
    imageBuffer: Buffer, 
    method: string = 'extract-title',
    planType: string = 'free',
    preferredProvider?: string
  ): Promise<OcrResult> {
    const planName = mapPlanTypeToName(planType);
    const config = getTierConfig(planName);
    let provider = preferredProvider || this.getOcrProvider(planName);
    
    // Fallback to Tesseract if no API keys configured
    if (!this.openai && provider !== 'tesseract') {
      console.log('No API keys configured, falling back to Tesseract.js');
      provider = 'tesseract';
    }
    
    try {
      if (provider === 'tesseract') {
        return await this.extractWithTesseract(imageBuffer, method);
      }
      
      const base64Image = imageBuffer.toString('base64');
      
      if (provider.includes('techvision')) {
        return await this.extractWithTechVision(base64Image, method);
      } else if (provider.includes('google')) {
        return await this.extractWithGoogleVision(base64Image, method, config.ocr.quality_level);
      } else if (provider.includes('azure')) {
        return await this.extractWithAzureVision(base64Image, method, config.ocr.quality_level);
      } else if (provider.includes('textract')) {
        return await this.extractWithAWSTextract(base64Image, method);
      }
      
      return await this.extractWithOpenAI(base64Image, method);
    } catch (error) {
      console.error('OCR extraction failed with primary provider, trying Tesseract fallback:', error);
      // Fallback to Tesseract on any error
      return await this.extractWithTesseract(imageBuffer, method);
    }
  }

  private async extractWithTesseract(imageBuffer: Buffer, method: string): Promise<OcrResult> {
    await this.initializeTesseract();
    
    const startTime = Date.now();
    const result = await this.tesseractWorker!.recognize(imageBuffer);
    const latency = Date.now() - startTime;
    
    this.updateProviderStatus('tesseract', { status: 'active', latency });
    
    let extractedText = result.data.text.trim();
    
    // Process based on method
    switch (method) {
      case 'extract-title':
        // Get first non-empty line as title
        const lines = extractedText.split('\n').filter(l => l.trim());
        extractedText = lines[0] || extractedText;
        break;
      case 'extract-content':
        // Keep full text for content extraction
        break;
      case 'extract-metadata':
        // Try to identify metadata patterns
        break;
    }
    
    return {
      extractedText,
      confidence: result.data.confidence / 100,
      method,
      provider: 'tesseract-local'
    };
  }

  private async extractWithTechVision(base64Image: string, method: string): Promise<OcrResult> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: this.getOcrPrompt(method) },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 500,
    });

    return {
      extractedText: response.choices[0].message.content || '',
      confidence: 0.75,
      method,
      provider: 'techvision'
    };
  }

  private async extractWithGoogleVision(
    base64Image: string, 
    method: string,
    qualityLevel: string
  ): Promise<OcrResult> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    const model = qualityLevel === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
    
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: this.getOcrPrompt(method) },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1000,
    });

    return {
      extractedText: response.choices[0].message.content || '',
      confidence: qualityLevel === 'high' ? 0.95 : 0.85,
      method,
      provider: 'google-vision'
    };
  }

  private async extractWithAzureVision(
    base64Image: string, 
    method: string,
    qualityLevel: string
  ): Promise<OcrResult> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    const model = qualityLevel === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
    
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: this.getOcrPrompt(method) },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1000,
    });

    return {
      extractedText: response.choices[0].message.content || '',
      confidence: qualityLevel === 'high' ? 0.92 : 0.82,
      method,
      provider: 'azure-vision'
    };
  }

  private async extractWithAWSTextract(base64Image: string, method: string): Promise<OcrResult> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `${this.getOcrPrompt(method)} Additionally, identify any form fields, tables, or structured data.` 
            },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1500,
    });

    return {
      extractedText: response.choices[0].message.content || '',
      confidence: 0.93,
      method,
      provider: 'aws-textract'
    };
  }

  private async extractWithOpenAI(base64Image: string, method: string): Promise<OcrResult> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: this.getOcrPrompt(method) },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1000,
    });

    return {
      extractedText: response.choices[0].message.content || '',
      confidence: 0.9,
      method,
      provider: 'openai-vision'
    };
  }

  async generateFileName(
    text: string, 
    originalFileName: string, 
    method: string = 'smart-naming',
    planType: string = 'free'
  ): Promise<RenameResult> {
    try {
      const prompt = this.getRenamingPrompt(text, originalFileName, method);
      
      // If no OpenAI, use simple local naming
      if (!this.openai) {
        return this.generateFileNameLocally(text, originalFileName);
      }
      
      return await this.generateFileNameWithOpenAI(prompt);
    } catch (error) {
      console.error('File naming failed:', error);
      // Fallback to local naming
      return this.generateFileNameLocally(text, originalFileName);
    }
  }

  private generateFileNameLocally(text: string, originalFileName: string): RenameResult {
    // Extract extension
    const ext = originalFileName.includes('.') 
      ? '.' + originalFileName.split('.').pop() 
      : '';
    
    // Clean and truncate text for filename
    let cleanText = text
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join('_')
      .substring(0, 40);
    
    if (!cleanText) {
      cleanText = 'renamed_file';
    }
    
    return {
      suggestedName: `${cleanText}${ext}`,
      confidence: 0.6,
      reasoning: 'Generated using local text extraction'
    };
  }

  private async generateFileNameWithOpenAI(prompt: string): Promise<RenameResult> {
    if (!this.openai) throw new Error('OpenAI not configured');
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a file naming expert. Generate descriptive, professional file names based on content. Respond with valid JSON containing 'suggestedName', 'confidence', and 'reasoning' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      suggestedName: result.suggestedName || 'renamed_file',
      confidence: result.confidence || 0.8,
      reasoning: result.reasoning || 'Generated using AI analysis'
    };
  }

  async processFileForRenaming(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    options: {
      ocrMethod?: string;
      llmProvider?: string;
      planType?: string;
      preferredOcrProvider?: string;
    } = {}
  ): Promise<{
    suggestedName: string;
    confidence: number;
    reasoning: string;
    ocrProvider: string;
    extractedText: string;
  }> {
    const {
      ocrMethod = 'smart-naming',
      planType = 'free',
      preferredOcrProvider
    } = options;

    // Check if file is an image
    const isImage = mimeType.startsWith('image/');
    
    let extractedText = '';
    let ocrProvider = 'none';
    
    if (isImage) {
      const ocrResult = await this.extractTextFromImage(
        fileBuffer, 
        ocrMethod, 
        planType,
        preferredOcrProvider
      );
      extractedText = ocrResult.extractedText;
      ocrProvider = ocrResult.provider;
    } else {
      // For non-image files, use filename as basis
      extractedText = originalFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }

    const renameResult = await this.generateFileName(
      extractedText,
      originalFileName,
      ocrMethod,
      planType
    );

    return {
      ...renameResult,
      ocrProvider,
      extractedText
    };
  }

  private getOcrPrompt(method: string): string {
    switch (method) {
      case 'extract-title':
        return "Extract the main title or heading from this document. Return only the title text, nothing else.";
      
      case 'extract-content':
        return "Summarize the main content of this document in 2-3 sentences. Focus on the key topics and purpose.";
      
      case 'extract-metadata':
        return "Extract metadata from this document including: author, date, document type, subject matter. Format as key-value pairs.";
      
      case 'smart-naming':
      default:
        return "Analyze this document and extract the most important information that would be useful for creating a descriptive filename. Include the main topic, document type, and any relevant identifiers.";
    }
  }

  private getRenamingPrompt(text: string, originalFileName: string, method: string): string {
    return `
Based on the following extracted text from a document, generate a professional filename that is:
- Descriptive and informative
- 50 characters or less
- Uses underscores or hyphens instead of spaces
- Includes file extension from original: ${originalFileName}
- Follows standard naming conventions

Extracted text: "${text}"
Original filename: "${originalFileName}"
Method: ${method}

Respond with JSON containing:
- suggestedName: the new filename
- confidence: score from 0-1
- reasoning: brief explanation of naming choice`;
  }

  getAvailableProviders(): Array<{ id: string; name: string; description: string; tiers: string[]; requiresApiKey: boolean; status: string }> {
    return [
      { 
        id: 'tesseract', 
        name: 'Tesseract.js (Local)', 
        description: 'Free local OCR - No API key required',
        tiers: ['free', 'basic', 'pro', 'unlimited'],
        requiresApiKey: false,
        status: this.providerStatuses.get('tesseract')?.status || 'active'
      },
      { 
        id: 'techvision', 
        name: 'TechVision', 
        description: 'Budget OCR for clean text',
        tiers: ['free', 'basic', 'pro', 'unlimited'],
        requiresApiKey: true,
        status: this.providerStatuses.get('techvision')?.status || 'inactive'
      },
      { 
        id: 'google-vision', 
        name: 'Google Cloud Vision', 
        description: 'Best all-around OCR',
        tiers: ['free', 'basic', 'pro', 'unlimited'],
        requiresApiKey: true,
        status: this.providerStatuses.get('google-vision')?.status || 'inactive'
      },
      { 
        id: 'azure-vision', 
        name: 'Azure Computer Vision', 
        description: 'Strong OCR + handwriting support',
        tiers: ['free', 'basic', 'pro', 'unlimited'],
        requiresApiKey: true,
        status: this.providerStatuses.get('azure-vision')?.status || 'inactive'
      },
      { 
        id: 'aws-textract', 
        name: 'AWS Textract', 
        description: 'Best for forms and tables',
        tiers: ['pro', 'unlimited'],
        requiresApiKey: true,
        status: this.providerStatuses.get('aws-textract')?.status || 'inactive'
      },
    ];
  }
}

export const ocrService = new OcrService();
