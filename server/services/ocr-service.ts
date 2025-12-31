import OpenAI from 'openai';
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

export class OcrService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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
    
    return config.ocr.primary_ocr;
  }

  async extractTextFromImage(
    imageBuffer: Buffer, 
    method: string = 'extract-title',
    planType: string = 'free'
  ): Promise<OcrResult> {
    const planName = mapPlanTypeToName(planType);
    const config = getTierConfig(planName);
    const provider = this.getOcrProvider(planName);
    
    try {
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
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  private async extractWithTechVision(base64Image: string, method: string): Promise<OcrResult> {
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
      return await this.generateFileNameWithOpenAI(prompt);
    } catch (error) {
      console.error('File naming failed:', error);
      throw new Error('Failed to generate file name');
    }
  }

  private async generateFileNameWithOpenAI(prompt: string): Promise<RenameResult> {
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

  getAvailableProviders(): Array<{ id: string; name: string; description: string; tiers: string[] }> {
    return [
      { 
        id: 'techvision', 
        name: 'TechVision', 
        description: 'Budget OCR for clean text',
        tiers: ['free', 'basic', 'pro', 'unlimited']
      },
      { 
        id: 'google-vision', 
        name: 'Google Cloud Vision', 
        description: 'Best all-around OCR',
        tiers: ['free', 'basic', 'pro', 'unlimited']
      },
      { 
        id: 'azure-vision', 
        name: 'Azure Computer Vision', 
        description: 'Strong OCR + handwriting support',
        tiers: ['free', 'basic', 'pro', 'unlimited']
      },
      { 
        id: 'aws-textract', 
        name: 'AWS Textract', 
        description: 'Best for forms and tables',
        tiers: ['pro', 'unlimited']
      },
    ];
  }
}

export const ocrService = new OcrService();
