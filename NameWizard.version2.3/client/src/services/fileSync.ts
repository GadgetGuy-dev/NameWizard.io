import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";

/**
 * Service for handling cross-platform file synchronization
 */
export interface FileSyncOptions {
  deviceId: string;
  syncStrategy: "automatic" | "manual" | "scheduled";
  includeSubfolders: boolean;
  syncInterval?: number; // in minutes, for scheduled sync
}

export interface SyncStatus {
  lastSyncTime: Date | null;
  syncedFilesCount: number;
  pendingChanges: number;
  devices: {
    id: string;
    name: string;
    lastSeen: Date;
    status: "online" | "offline" | "syncing";
  }[];
}

/**
 * Get the current synchronization status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const response = await apiRequest<SyncStatus>({ 
      url: "/api/sync/status" 
    });
    return response;
  } catch (error) {
    console.error("Error fetching sync status:", error);
    throw new Error("Failed to get sync status");
  }
}

/**
 * Configure file synchronization options
 */
export async function configureSyncOptions(options: FileSyncOptions): Promise<void> {
  try {
    await apiRequest({ 
      url: "/api/sync/configure", 
      method: "POST", 
      data: options 
    });
  } catch (error) {
    console.error("Error configuring sync options:", error);
    throw new Error("Failed to configure sync options");
  }
}

/**
 * Trigger immediate synchronization
 */
export async function triggerSync(): Promise<{ message: string; syncedFiles: number }> {
  try {
    const response = await apiRequest<{ message: string; syncedFiles: number }>({ 
      url: "/api/sync/start", 
      method: "POST" 
    });
    return response;
  } catch (error) {
    console.error("Error triggering sync:", error);
    throw new Error("Failed to start synchronization");
  }
}

/**
 * Resolve conflicts between different versions of the same file
 */
export async function resolveConflict(fileId: number, resolution: "keep-local" | "keep-remote" | "keep-both"): Promise<File> {
  try {
    const response = await apiRequest<File>({ 
      url: `/api/sync/conflicts/${fileId}/resolve`, 
      method: "POST",
      data: { resolution }
    });
    return response;
  } catch (error) {
    console.error("Error resolving conflict:", error);
    throw new Error("Failed to resolve file conflict");
  }
}

/**
 * Get a list of devices registered for synchronization
 */
export async function getRegisteredDevices(): Promise<{ id: string; name: string; lastSeen: Date; status: string }[]> {
  try {
    const response = await apiRequest<{ id: string; name: string; lastSeen: Date; status: string }[]>({ 
      url: "/api/sync/devices" 
    });
    return response;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw new Error("Failed to get registered devices");
  }
}

/**
 * Register a new device for synchronization
 */
export async function registerDevice(deviceName: string): Promise<{ deviceId: string }> {
  try {
    const response = await apiRequest<{ deviceId: string }>({ 
      url: "/api/sync/devices/register", 
      method: "POST",
      data: { deviceName }
    });
    return response;
  } catch (error) {
    console.error("Error registering device:", error);
    throw new Error("Failed to register device");
  }
}

/**
 * Remove a device from synchronization
 */
export async function removeDevice(deviceId: string): Promise<void> {
  try {
    await apiRequest({ 
      url: `/api/sync/devices/${deviceId}`, 
      method: "DELETE" 
    });
  } catch (error) {
    console.error("Error removing device:", error);
    throw new Error("Failed to remove device");
  }
}