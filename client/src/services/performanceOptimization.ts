import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";

export interface OptimizationOptions {
  // Image optimization options
  imageOptions?: {
    convertToWebP: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality: number; // 1-100
    preserveMetadata: boolean;
  };
  
  // Document optimization options
  documentOptions?: {
    compressPDF: boolean;
    quality: "low" | "medium" | "high";
    ocrEnabled: boolean;
  };
  
  // Video optimization options
  videoOptions?: {
    convertToMP4: boolean;
    maxResolution?: string; // e.g., "720p", "1080p", "4K"
    bitrateReduction: number; // percentage
  };
  
  // Audio optimization options
  audioOptions?: {
    convertToMP3: boolean;
    bitrate?: number; // kbps
    normalizeVolume: boolean;
  };
}

export interface OptimizationResult {
  fileId: number;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
  optimizedFileUrl?: string;
  success: boolean;
  message?: string;
  optimizationTime: number; // in milliseconds
}

/**
 * Analyze files and estimate potential optimization
 */
export async function analyzeFiles(
  fileIds: number[]
): Promise<{ totalSize: number; estimatedOptimizedSize: number; recommendations: Record<string, string> }> {
  try {
    const response = await apiRequest<{ totalSize: number; estimatedOptimizedSize: number; recommendations: Record<string, string> }>({
      url: "/api/analyze",
      method: "POST",
      data: { fileIds }
    });
    return response;
  } catch (error) {
    console.error("Error analyzing files:", error);
    throw new Error("Failed to analyze files");
  }
}

/**
 * Optimize files according to specified options
 */
export async function optimizeFiles(
  fileIds: number[],
  options: OptimizationOptions
): Promise<OptimizationResult[]> {
  try {
    const response = await apiRequest<OptimizationResult[]>({
      url: "/api/optimize",
      method: "POST",
      data: { fileIds, options }
    });
    return response;
  } catch (error) {
    console.error("Error optimizing files:", error);
    throw new Error("Failed to optimize files");
  }
}

/**
 * Get optimization history for user's files
 */
export async function getOptimizationHistory(): Promise<{
  totalFilesOptimized: number;
  totalSpaceSaved: number; // in bytes
  history: Array<{
    date: string;
    fileCount: number;
    spaceSaved: number;
  }>;
}> {
  try {
    const response = await apiRequest<{
      totalFilesOptimized: number;
      totalSpaceSaved: number;
      history: Array<{
        date: string;
        fileCount: number;
        spaceSaved: number;
      }>;
    }>({
      url: "/api/optimization-history",
    });
    return response;
  } catch (error) {
    console.error("Error fetching optimization history:", error);
    throw new Error("Failed to fetch optimization history");
  }
}

/**
 * Get optimization presets
 */
export async function getOptimizationPresets(): Promise<Array<{
  id: string;
  name: string;
  description: string;
  options: OptimizationOptions;
}>> {
  try {
    const response = await apiRequest<Array<{
      id: string;
      name: string;
      description: string;
      options: OptimizationOptions;
    }>>({
      url: "/api/optimization-presets",
    });
    return response;
  } catch (error) {
    console.error("Error fetching optimization presets:", error);
    throw new Error("Failed to fetch optimization presets");
  }
}

/**
 * Save an optimization preset
 */
export async function saveOptimizationPreset(
  name: string,
  description: string,
  options: OptimizationOptions
): Promise<{ id: string; name: string; description: string; options: OptimizationOptions }> {
  try {
    const response = await apiRequest<{ id: string; name: string; description: string; options: OptimizationOptions }>({
      url: "/api/optimization-presets",
      method: "POST",
      data: { name, description, options }
    });
    return response;
  } catch (error) {
    console.error("Error saving optimization preset:", error);
    throw new Error("Failed to save optimization preset");
  }
}