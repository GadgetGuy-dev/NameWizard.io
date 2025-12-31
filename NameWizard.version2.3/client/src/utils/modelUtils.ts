/**
 * Formats model IDs into user-friendly display names
 * 
 * @param modelId A string model identifier (e.g., 'gpt_4o', 'claude_3_7_sonnet')
 * @returns User-friendly formatted model name
 */
export const formatModelName = (modelId: string): string => {
  const modelMap: Record<string, string> = {
    'gpt_4o': 'GPT-4o',
    'gpt_4o_mini': 'GPT-4o Mini',
    'gpt_4_turbo': 'GPT-4 Turbo',
    'gpt_3_5_turbo': 'GPT-3.5 Turbo',
    'claude_3_7_sonnet': 'Claude 3.5 Sonnet', 
    'claude_3_opus': 'Claude 3 Opus',
    'claude_3_sonnet': 'Claude 3 Sonnet',
    'llama_3_2_90b': 'Llama 3.2 90B',
    'llama_3_70b': 'Llama 3 70B',
    'gemini_1_5_pro': 'Gemini 1.5 Pro',
    'inflection_2_5': 'Inflection-2.5',
    'ollama': 'Ollama (Local)',
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
} => {
  // Default capabilities
  const defaultCapabilities = {
    vision: false,
    textAnalysis: true,
    codeGeneration: false,
    speed: 'medium' as const,
    cost: 'medium' as const
  };
  
  // Model-specific capabilities
  const modelCapabilities: Record<string, typeof defaultCapabilities> = {
    'gpt_4o': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'medium',
      cost: 'high'
    },
    'claude_3_7_sonnet': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'medium',
      cost: 'high'
    },
    'gpt_4o_mini': {
      vision: true,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'medium'
    },
    'gpt_3_5_turbo': {
      vision: false,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'fast',
      cost: 'low'
    },
    'llama_3_2_90b': {
      vision: false,
      textAnalysis: true,
      codeGeneration: true,
      speed: 'medium',
      cost: 'medium'
    },
    'ollama': {
      vision: false,
      textAnalysis: true,
      codeGeneration: false,
      speed: 'slow',
      cost: 'free'
    }
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
    'gpt_4o': 'gpt_4o_mini',
    'gpt_4o_mini': 'gpt_3_5_turbo',
    'claude_3_7_sonnet': 'claude_3_sonnet',
    'claude_3_opus': 'claude_3_sonnet', 
    'llama_3_2_90b': 'llama_3_70b',
    'gemini_1_5_pro': 'gpt_3_5_turbo'
  };
  
  return fallbackMap[modelId] || 'gpt_3_5_turbo'; // Default fallback
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