import OpenAI from 'openai';
import { storage } from '../storage';
import { TIER_CONFIGS, getTierConfig, mapPlanTypeToName, getModelForStage, type PlanName } from '../../shared/tier-config';

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
  stage?: 'a' | 'b';
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export type PlanTier = 'free' | 'medium' | 'premium';

/**
 * MODEL_MAPPINGS - Maps logical model IDs to actual API endpoints
 * 
 * NOTE: GPT-5 models are mapped to GPT-4o variants as placeholders until 
 * the GPT-5 API becomes available. This allows the tier configuration to
 * use forward-looking model names while still functioning with current APIs.
 * 
 * When GPT-5 API is released, update the apiModel values:
 * - 'gpt-5-nano' → 'gpt-5-nano' (or actual API model name)
 * - 'gpt-5.2' → 'gpt-5.2' (or actual API model name)
 * 
 * Similarly for Gemini, Mistral, and Llama - update when APIs are configured.
 */
const MODEL_MAPPINGS: Record<string, { provider: string; apiModel: string }> = {
  // OpenAI GPT-5 family (currently routed to GPT-4o until GPT-5 API available)
  'gpt-5-nano': { provider: 'openai', apiModel: 'gpt-4o-mini' },  // Placeholder: GPT-4o-mini → GPT-5 Nano
  'gpt-5.2': { provider: 'openai', apiModel: 'gpt-4o' },          // Placeholder: GPT-4o → GPT-5.2
  // Google Gemini (requires GOOGLE_API_KEY)
  'gemini-2.5-flash': { provider: 'google', apiModel: 'gemini-1.5-flash' },  // Placeholder: 1.5 → 2.5
  // Mistral (requires MISTRAL_API_KEY)
  'mistral-small-2025': { provider: 'mistral', apiModel: 'mistral-small-latest' },
  // Meta Llama via OpenRouter (requires OPENROUTER_API_KEY)
  'llama-3.1-small': { provider: 'meta', apiModel: 'llama-3.1-8b-instant' },
};

class AIRouterService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  private getModelChain(planName: PlanName, stage: 'a' | 'b' = 'b'): string[] {
    const config = getTierConfig(planName);
    const models = config.models;
    
    if (stage === 'a') {
      if (planName === 'basic') {
        return ['gpt-5.2', models.secondary_gpt, models.tertiary_gpt, models.quaternary_gpt];
      }
      return [models.primary_gpt, models.secondary_gpt, models.tertiary_gpt, models.quaternary_gpt];
    }
    
    return [models.secondary_gpt, models.primary_gpt, models.tertiary_gpt, models.quaternary_gpt];
  }

  private getSpeedTier(planName: PlanName): 'standard' | 'fast' | 'instant' {
    switch (planName) {
      case 'unlimited':
        return 'instant';
      case 'pro':
        return 'fast';
      default:
        return 'standard';
    }
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

  private async callOpenAI(request: AIRequest, modelId: string): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const mapping = MODEL_MAPPINGS[modelId] || { provider: 'openai', apiModel: 'gpt-4o-mini' };
    const startTime = Date.now();
    
    try {
      if (request.type === 'vision' && request.imageBase64) {
        const response = await this.openai.chat.completions.create({
          model: mapping.apiModel,
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
          model: modelId,
          latencyMs,
          success: true,
        };
      } else {
        const response = await this.openai.chat.completions.create({
          model: mapping.apiModel,
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
          model: modelId,
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

  private async callGemini(request: AIRequest, modelId: string): Promise<AIResponse> {
    const startTime = Date.now();
    const latencyMs = Date.now() - startTime;
    
    return {
      content: JSON.stringify({ 
        error: 'Gemini integration pending - using fallback',
        fallback: true 
      }),
      provider: 'google',
      model: modelId,
      latencyMs,
      success: false,
      error: 'Gemini API not configured - falling back to next provider',
    };
  }

  private async callMistral(request: AIRequest, modelId: string): Promise<AIResponse> {
    const startTime = Date.now();
    const latencyMs = Date.now() - startTime;
    
    return {
      content: JSON.stringify({ 
        error: 'Mistral integration pending - using fallback',
        fallback: true 
      }),
      provider: 'mistral',
      model: modelId,
      latencyMs,
      success: false,
      error: 'Mistral API not configured - falling back to next provider',
    };
  }

  private async callLlama(request: AIRequest, modelId: string): Promise<AIResponse> {
    const startTime = Date.now();
    const latencyMs = Date.now() - startTime;
    
    return {
      content: JSON.stringify({ 
        error: 'Llama integration pending - using fallback',
        fallback: true 
      }),
      provider: 'meta',
      model: modelId,
      latencyMs,
      success: false,
      error: 'Llama API not configured - falling back to next provider',
    };
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

  async route(request: AIRequest, planType: string = 'free'): Promise<AIResponse> {
    const planName = mapPlanTypeToName(planType);
    const stage = request.stage || 'b';
    const modelChain = this.getModelChain(planName, stage);
    const speedTier = this.getSpeedTier(planName);
    const maxTokens = request.maxTokens || this.getMaxTokensBySpeed(speedTier);

    const enhancedRequest = { ...request, maxTokens };
    const errors: string[] = [];

    for (const modelId of modelChain) {
      const mapping = MODEL_MAPPINGS[modelId];
      if (!mapping) continue;

      try {
        switch (mapping.provider) {
          case 'openai':
            if (this.openai) {
              return await this.callOpenAI(enhancedRequest, modelId);
            }
            break;
          case 'google':
            const geminiResult = await this.callGemini(enhancedRequest, modelId);
            if (geminiResult.success) return geminiResult;
            break;
          case 'mistral':
            const mistralResult = await this.callMistral(enhancedRequest, modelId);
            if (mistralResult.success) return mistralResult;
            break;
          case 'meta':
            const llamaResult = await this.callLlama(enhancedRequest, modelId);
            if (llamaResult.success) return llamaResult;
            break;
        }
      } catch (error: any) {
        console.error(`Model ${modelId} failed:`, error.message);
        errors.push(`${modelId}: ${error.message}`);
        continue;
      }
    }

    return {
      content: '',
      provider: 'none',
      model: 'none',
      latencyMs: 0,
      success: false,
      error: `All models failed: ${errors.join('; ')}`,
    };
  }

  async generateSuggestedName(
    fileContent: string,
    fileName: string,
    fileType: string,
    planType: string = 'free',
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

    const prompt = `Analyze the following file content and generate a descriptive, professional filename.

Original filename: ${fileName}
File type: ${fileType}
${instructionsText}

File content summary:
${fileContent.substring(0, 2000)}

Respond with a JSON object containing:
- suggestedName: the new filename (without extension)
- confidence: a number from 0-1 indicating confidence
- reasoning: brief explanation of the naming choice`;

    const response = await this.route(
      {
        type: 'text',
        prompt,
        systemPrompt: 'You are a file naming expert. Generate descriptive, professional file names based on content analysis. Always respond with valid JSON.',
        stage: 'b',
      },
      planType
    );

    if (!response.success) {
      return {
        suggestedName: fileName.replace(/\.[^/.]+$/, ''),
        provider: 'fallback',
        confidence: 0.3,
        reasoning: 'AI processing unavailable, using original filename',
      };
    }

    try {
      const result = JSON.parse(response.content);
      return {
        suggestedName: result.suggestedName || fileName.replace(/\.[^/.]+$/, ''),
        provider: response.provider,
        confidence: result.confidence || 0.8,
        reasoning: result.reasoning || 'Generated using AI analysis',
      };
    } catch (e) {
      return {
        suggestedName: fileName.replace(/\.[^/.]+$/, ''),
        provider: 'fallback',
        confidence: 0.3,
        reasoning: 'Failed to parse AI response',
      };
    }
  }

  async analyzeFolderStructure(
    files: Array<{ name: string; type: string; content?: string }>,
    planType: string = 'free',
    userRules?: string
  ): Promise<{
    folderPlan: {
      rootFolderLabel: string;
      folders: Array<{
        folderId: string;
        path: string;
        description: string;
        rules: {
          applicableExtensions: string[];
          primaryGroupingKey: string;
          filenameTemplate: string;
          sequenceScope: string;
        };
      }>;
      fileRouting: Array<{
        fileId: string;
        folderId: string;
        filenameTemplate: string;
        reason: string;
      }>;
    };
    upgradeRecommendation: {
      suggestedPlan: string;
      reason: string | null;
    };
  }> {
    const planName = mapPlanTypeToName(planType);
    const config = getTierConfig(planName);
    
    const prompt = `Analyze these files and create a folder organization plan:

Files:
${files.map((f, i) => `${i + 1}. ${f.name} (${f.type})`).join('\n')}

User preferences: ${userRules || 'None specified'}

Plan tier: ${config.plan_tier}

Create a JSON response with:
- folder_plan: object containing root_folder_label, folders array, and file_routing array
- upgrade_recommendation: object with suggested_plan and reason

For ${config.plan_tier} tier:
${config.plan_tier === 'free' ? '- Use simple, shallow folder structures' : ''}
${config.plan_tier === 'medium' ? '- Allow moderate depth with client/year grouping' : ''}
${config.plan_tier === 'premium' ? '- Use detailed, domain-aware folder structures' : ''}`;

    const response = await this.route(
      {
        type: 'text',
        prompt,
        systemPrompt: 'You are a file organization expert. Create logical folder structures and naming conventions. Always respond with valid JSON.',
        stage: 'a',
      },
      planType
    );

    if (!response.success) {
      return {
        folderPlan: {
          rootFolderLabel: 'Documents',
          folders: [
            {
              folderId: 'default',
              path: 'Documents',
              description: 'Default folder',
              rules: {
                applicableExtensions: ['*'],
                primaryGroupingKey: 'doc_type',
                filenameTemplate: '{date}-{doc_type}-{sequence}',
                sequenceScope: 'per_folder',
              },
            },
          ],
          fileRouting: files.map((f, i) => ({
            fileId: `file_${i}`,
            folderId: 'default',
            filenameTemplate: '{date}-{doc_type}-{sequence}',
            reason: 'Default routing',
          })),
        },
        upgradeRecommendation: {
          suggestedPlan: 'none',
          reason: null,
        },
      };
    }

    try {
      const result = JSON.parse(response.content);
      return {
        folderPlan: {
          rootFolderLabel: result.folder_plan?.root_folder_label || 'Documents',
          folders: result.folder_plan?.folders || [],
          fileRouting: result.folder_plan?.file_routing || [],
        },
        upgradeRecommendation: {
          suggestedPlan: result.upgrade_recommendation?.suggested_plan || 'none',
          reason: result.upgrade_recommendation?.reason || null,
        },
      };
    } catch (e) {
      return {
        folderPlan: {
          rootFolderLabel: 'Documents',
          folders: [],
          fileRouting: [],
        },
        upgradeRecommendation: {
          suggestedPlan: 'none',
          reason: null,
        },
      };
    }
  }

  getAvailableModels(): Array<{ id: string; name: string; provider: string; capabilities: string[] }> {
    return [
      { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', capabilities: ['text'] },
      { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', capabilities: ['text', 'vision'] },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', capabilities: ['text', 'vision'] },
      { id: 'mistral-small-2025', name: 'Mistral Small 2025', provider: 'mistral', capabilities: ['text'] },
      { id: 'llama-3.1-small', name: 'Llama 3.1 Small', provider: 'meta', capabilities: ['text'] },
    ];
  }

  getProviderStatus(): Record<string, { available: boolean; reason?: string }> {
    return {
      openai: { 
        available: !!this.openai, 
        reason: this.openai ? undefined : 'OPENAI_API_KEY not configured' 
      },
      google: { 
        available: false, 
        reason: 'Gemini integration pending' 
      },
      mistral: { 
        available: false, 
        reason: 'Mistral integration pending' 
      },
      meta: { 
        available: false, 
        reason: 'Llama integration pending' 
      },
    };
  }
}

export const aiRouterService = new AIRouterService();
