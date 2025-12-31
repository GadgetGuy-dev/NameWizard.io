import { apiRequest } from '@/lib/queryClient';

interface FileData {
  name: string;
  type: string;
  size: number;
  content?: string;
  base64?: string;
}

interface NamingSuggestion {
  name: string;
  description: string;
  confidence: number;
}

interface ContentCategory {
  name: string;
  description: string;
  confidence: number;
  files: string[];
}

interface MetadataField {
  field: string;
  value: string;
  confidence: number;
}

interface Duplicate {
  original: string;
  duplicate: string;
  similarity: number;
}

/**
 * Generate name suggestions for a file based on its content
 */
export async function generateNameSuggestions(fileData: FileData): Promise<NamingSuggestion[]> {
  try {
    const response = await apiRequest({
      url: '/api/ai/name-suggestions',
      method: 'POST',
      data: fileData
    });
    return response.suggestions;
  } catch (error) {
    console.error('Error generating name suggestions:', error);
    throw error;
  }
}

/**
 * Analyze file content and suggest categories 
 */
export async function analyzeContent(fileData: FileData): Promise<{ categories: string[], tags: string[] }> {
  try {
    const response = await apiRequest({
      url: '/api/ai/analyze-content',
      method: 'POST',
      data: fileData
    });
    return response;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

/**
 * Format filenames according to specified case type
 */
export async function formatCase(names: string[], caseType: string): Promise<string[]> {
  try {
    const response = await apiRequest({
      url: '/api/ai/format-case',
      method: 'POST',
      data: { names, caseType }
    });
    return response.formattedNames;
  } catch (error) {
    console.error('Error formatting case:', error);
    throw error;
  }
}

/**
 * Detect duplicate files in a batch
 */
export async function detectDuplicates(files: FileData[]): Promise<Duplicate[]> {
  try {
    const response = await apiRequest({
      url: '/api/ai/detect-duplicates',
      method: 'POST',
      data: { files }
    });
    return response.duplicates;
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    throw error;
  }
}

/**
 * Extract metadata from file name and content
 */
export async function extractMetadata(fileName: string, content: string): Promise<MetadataField[]> {
  try {
    const response = await apiRequest({
      url: '/api/ai/extract-metadata',
      method: 'POST',
      data: { fileName, content }
    });
    return response.metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw error;
  }
}

/**
 * Organize files into suggested folders
 */
export async function organizeFolders(files: FileData[]): Promise<ContentCategory[]> {
  try {
    const response = await apiRequest({
      url: '/api/organize-folders',
      method: 'POST',
      data: { files }
    });
    return response.folders;
  } catch (error) {
    console.error('Error organizing folders:', error);
    throw error;
  }
}

/**
 * Check if an AI model is available (has proper API key)
 */
export async function checkModelStatus(modelId: string): Promise<{ available: boolean, local: boolean, requiresApiKey: boolean }> {
  try {
    const response = await apiRequest({
      url: `/api/ai/models/${modelId}/status`,
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Error checking model status:', error);
    return { available: false, local: false, requiresApiKey: true };
  }
}

export default {
  generateNameSuggestions,
  analyzeContent,
  formatCase,
  detectDuplicates,
  extractMetadata,
  organizeFolders,
  checkModelStatus
};