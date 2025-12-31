export type PlanTier = 'free' | 'medium' | 'premium';
export type PlanName = 'free' | 'basic' | 'pro' | 'unlimited';
export type OcrQualityLevel = 'low' | 'medium' | 'high';

export interface ModelConfig {
  primary_gpt: string;
  secondary_gpt: string;
  tertiary_gpt: string;
  quaternary_gpt: string;
}

export interface OcrConfig {
  primary_ocr: string;
  secondary_ocr: string | null;
  tertiary_ocr: string | null;
  quality_level: OcrQualityLevel;
}

export interface TierConfig {
  plan_tier: PlanTier;
  plan_name: PlanName;
  models: ModelConfig;
  ocr: OcrConfig;
  limits: {
    folder_limit: number;
    file_limit: number;
    max_file_size_mb: number;
  };
}

export const TIER_CONFIGS: Record<PlanName, TierConfig> = {
  free: {
    plan_tier: 'free',
    plan_name: 'free',
    models: {
      primary_gpt: 'gpt-5-nano',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    ocr: {
      primary_ocr: 'techvision',
      secondary_ocr: 'google-vision-lite',
      tertiary_ocr: 'azure-vision-lite',
      quality_level: 'low',
    },
    limits: {
      folder_limit: 5,
      file_limit: 25,
      max_file_size_mb: 5,
    },
  },
  basic: {
    plan_tier: 'medium',
    plan_name: 'basic',
    models: {
      primary_gpt: 'gpt-5-nano',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    ocr: {
      primary_ocr: 'google-vision-standard',
      secondary_ocr: 'azure-vision-standard',
      tertiary_ocr: 'techvision',
      quality_level: 'medium',
    },
    limits: {
      folder_limit: 50,
      file_limit: 500,
      max_file_size_mb: 25,
    },
  },
  pro: {
    plan_tier: 'medium',
    plan_name: 'pro',
    models: {
      primary_gpt: 'gpt-5.2',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    ocr: {
      primary_ocr: 'google-vision-advanced',
      secondary_ocr: 'azure-vision-advanced',
      tertiary_ocr: 'aws-textract',
      quality_level: 'high',
    },
    limits: {
      folder_limit: 200,
      file_limit: 2000,
      max_file_size_mb: 50,
    },
  },
  unlimited: {
    plan_tier: 'premium',
    plan_name: 'unlimited',
    models: {
      primary_gpt: 'gpt-5.2',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    ocr: {
      primary_ocr: 'google-vision-advanced',
      secondary_ocr: 'azure-vision-advanced',
      tertiary_ocr: 'aws-textract',
      quality_level: 'high',
    },
    limits: {
      folder_limit: -1,
      file_limit: -1,
      max_file_size_mb: 100,
    },
  },
};

export const AI_MODELS = {
  'gpt-5-nano': {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    description: 'Efficient model for simple tasks',
    costPer1kTokens: 0.0001,
    capabilities: ['text'],
  },
  'gpt-5.2': {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    description: 'Advanced reasoning for complex folder planning',
    costPer1kTokens: 0.002,
    capabilities: ['text', 'vision'],
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast multimodal backup model',
    costPer1kTokens: 0.0005,
    capabilities: ['text', 'vision'],
  },
  'mistral-small-2025': {
    id: 'mistral-small-2025',
    name: 'Mistral Small 2025',
    provider: 'mistral',
    description: 'Cheap structured reasoning and validation',
    costPer1kTokens: 0.0002,
    capabilities: ['text'],
  },
  'llama-3.1-small': {
    id: 'llama-3.1-small',
    name: 'Llama 3.1 Small',
    provider: 'meta',
    description: 'Extra fallback and routing model',
    costPer1kTokens: 0.0001,
    capabilities: ['text'],
  },
} as const;

export const OCR_PROVIDERS = {
  'techvision': {
    id: 'techvision',
    name: 'TechVision',
    description: 'Budget OCR for clean text (Tesseract-like)',
    costPerPage: 0.0005,
    qualityLevel: 'low',
    tiers: ['free', 'basic', 'pro', 'unlimited'],
  },
  'google-vision-lite': {
    id: 'google-vision-lite',
    name: 'Google Vision (Lite)',
    description: 'Rate-limited Google OCR for free tier',
    costPerPage: 0.001,
    qualityLevel: 'low',
    tiers: ['free'],
  },
  'google-vision-standard': {
    id: 'google-vision-standard',
    name: 'Google Vision (Standard)',
    description: 'Standard Google Cloud Vision OCR',
    costPerPage: 0.0015,
    qualityLevel: 'medium',
    tiers: ['basic'],
  },
  'google-vision-advanced': {
    id: 'google-vision-advanced',
    name: 'Google Vision (Advanced)',
    description: 'Full-featured Google Document AI',
    costPerPage: 0.002,
    qualityLevel: 'high',
    tiers: ['pro', 'unlimited'],
  },
  'azure-vision-lite': {
    id: 'azure-vision-lite',
    name: 'Azure Vision (Lite)',
    description: 'Rate-limited Azure OCR for free tier',
    costPerPage: 0.001,
    qualityLevel: 'low',
    tiers: ['free'],
  },
  'azure-vision-standard': {
    id: 'azure-vision-standard',
    name: 'Azure Vision (Standard)',
    description: 'Standard Azure Computer Vision',
    costPerPage: 0.0015,
    qualityLevel: 'medium',
    tiers: ['basic'],
  },
  'azure-vision-advanced': {
    id: 'azure-vision-advanced',
    name: 'Azure Vision (Advanced)',
    description: 'Azure Read with handwriting support',
    costPerPage: 0.002,
    qualityLevel: 'high',
    tiers: ['pro', 'unlimited'],
  },
  'aws-textract': {
    id: 'aws-textract',
    name: 'AWS Textract',
    description: 'Best for forms and tables',
    costPerPage: 0.0025,
    qualityLevel: 'high',
    tiers: ['pro', 'unlimited'],
  },
} as const;

export function getTierConfig(planName: PlanName): TierConfig {
  return TIER_CONFIGS[planName] || TIER_CONFIGS.free;
}

export function mapPlanTypeToName(planType: string): PlanName {
  switch (planType) {
    case 'credits_low':
      return 'basic';
    case 'credits_high':
      return 'pro';
    case 'unlimited':
      return 'unlimited';
    case 'free':
    default:
      return 'free';
  }
}

export function getModelForStage(
  planName: PlanName,
  stage: 'a' | 'b'
): string {
  const config = getTierConfig(planName);
  if (stage === 'a') {
    if (planName === 'basic') {
      return 'gpt-5.2';
    }
    return config.models.primary_gpt;
  }
  return config.models.secondary_gpt;
}
