import { apiRequest } from "@/lib/queryClient";

export interface AnnotationPoint {
  x: number;
  y: number;
  page?: number; // for multi-page documents
}

export interface Annotation {
  id: number;
  fileId: number;
  userId: number;
  username: string; // The name of the user who created the annotation
  content: string;
  annotationType: "comment" | "highlight" | "drawing" | "correction";
  position: AnnotationPoint;
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  color?: string;
  drawingData?: string; // SVG path data
  replyCount?: number; // Count of replies if annotation has a discussion
}

export interface AnnotationReply {
  id: number;
  annotationId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all annotations for a file
 */
export async function getAnnotations(fileId: number): Promise<Annotation[]> {
  try {
    const response = await apiRequest<Annotation[]>({
      url: `/api/files/${fileId}/annotations`
    });
    return response;
  } catch (error) {
    console.error("Error fetching annotations:", error);
    throw new Error("Failed to fetch annotations");
  }
}

/**
 * Create a new annotation
 */
export async function createAnnotation(annotation: {
  fileId: number;
  content: string;
  annotationType: "comment" | "highlight" | "drawing" | "correction";
  position: AnnotationPoint;
  color?: string;
  drawingData?: string;
}): Promise<Annotation> {
  try {
    const response = await apiRequest<Annotation>({
      url: "/api/annotations",
      method: "POST",
      data: annotation
    });
    return response;
  } catch (error) {
    console.error("Error creating annotation:", error);
    throw new Error("Failed to create annotation");
  }
}

/**
 * Update an existing annotation
 */
export async function updateAnnotation(
  annotationId: number,
  data: {
    content?: string;
    resolved?: boolean;
    color?: string;
    drawingData?: string;
  }
): Promise<Annotation> {
  try {
    const response = await apiRequest<Annotation>({
      url: `/api/annotations/${annotationId}`,
      method: "PATCH",
      data
    });
    return response;
  } catch (error) {
    console.error("Error updating annotation:", error);
    throw new Error("Failed to update annotation");
  }
}

/**
 * Delete an annotation
 */
export async function deleteAnnotation(annotationId: number): Promise<void> {
  try {
    await apiRequest({
      url: `/api/annotations/${annotationId}`,
      method: "DELETE"
    });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    throw new Error("Failed to delete annotation");
  }
}

/**
 * Get replies to an annotation
 */
export async function getAnnotationReplies(annotationId: number): Promise<AnnotationReply[]> {
  try {
    const response = await apiRequest<AnnotationReply[]>({
      url: `/api/annotations/${annotationId}/replies`
    });
    return response;
  } catch (error) {
    console.error("Error fetching annotation replies:", error);
    throw new Error("Failed to fetch annotation replies");
  }
}

/**
 * Add a reply to an annotation
 */
export async function createAnnotationReply(
  annotationId: number,
  content: string
): Promise<AnnotationReply> {
  try {
    const response = await apiRequest<AnnotationReply>({
      url: `/api/annotations/${annotationId}/replies`,
      method: "POST",
      data: { content }
    });
    return response;
  } catch (error) {
    console.error("Error creating annotation reply:", error);
    throw new Error("Failed to create annotation reply");
  }
}

/**
 * Get unread annotation count
 */
export async function getUnreadAnnotationCount(): Promise<number> {
  try {
    const response = await apiRequest<{ count: number }>({
      url: "/api/annotations/unread-count"
    });
    return response.count;
  } catch (error) {
    console.error("Error fetching unread annotation count:", error);
    throw new Error("Failed to fetch unread annotation count");
  }
}

/**
 * Export annotations for a file
 */
export async function exportAnnotations(
  fileId: number,
  format: "pdf" | "csv" | "json"
): Promise<string> {
  try {
    const response = await apiRequest<{ downloadUrl: string }>({
      url: `/api/files/${fileId}/annotations/export`,
      method: "POST",
      data: { format }
    });
    return response.downloadUrl;
  } catch (error) {
    console.error("Error exporting annotations:", error);
    throw new Error("Failed to export annotations");
  }
}