import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";

export interface RenamePattern {
  id: string;
  name: string;
  pattern: string;
  description: string;
  isCustom: boolean;
}

export interface RenamePreview {
  fileId: number;
  originalName: string;
  newName: string;
  previewUrl?: string;
  metadata?: Record<string, any>;
  aiSuggestions?: string[];
}

/**
 * Get available rename patterns
 */
export async function getRenamePatterns(): Promise<RenamePattern[]> {
  try {
    const response = await apiRequest<RenamePattern[]>({
      url: "/api/rename-patterns"
    });
    return response;
  } catch (error) {
    console.error("Error fetching rename patterns:", error);
    throw new Error("Failed to fetch rename patterns");
  }
}

/**
 * Create a custom rename pattern
 */
export async function createRenamePattern(pattern: {
  name: string;
  pattern: string;
  description: string;
}): Promise<RenamePattern> {
  try {
    const response = await apiRequest<RenamePattern>({
      url: "/api/rename-patterns",
      method: "POST",
      data: { ...pattern, isCustom: true }
    });
    return response;
  } catch (error) {
    console.error("Error creating rename pattern:", error);
    throw new Error("Failed to create rename pattern");
  }
}

/**
 * Preview the results of a rename operation
 */
export async function previewRename(
  fileIds: number[],
  pattern: string,
  useAI: boolean = false
): Promise<RenamePreview[]> {
  try {
    const response = await apiRequest<RenamePreview[]>({
      url: "/api/preview-rename",
      method: "POST",
      data: { fileIds, pattern, useAI }
    });
    return response;
  } catch (error) {
    console.error("Error previewing rename:", error);
    throw new Error("Failed to preview rename");
  }
}

/**
 * Get AI-suggested rename options for files
 */
export async function getAISuggestions(
  fileIds: number[]
): Promise<Record<number, string[]>> {
  try {
    const response = await apiRequest<Record<number, string[]>>({
      url: "/api/ai-rename-suggestions",
      method: "POST",
      data: { fileIds }
    });
    return response;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    throw new Error("Failed to get AI suggestions");
  }
}

/**
 * Apply a custom rename to a single file
 */
export async function applyCustomRename(
  fileId: number,
  newName: string
): Promise<File> {
  try {
    const response = await apiRequest<File>({
      url: `/api/files/${fileId}`,
      method: "PATCH",
      data: { newName }
    });
    return response;
  } catch (error) {
    console.error("Error applying custom rename:", error);
    throw new Error("Failed to apply custom rename");
  }
}

/**
 * Apply a batch rename operation
 */
export async function applyBatchRename(
  renames: Array<{ fileId: number; newName: string }>
): Promise<{ successCount: number; failedCount: number; message: string }> {
  try {
    const response = await apiRequest<{ successCount: number; failedCount: number; message: string }>({
      url: "/api/batch-rename",
      method: "POST",
      data: { renames }
    });
    return response;
  } catch (error) {
    console.error("Error applying batch rename:", error);
    throw new Error("Failed to apply batch rename");
  }
}