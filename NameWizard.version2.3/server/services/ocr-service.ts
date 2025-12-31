import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface OcrResult {
  extractedText: string;
  confidence: number;
  method: string;
}

interface RenameResult {
  suggestedName: string;
  confidence: number;
  reasoning: string;
}

export class OcrService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async extractTextFromImage(imageBuffer: Buffer, method: string = 'extract-title'): Promise<OcrResult> {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      // Use GPT-4o for OCR processing
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.getOcrPrompt(method)
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      });

      const extractedText = response.choices[0].message.content || '';
      
      return {
        extractedText,
        confidence: 0.9, // GPT-4o typically has high confidence
        method
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async generateFileName(
    text: string, 
    originalFileName: string, 
    method: string = 'smart-naming',
    llmProvider: string = 'openai'
  ): Promise<RenameResult> {
    try {
      const prompt = this.getRenamingPrompt(text, originalFileName, method);
      
      if (llmProvider === 'anthropic') {
        return await this.generateFileNameWithAnthropic(prompt);
      } else {
        return await this.generateFileNameWithOpenAI(prompt);
      }
    } catch (error) {
      console.error('File naming failed:', error);
      throw new Error('Failed to generate file name');
    }
  }

  private async generateFileNameWithOpenAI(prompt: string): Promise<RenameResult> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
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

  private async generateFileNameWithAnthropic(prompt: string): Promise<RenameResult> {
    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: "You are a file naming expert. Generate descriptive, professional file names based on content. Respond with valid JSON containing 'suggestedName', 'confidence', and 'reasoning' fields.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Anthropic');
    }
    const result = JSON.parse(content.text || '{}');
    
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
    const basePrompt = `
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
- reasoning: brief explanation of naming choice
`;

    return basePrompt;
  }

  async processFileForRenaming(
    fileBuffer: Buffer,
    originalFileName: string,
    options: {
      ocrMethod?: string;
      llmProvider?: string;
      isImage?: boolean;
    } = {}
  ): Promise<RenameResult> {
    const { ocrMethod = 'smart-naming', llmProvider = 'openai', isImage = true } = options;

    try {
      let extractedText = '';

      if (isImage) {
        // Extract text using OCR
        const ocrResult = await this.extractTextFromImage(fileBuffer, ocrMethod);
        extractedText = ocrResult.extractedText;
      } else {
        // For non-image files, we might implement text extraction differently
        extractedText = fileBuffer.toString('utf-8').substring(0, 1000); // First 1000 chars
      }

      // Generate filename using LLM
      const renameResult = await this.generateFileName(
        extractedText,
        originalFileName,
        ocrMethod,
        llmProvider
      );

      return renameResult;
    } catch (error) {
      console.error('File processing failed:', error);
      throw new Error('Failed to process file for renaming');
    }
  }
}

export const ocrService = new OcrService();