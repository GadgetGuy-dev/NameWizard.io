/**
 * Formats model IDs into user-friendly display names
 * Updated for GPT-5 stack with Gemini, Mistral, Llama fallbacks
 * 
 * @param modelId A string model identifier (e.g., 'gpt_5_nano', 'gemini_2_5_flash')
 * @returns User-friendly formatted model name
 */
export const formatModelName = (modelId: string): string => {
  const modelMap: Record<string, string> = {
    'gpt_5_nano': 'GPT-5 Nano',
    'gpt_5_2': 'GPT-5.2',
    'gpt-5-nano': 'GPT-5 Nano',
    'gpt-5.2': 'GPT-5.2',
    'gemini_2_5_flash': 'Gemini 2.5 Flash',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'mistral_small_2025': 'Mistral Small 2025',
    'mistral-small-2025': 'Mistral Small 2025',
    'llama_3_1_small': 'Llama 3.1 Small',
    'llama-3.1-small': 'Llama 3.1 Small',
  };
  
  return modelMap[modelId] || modelId;
};

/**
 * Gets information about model capabilities
 * 
 * @param modelId A string model identifier
 * @returns Object with model capability information
 */
export const getModelCapabilities = (modelId: string): { 
  vision: boolean;
  textAnalysis: boolean;
  codeGeneration: boolean;  
  speed: 'fast' | 'medium' | 'slow';
  cost: 'free' | 'low' | 'medium' | 'high';
  tier: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
} => {
  type ModelCapabilities = {
    vision: boolean;
    textAnalysis: boolean;
    codeGeneration: boolean;
    speed: 'fast' | 'medium' | 'slow';
    cost: 'free' | 'low' | 'medium' | 'high';
    tier: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  };
  
  const defaultCapabilities: ModelCapabilities = {
    vision: false,
    textAnalysis: true,
    codeGeneration: false,
    speed: 'medium',
    cost: 'medium',
    tier: 'quaternary'
  };
  
  const modelCapabilities: Record<string, ModelCapabilities> = {
    'gpt_5_nano': {
      vision: false,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'low',
      tier: 'primary'
    },
    'gpt-5-nano': {
      vision: false,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'low',
      tier: 'primary'
    },
    'gpt_5_2': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'medium',
      cost: 'high',
      tier: 'primary'
    },
    'gpt-5.2': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'medium',
      cost: 'high',
      tier: 'primary'
    },
    'gemini_2_5_flash': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'medium',
      tier: 'secondary'
    },
    'gemini-2.5-flash': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'medium',
      tier: 'secondary'
    },
    'mistral_small_2025': {
      vision: false,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'low',
      tier: 'tertiary'
    },
    'mistral-small-2025': {
      vision: false,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'low',
      tier: 'tertiary'
    },
    'llama_3_1_small': {
      vision: false,
      textAnalysis: true,
      codeGeneration: false,
      speed: 'fast',
      cost: 'low',
      tier: 'quaternary'
    },
    'llama-3.1-small': {
      vision: false,
      textAnalysis: true,
      codeGeneration: false,
      speed: 'fast',
      cost: 'low',
      tier: 'quaternary'
    },
  };
  
  return modelCapabilities[modelId] || defaultCapabilities;
};

/**
 * Gets a recommended fallback model for when a primary model fails
 * 
 * @param modelId The primary model ID that failed
 * @returns A string ID of the recommended fallback model
 */
export const getFallbackModel = (modelId: string): string => {
  const fallbackMap: Record<string, string> = {
    'gpt-5.2': 'gemini-2.5-flash',
    'gpt_5_2': 'gemini_2_5_flash',
    'gpt-5-nano': 'gemini-2.5-flash',
    'gpt_5_nano': 'gemini_2_5_flash',
    'gemini-2.5-flash': 'mistral-small-2025',
    'gemini_2_5_flash': 'mistral_small_2025',
    'mistral-small-2025': 'llama-3.1-small',
    'mistral_small_2025': 'llama_3_1_small',
  };
  
  return fallbackMap[modelId] || 'llama-3.1-small';
};

/**
 * Checks if a model supports image/vision analysis
 * 
 * @param modelId The model ID to check
 * @returns Boolean indicating if the model supports vision
 */
export const supportsVision = (modelId: string): boolean => {
  return getModelCapabilities(modelId).vision;
};

/**
 * Get all available AI models
 */
export const getAvailableModels = () => [
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', description: 'Efficient model for simple tasks' },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', description: 'Advanced reasoning for complex folder planning' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', description: 'Fast multimodal backup model' },
  { id: 'mistral-small-2025', name: 'Mistral Small 2025', provider: 'mistral', description: 'Cheap structured reasoning' },
  { id: 'llama-3.1-small', name: 'Llama 3.1 Small', provider: 'meta', description: 'Extra fallback model' },
];

/**
 * Get all available OCR providers
 */
export const getAvailableOcrProviders = () => [
  { id: 'techvision', name: 'TechVision', description: 'Budget OCR for clean text', tiers: ['free', 'basic', 'pro', 'unlimited'] },
  { id: 'google-vision', name: 'Google Cloud Vision', description: 'Best all-around OCR', tiers: ['free', 'basic', 'pro', 'unlimited'] },
  { id: 'azure-vision', name: 'Azure Computer Vision', description: 'Strong OCR + handwriting', tiers: ['free', 'basic', 'pro', 'unlimited'] },
  { id: 'aws-textract', name: 'AWS Textract', description: 'Best for forms and tables', tiers: ['pro', 'unlimited'] },
];

/**
 * Get model configuration for a specific plan
 */
export const getModelConfigForPlan = (planName: 'free' | 'basic' | 'pro' | 'unlimited') => {
  const configs = {
    free: {
      primary_gpt: 'gpt-5-nano',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    basic: {
      primary_gpt: 'gpt-5-nano',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    pro: {
      primary_gpt: 'gpt-5.2',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
    unlimited: {
      primary_gpt: 'gpt-5.2',
      secondary_gpt: 'gemini-2.5-flash',
      tertiary_gpt: 'mistral-small-2025',
      quaternary_gpt: 'llama-3.1-small',
    },
  };
  
  return configs[planName] || configs.free;
};

/**
 * Get OCR configuration for a specific plan
 */
export const getOcrConfigForPlan = (planName: 'free' | 'basic' | 'pro' | 'unlimited') => {
  const configs = {
    free: {
      primary_ocr: 'techvision',
      secondary_ocr: 'google-vision-lite',
      tertiary_ocr: 'azure-vision-lite',
      quality_level: 'low',
    },
    basic: {
      primary_ocr: 'google-vision-standard',
      secondary_ocr: 'azure-vision-standard',
      tertiary_ocr: 'techvision',
      quality_level: 'medium',
    },
    pro: {
      primary_ocr: 'google-vision-advanced',
      secondary_ocr: 'azure-vision-advanced',
      tertiary_ocr: 'aws-textract',
      quality_level: 'high',
    },
    unlimited: {
      primary_ocr: 'google-vision-advanced',
      secondary_ocr: 'azure-vision-advanced',
      tertiary_ocr: 'aws-textract',
      quality_level: 'high',
    },
  };
  
  return configs[planName] || configs.free;
};
