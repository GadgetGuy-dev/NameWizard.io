import { apiRequest } from "@/lib/queryClient";
import { File, Folder } from "@shared/schema";

export interface CategoryResult {
  folder: Folder;
  files: File[];
  confidence: number;
}

export interface CategorizationOptions {
  includeSubfolders: boolean;
  minConfidenceThreshold: number;
  useFolderHints: boolean;
  createNewFolders: boolean;
  autoApply: boolean;
}

/**
 * Analyze files and suggest folder organization based on content
 */
export async function categorizeFiles(
  fileIds: number[],
  options: CategorizationOptions
): Promise<CategoryResult[]> {
  try {
    const response = await apiRequest<CategoryResult[]>({
      url: "/api/organize-folders",
      method: "POST",
      data: { fileIds, options }
    });
    return response;
  } catch (error) {
    console.error("Error categorizing files:", error);
    throw new Error("Failed to categorize files");
  }
}

/**
 * Apply suggested categorization by moving files to their respective folders
 */
export async function applyCategorization(
  categorization: { fileId: number; folderId: number }[]
): Promise<{ movedCount: number; message: string }> {
  try {
    const response = await apiRequest<{ movedCount: number; message: string }>({
      url: "/api/files/move-to-folder",
      method: "POST",
      data: { files: categorization }
    });
    return response;
  } catch (error) {
    console.error("Error applying categorization:", error);
    throw new Error("Failed to apply categorization");
  }
}

/**
 * Create a new folder for categorization
 */
export async function createFolder(
  folderData: { name: string; parentId?: number; isAutomated?: boolean; }
): Promise<Folder> {
  try {
    const response = await apiRequest<Folder>({
      url: "/api/folders",
      method: "POST",
      data: folderData
    });
    return response;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Failed to create folder");
  }
}

/**
 * Get all files for categorization
 */
export async function getFiles(
  folderId?: number
): Promise<File[]> {
  try {
    const url = folderId
      ? `/api/folders/${folderId}/files`
      : "/api/files";
      
    const response = await apiRequest<File[]>({
      url
    });
    return response;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw new Error("Failed to fetch files");
  }
}

/**
 * Get all folders for categorization
 */
export async function getFolders(): Promise<Folder[]> {
  try {
    const response = await apiRequest<Folder[]>({
      url: "/api/folders"
    });
    return response;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw new Error("Failed to fetch folders");
  }
}

/**
 * Generate automated categorization rules for a folder
 */
export async function generateCategoryRules(
  folderId: number,
  sampleFileIds: number[]
): Promise<{ rules: any; message: string }> {
  try {
    const response = await apiRequest<{ rules: any; message: string }>({
      url: `/api/folders/${folderId}/generate-rules`,
      method: "POST",
      data: { sampleFileIds }
    });
    return response;
  } catch (error) {
    console.error("Error generating category rules:", error);
    throw new Error("Failed to generate category rules");
  }
}