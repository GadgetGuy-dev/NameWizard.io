import { queryClient } from "@/lib/queryClient";
import { Folder, InsertFolder, File } from "@shared/schema";

// Get all folders for the current user
export const fetchUserFolders = async (): Promise<Folder[]> => {
  const response = await fetch("/api/folders", {
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch folders");
  }
  
  return await response.json();
};

// Get root folders
export const fetchRootFolders = async (): Promise<Folder[]> => {
  const response = await fetch("/api/folders/root", {
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch root folders");
  }
  
  return await response.json();
};

// Get a folder's child folders
export const fetchChildFolders = async (folderId: number): Promise<Folder[]> => {
  const response = await fetch(`/api/folders/${folderId}/children`, {
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch child folders");
  }
  
  return await response.json();
};

// Get files in a folder
export const fetchFolderFiles = async (folderId: number): Promise<File[]> => {
  const response = await fetch(`/api/folders/${folderId}/files`, {
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch folder files");
  }
  
  return await response.json();
};

// Create a new folder
export const createFolder = async (folder: Omit<InsertFolder, "userId" | "path">): Promise<Folder> => {
  // Generate a path based on the name
  const pathName = folder.name.toLowerCase().replace(/\s+/g, '-');
  const path = `/folders/${pathName}`;
  
  const response = await fetch("/api/folders", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...folder,
      path
    })
  });
  
  if (!response.ok) {
    throw new Error("Failed to create folder");
  }
  
  // Invalidate relevant queries
  queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
  if (folder.parentId) {
    queryClient.invalidateQueries({ queryKey: [`/api/folders/${folder.parentId}/children`] });
  } else {
    queryClient.invalidateQueries({ queryKey: ["/api/folders/root"] });
  }
  
  return await response.json();
};

// Update a folder
export const updateFolder = async (id: number, data: Partial<Omit<InsertFolder, "userId">>): Promise<Folder> => {
  // If name is changing, update path too
  const dataToSend: Partial<InsertFolder> & { path?: string } = { ...data };
  if (data.name) {
    // Include a path based on the folder name
    const pathName = data.name.toLowerCase().replace(/\s+/g, '-');
    dataToSend.path = `/folders/${pathName}`;
  }
  
  const response = await fetch(`/api/folders/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataToSend)
  });
  
  if (!response.ok) {
    throw new Error("Failed to update folder");
  }
  
  // Invalidate relevant queries
  queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
  queryClient.invalidateQueries({ queryKey: [`/api/folders/${id}`] });
  
  // If parent is changing, invalidate both old and new parent's children
  if (data.parentId !== undefined) {
    queryClient.invalidateQueries({ queryKey: ["/api/folders/root"] });
    if (data.parentId) {
      queryClient.invalidateQueries({ queryKey: [`/api/folders/${data.parentId}/children`] });
    }
  }
  
  return await response.json();
};

// Delete a folder
export const deleteFolder = async (id: number): Promise<void> => {
  const response = await fetch(`/api/folders/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete folder");
  }
  
  // Invalidate relevant queries
  queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
  queryClient.invalidateQueries({ queryKey: ["/api/folders/root"] });
};

// Move files to a folder
export const moveFilesToFolder = async (fileIds: number[], folderId: number | null): Promise<any> => {
  const response = await fetch("/api/files/move-to-folder", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileIds,
      folderId
    })
  });
  
  if (!response.ok) {
    throw new Error("Failed to move files");
  }
  
  // Invalidate relevant file queries
  queryClient.invalidateQueries({ queryKey: ["/api/files"] });
  
  // Invalidate folder contents
  if (folderId !== null) {
    queryClient.invalidateQueries({ queryKey: [`/api/folders/${folderId}/files`] });
  }
  
  return await response.json();
};

// Update a file (can be used to move it to a folder)
export const updateFile = async (id: number, data: { name?: string, description?: string, folderId?: number | null, metadata?: any }): Promise<File> => {
  const response = await fetch(`/api/files/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error("Failed to update file");
  }
  
  // Invalidate relevant queries
  queryClient.invalidateQueries({ queryKey: ["/api/files"] });
  
  // If folder is changing, invalidate folder contents
  if (data.folderId !== undefined) {
    if (data.folderId !== null) {
      queryClient.invalidateQueries({ queryKey: [`/api/folders/${data.folderId}/files`] });
    }
  }
  
  return await response.json();
};