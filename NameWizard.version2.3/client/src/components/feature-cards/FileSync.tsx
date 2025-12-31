import React, { useState } from "react";
import { 
  Cloud, 
  RefreshCw, 
  Settings, 
  Check, 
  PlusCircle,
  Laptop,
  Smartphone,
  Tv,
  Trash,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getSyncStatus, 
  configureSyncOptions, 
  triggerSync,
  getRegisteredDevices,
  registerDevice,
  removeDevice,
  FileSyncOptions
} from "@/services/fileSync";

interface Device {
  id: string;
  name: string;
  lastSeen: Date;
  status: "online" | "offline" | "syncing";
}

const FileSync: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"status" | "devices" | "settings">("status");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    lastSyncTime: Date | null;
    syncedFilesCount: number;
    pendingChanges: number;
  } | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [syncSettings, setSyncSettings] = useState<{
    autoSync: boolean;
    syncOnWifi: boolean;
    syncSchedule: "hourly" | "daily" | "weekly" | "manual";
    preserveFolderStructure: boolean;
    conflictResolution: "newest" | "prompt" | "both";
  }>({
    autoSync: true,
    syncOnWifi: true,
    syncSchedule: "hourly",
    preserveFolderStructure: true,
    conflictResolution: "prompt",
  });

  // Fetch sync status
  const fetchSyncStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getSyncStatus();
      setSyncStatus({
        lastSyncTime: status.lastSyncTime,
        syncedFilesCount: status.syncedFilesCount,
        pendingChanges: status.pendingChanges
      });
      setDevices(status.devices);
    } catch (error) {
      // In a real app, we'd use the actual error
      toast({
        title: "Failed to fetch sync status",
        description: "Could not retrieve synchronization status. Please try again later.",
        variant: "destructive",
        id: "sync-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger manual sync
  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await triggerSync();
      toast({
        title: "Sync Completed",
        description: `${result.syncedFiles} files synchronized successfully.`,
        variant: "default",
        id: "sync-success",
      });
      await fetchSyncStatus();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not synchronize files. Please try again later.",
        variant: "destructive",
        id: "sync-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save sync settings
  const saveSyncSettings = async () => {
    setIsLoading(true);
    try {
      // Convert our UI settings to the format expected by the API
      const options: FileSyncOptions = {
        deviceId: "current-device", // This would be properly set in a real app
        syncStrategy: syncSettings.autoSync 
          ? (syncSettings.syncSchedule === "manual" ? "manual" : "scheduled") 
          : "manual",
        includeSubfolders: syncSettings.preserveFolderStructure,
        syncInterval: getSyncIntervalMinutes(syncSettings.syncSchedule)
      };
      
      await configureSyncOptions(options);
      toast({
        title: "Settings Saved",
        description: "Your synchronization settings have been updated.",
        variant: "default",
        id: "settings-saved",
      });
    } catch (error) {
      toast({
        title: "Failed to Save Settings",
        description: "Could not save synchronization settings. Please try again.",
        variant: "destructive",
        id: "settings-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert schedule to minutes
  const getSyncIntervalMinutes = (schedule: string): number => {
    switch (schedule) {
      case "hourly": return 60;
      case "daily": return 60 * 24;
      case "weekly": return 60 * 24 * 7;
      default: return 0; // Manual
    }
  };

  // Add a new device
  const addDevice = async () => {
    if (!newDeviceName.trim()) {
      toast({
        title: "Device Name Required",
        description: "Please enter a name for the device.",
        variant: "destructive",
        id: "device-name-required",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerDevice(newDeviceName);
      toast({
        title: "Device Added",
        description: `Device "${newDeviceName}" has been registered. Use this code on your device: ${result.deviceId.substring(0, 8)}`,
        variant: "default",
        id: "device-added",
      });
      setNewDeviceName("");
      await fetchSyncStatus(); // Refresh devices list
    } catch (error) {
      toast({
        title: "Failed to Add Device",
        description: "Could not register the device. Please try again.",
        variant: "destructive",
        id: "device-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a device
  const handleRemoveDevice = async (deviceId: string) => {
    setIsLoading(true);
    try {
      await removeDevice(deviceId);
      toast({
        title: "Device Removed",
        description: "The device has been removed from your sync list.",
        variant: "default",
        id: "device-removed",
      });
      await fetchSyncStatus(); // Refresh devices list
    } catch (error) {
      toast({
        title: "Failed to Remove Device",
        description: "Could not remove the device. Please try again.",
        variant: "destructive",
        id: "device-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
            <Cloud className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Seamless Cross-Platform File Sync</h3>
            <p className="text-zinc-400 text-sm">
              Keep your files in sync across all your devices
            </p>
          </div>
        </div>
        <div className="bg-zinc-700 text-xs px-2 py-1 rounded-full">Active</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "status"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("status")}
        >
          Status
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "devices"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("devices")}
        >
          Devices
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "settings"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === "status" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-700 p-4 rounded-lg">
                <p className="text-zinc-400 text-sm mb-1">Last Sync</p>
                <p className="text-lg font-medium">
                  {syncStatus?.lastSyncTime
                    ? new Date(syncStatus.lastSyncTime).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div className="bg-zinc-700 p-4 rounded-lg">
                <p className="text-zinc-400 text-sm mb-1">Files Synced</p>
                <p className="text-lg font-medium">
                  {syncStatus?.syncedFilesCount || 0}
                </p>
              </div>
              <div className="bg-zinc-700 p-4 rounded-lg">
                <p className="text-zinc-400 text-sm mb-1">Pending Changes</p>
                <p className="text-lg font-medium">
                  {syncStatus?.pendingChanges || 0}
                </p>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              Sync Now
            </button>
          </div>
        )}

        {activeTab === "devices" && (
          <div>
            <div className="mb-6">
              <div className="flex mb-4">
                <input
                  type="text"
                  placeholder="Device name (e.g. My MacBook)"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-zinc-700 rounded-l-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addDevice}
                  disabled={isLoading || !newDeviceName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Device
                </button>
              </div>

              <div className="space-y-3">
                {devices && devices.length > 0 ? (
                  devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between bg-zinc-700 p-3 rounded-lg"
                    >
                      <div className="flex items-center">
                        <DeviceIcon type={getDeviceType(device.name)} className="h-5 w-5 mr-3 text-zinc-300" />
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-xs text-zinc-400">
                            Last seen: {new Date(device.lastSeen).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge status={device.status} />
                        <button
                          onClick={() => handleRemoveDevice(device.id)}
                          className="ml-3 p-1.5 text-zinc-400 hover:text-red-500 rounded-full hover:bg-zinc-600 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No devices registered yet.</p>
                    <p className="text-sm">Add a device to start syncing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium">Automatic Sync</span>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={syncSettings.autoSync}
                    onChange={() =>
                      setSyncSettings({
                        ...syncSettings,
                        autoSync: !syncSettings.autoSync,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block h-6 rounded-full w-10 transition-colors ${
                      syncSettings.autoSync ? "bg-blue-600" : "bg-zinc-600"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 h-4 w-4 rounded-full transition ${
                      syncSettings.autoSync ? "translate-x-4 bg-white" : "bg-zinc-400"
                    }`}
                  ></div>
                </div>
              </label>
              <p className="text-sm text-zinc-400 mt-1">
                Automatically sync files when changes are detected
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium">Sync on Wi-Fi Only</span>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={syncSettings.syncOnWifi}
                    onChange={() =>
                      setSyncSettings({
                        ...syncSettings,
                        syncOnWifi: !syncSettings.syncOnWifi,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block h-6 rounded-full w-10 transition-colors ${
                      syncSettings.syncOnWifi ? "bg-blue-600" : "bg-zinc-600"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 h-4 w-4 rounded-full transition ${
                      syncSettings.syncOnWifi ? "translate-x-4 bg-white" : "bg-zinc-400"
                    }`}
                  ></div>
                </div>
              </label>
              <p className="text-sm text-zinc-400 mt-1">
                Only sync when connected to Wi-Fi to save data
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Sync Schedule</label>
              <select
                value={syncSettings.syncSchedule}
                onChange={(e) =>
                  setSyncSettings({
                    ...syncSettings,
                    syncSchedule: e.target.value as any,
                  })
                }
                className="w-full p-2.5 bg-zinc-700 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
              <p className="text-sm text-zinc-400 mt-1">
                How often automatic syncing should occur
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium">Preserve Folder Structure</span>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={syncSettings.preserveFolderStructure}
                    onChange={() =>
                      setSyncSettings({
                        ...syncSettings,
                        preserveFolderStructure: !syncSettings.preserveFolderStructure,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block h-6 rounded-full w-10 transition-colors ${
                      syncSettings.preserveFolderStructure ? "bg-blue-600" : "bg-zinc-600"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 h-4 w-4 rounded-full transition ${
                      syncSettings.preserveFolderStructure ? "translate-x-4 bg-white" : "bg-zinc-400"
                    }`}
                  ></div>
                </div>
              </label>
              <p className="text-sm text-zinc-400 mt-1">
                Maintain the same folder organization across devices
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Conflict Resolution</label>
              <select
                value={syncSettings.conflictResolution}
                onChange={(e) =>
                  setSyncSettings({
                    ...syncSettings,
                    conflictResolution: e.target.value as any,
                  })
                }
                className="w-full p-2.5 bg-zinc-700 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Keep Newest</option>
                <option value="prompt">Ask Me</option>
                <option value="both">Keep Both Files</option>
              </select>
              <p className="text-sm text-zinc-400 mt-1">
                How to handle file conflicts during synchronization
              </p>
            </div>

            <button
              onClick={saveSyncSettings}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "syncing":
        return "bg-blue-500";
      default:
        return "bg-zinc-500";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${getStatusColor()} text-white`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Helper function to determine device type from name
const getDeviceType = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("mac") || lowerName.includes("book") || lowerName.includes("laptop")) {
    return "laptop";
  }
  if (lowerName.includes("phone") || lowerName.includes("iphone") || lowerName.includes("android")) {
    return "phone";
  }
  if (lowerName.includes("tv") || lowerName.includes("desktop")) {
    return "desktop";
  }
  return "laptop"; // default
};

// Device icon component
const DeviceIcon: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  switch (type) {
    case "phone":
      return <Smartphone className={className} />;
    case "desktop":
      return <Tv className={className} />;
    case "laptop":
    default:
      return <Laptop className={className} />;
  }
};

export default FileSync;