import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';

export interface AIProviderConfig {
  name: string;
  priority: number;
  enabled: boolean;
  models: {
    text: string;
    vision: string;
  };
  rateLimit?: number;
  apiKey?: string;
}

export interface AIRequest {
  type: 'text' | 'vision';
  prompt: string;
  systemPrompt?: string;
  imageBase64?: string;
  maxTokens?: number;
  userId?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export type PlanTier = 'free' | 'credits_low' | 'credits_high' | 'unlimited';

const PLAN_PROVIDER_PRIORITY: Record<PlanTier, string[]> = {
  free: ['openai'],
  credits_low: ['openai', 'anthropic'],
  credits_high: ['anthropic', 'openai'],
  unlimited: ['anthropic', 'openai'],
};

const PLAN_SPEED_TIERS: Record<PlanTier, 'standard' | 'fast' | 'instant'> = {
  free: 'standard',
  credits_low: 'standard',
  credits_high: 'fast',
  unlimited: 'instant',
};

class AIRouterService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  private getProviderOrder(planTier: PlanTier): string[] {
    return PLAN_PROVIDER_PRIORITY[planTier] || PLAN_PROVIDER_PRIORITY.free;
  }

  private getSpeedTier(planTier: PlanTier): 'standard' | 'fast' | 'instant' {
    return PLAN_SPEED_TIERS[planTier] || 'standard';
  }

  private getMaxTokensBySpeed(speedTier: 'standard' | 'fast' | 'instant'): number {
    switch (speedTier) {
      case 'instant':
        return 4096;
      case 'fast':
        return 2048;
      case 'standard':
      default:
        return 1024;
    }
  }

  private async callOpenAI(request: AIRequest): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const startTime = Date.now();
    try {
      if (request.type === 'vision' && request.imageBase64) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: request.systemPrompt || 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: request.prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${request.imageBase64}` },
                },
              ],
            },
          ],
          max_tokens: request.maxTokens || 1024,
        });

        const latencyMs = Date.now() - startTime;
        await this.recordMetrics('openai', latencyMs, true);

        return {
          content: response.choices[0].message.content || '',
          provider: 'openai',
          model: 'gpt-4o',
          latencyMs,
          success: true,
        };
      } else {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: request.systemPrompt || 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens || 1024,
          response_format: { type: 'json_object' },
        });

        const latencyMs = Date.now() - startTime;
        await this.recordMetrics('openai', latencyMs, true);

        return {
          content: response.choices[0].message.content || '',
          provider: 'openai',
          model: 'gpt-4o',
          latencyMs,
          success: true,
        };
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      await this.recordMetrics('openai', latencyMs, false, error.message);
      throw error;
    }
  }

  private async callAnthropic(request: AIRequest): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    const startTime = Date.now();
    try {
      if (request.type === 'vision' && request.imageBase64) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: request.maxTokens || 1024,
          system: request.systemPrompt || 'You are a helpful assistant.',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: request.imageBase64,
                  },
                },
                { type: 'text', text: request.prompt },
              ],
            },
          ],
        });

        const latencyMs = Date.now() - startTime;
        await this.recordMetrics('anthropic', latencyMs, true);

        const textContent = response.content.find((c) => c.type === 'text');
        return {
          content: textContent && 'text' in textContent ? textContent.text : '',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          latencyMs,
          success: true,
        };
      } else {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: request.maxTokens || 1024,
          system: request.systemPrompt || 'You are a helpful assistant. Respond with valid JSON.',
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
        });

        const latencyMs = Date.now() - startTime;
        await this.recordMetrics('anthropic', latencyMs, true);

        const textContent = response.content.find((c) => c.type === 'text');
        return {
          content: textContent && 'text' in textContent ? textContent.text : '',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          latencyMs,
          success: true,
        };
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      await this.recordMetrics('anthropic', latencyMs, false, error.message);
      throw error;
    }
  }

  private async recordMetrics(
    provider: string,
    latencyMs: number,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await storage.recordApiRequest(provider, latencyMs, success, errorMessage);
    } catch (e) {
      console.error('Failed to record API metrics:', e);
    }
  }

  async route(request: AIRequest, planTier: PlanTier = 'free'): Promise<AIResponse> {
    const providerOrder = this.getProviderOrder(planTier);
    const speedTier = this.getSpeedTier(planTier);
    const maxTokens = request.maxTokens || this.getMaxTokensBySpeed(speedTier);

    const enhancedRequest = { ...request, maxTokens };

    const errors: string[] = [];

    for (const provider of providerOrder) {
      try {
        switch (provider) {
          case 'openai':
            if (this.openai) {
              return await this.callOpenAI(enhancedRequest);
            }
            break;
          case 'anthropic':
            if (this.anthropic) {
              return await this.callAnthropic(enhancedRequest);
            }
            break;
        }
      } catch (error: any) {
        console.error(`Provider ${provider} failed:`, error.message);
        errors.push(`${provider}: ${error.message}`);
        continue;
      }
    }

    return {
      content: '',
      provider: 'none',
      model: 'none',
      latencyMs: 0,
      success: false,
      error: `All providers failed: ${errors.join('; ')}`,
    };
  }

  async generateSuggestedName(
    fileContent: string,
    fileName: string,
    fileType: string,
    planTier: PlanTier = 'free',
    customInstructions?: {
      namingStyle?: string;
      separator?: string;
      dateFormat?: string;
      datePosition?: string;
      customPrefix?: string;
      customSuffix?: string;
      maxLength?: number;
      outputLanguage?: string;
      customPrompt?: string;
    }
  ): Promise<{
    suggestedName: string;
    provider: string;
    confidence: number;
    reasoning: string;
  }> {
    const instructionsText = customInstructions
      ? `
Additional naming preferences:
- Style: ${customInstructions.namingStyle || 'auto'}
- Separator: ${customInstructions.separator || 'underscore'}
- Date format: ${customInstructions.dateFormat || 'YYYY-MM-DD'}
- Date position: ${customInstructions.datePosition || 'prefix'}
- Custom prefix: ${customInstructions.customPrefix || ''}
- Custom suffix: ${customInstructions.customSuffix || ''}
- Max length: ${customInstructions.maxLength || 100}
- Language: ${customInstructions.outputLanguage || 'en'}
${customInstructions.customPrompt ? `- Custom instructions: ${customInstructions.customPrompt}` : ''}
`
      : '';

    const prompt = `Analyze this file and suggest a descriptive, professional filename.

Original filename: ${fileName}
File type: ${fileType}
Content preview: ${fileContent.substring(0, 1000)}
${instructionsText}

Respond with JSON:
{
  "suggestedName": "descriptive_filename.ext",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}`;

    const response = await this.route(
      {
        type: 'text',
        prompt,
        systemPrompt:
          'You are a file naming expert. Generate descriptive, professional file names based on content. Always respond with valid JSON.',
      },
      planTier
    );

    if (!response.success) {
      return {
        suggestedName: fileName,
        provider: 'none',
        confidence: 0,
        reasoning: response.error || 'Failed to generate name',
      };
    }

    try {
      const parsed = JSON.parse(response.content);
      return {
        suggestedName: parsed.suggestedName || fileName,
        provider: response.provider,
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'AI-generated suggestion',
      };
    } catch {
      return {
        suggestedName: fileName,
        provider: response.provider,
        confidence: 0.5,
        reasoning: 'Failed to parse AI response',
      };
    }
  }

  async processImageOCR(
    imageBase64: string,
    fileName: string,
    planTier: PlanTier = 'free'
  ): Promise<{
    extractedText: string;
    suggestedName: string;
    provider: string;
    confidence: number;
  }> {
    const prompt = `Analyze this image and:
1. Extract any visible text (OCR)
2. Identify the main subject/content
3. Suggest a descriptive filename

Original filename: ${fileName}

Respond with JSON:
{
  "extractedText": "Any text found in the image",
  "suggestedName": "descriptive_filename.ext",
  "confidence": 0.95
}`;

    const response = await this.route(
      {
        type: 'vision',
        prompt,
        imageBase64,
        systemPrompt:
          'You are an OCR and image analysis expert. Extract text and suggest descriptive filenames. Always respond with valid JSON.',
      },
      planTier
    );

    if (!response.success) {
      return {
        extractedText: '',
        suggestedName: fileName,
        provider: 'none',
        confidence: 0,
      };
    }

    try {
      const parsed = JSON.parse(response.content);
      return {
        extractedText: parsed.extractedText || '',
        suggestedName: parsed.suggestedName || fileName,
        provider: response.provider,
        confidence: parsed.confidence || 0.8,
      };
    } catch {
      return {
        extractedText: response.content,
        suggestedName: fileName,
        provider: response.provider,
        confidence: 0.5,
      };
    }
  }

  getAvailableProviders(): { name: string; available: boolean }[] {
    return [
      { name: 'openai', available: !!this.openai },
      { name: 'anthropic', available: !!this.anthropic },
    ];
  }
}

export const aiRouterService = new AIRouterService();
