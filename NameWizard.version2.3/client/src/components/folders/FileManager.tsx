import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { File as FileIcon, Folder as FolderIcon, Trash2, FolderPlus, Download, MoreHorizontal } from "lucide-react";
import { File, Folder } from "@shared/schema";
import FolderList from "./FolderList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchFolderFiles, moveFilesToFolder, createFolder } from "@/services/folderService";

interface FileManagerProps {
  className?: string;
}

const FileManager = ({ className = "" }: FileManagerProps) => {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null);
  
  const { toast } = useToast();

  // Fetch files for the selected folder
  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: selectedFolder ? [`/api/folders/${selectedFolder}/files`] : ["/api/files"],
    queryFn: async () => {
      if (selectedFolder) {
        return fetchFolderFiles(selectedFolder);
      } else {
        const response = await fetch("/api/files");
        if (!response.ok) throw new Error("Failed to fetch files");
        return response.json();
      }
    }
  });

  const toggleFileSelection = (fileId: number) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((file: File) => file.id));
    }
  };

  const handleMoveToFolder = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await moveFilesToFolder(selectedFiles, targetFolderId);
      
      setSelectedFiles([]);
      setShowMoveDialog(false);
      refetchFiles();
      
      toast({
        title: "Files moved",
        description: `Successfully moved ${selectedFiles.length} file(s) to ${targetFolderId === null ? "root" : "folder"}.`
      });
    } catch (error) {
      toast({
        title: "Error moving files",
        description: "An error occurred while moving the files.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for the new folder.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createFolder({
        name: newFolderName,
        parentId: selectedFolder,
        color: "#3b82f6", // Default blue color
        icon: "folder"
      });
      
      setNewFolderName("");
      setShowNewFolderDialog(false);
      
      // Refetch folders
      if (selectedFolder) {
        // Refresh current folder files too
        refetchFiles();
      }
      
      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created successfully.`
      });
    } catch (error) {
      toast({
        title: "Error creating folder",
        description: "An error occurred while creating the folder.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Left sidebar with folders */}
      <div className="w-1/4 p-4 border-r h-full overflow-auto">
        <FolderList 
          selectedFolder={selectedFolder} 
          onSelectFolder={setSelectedFolder} 
        />
      </div>

      {/* Right side with files */}
      <div className="w-3/4 p-4 h-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedFolder ? "Folder Files" : "All Files"}
          </h2>
          
          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowMoveDialog(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  Move to Folder
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </>
            )}
            
            {selectedFiles.length === 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowNewFolderDialog(true)}
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={selectAllFiles}
            >
              {selectedFiles.length === files.length && files.length > 0 ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>

        {/* Files grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No files in this location
            </div>
          ) : (
            files.map((file: File) => (
              <div 
                key={file.id}
                className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 relative ${
                  selectedFiles.includes(file.id) ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : ""
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{file.newName}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles([file.id]);
                        setShowMoveDialog(true);
                      }}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Move to Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {file.type} • {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Move files dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Files to Folder</DialogTitle>
            <DialogDescription>
              Select a destination folder for the selected file(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-64 overflow-y-auto border rounded-md p-2">
            <div 
              className={`flex items-center px-2 py-1 rounded-md cursor-pointer mb-2 ${
                targetFolderId === null ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setTargetFolderId(null)}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              <span>Root (All Files)</span>
            </div>
            <FolderSelectionTree 
              selectedFolder={targetFolderId} 
              onSelectFolder={setTargetFolderId} 
              currentFolder={selectedFolder}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveToFolder}>
              Move {selectedFiles.length} file(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New folder dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input 
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="My Folder"
              className="mt-2 w-full text-base py-2"
              size={40}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
            {selectedFolder && (
              <p className="text-sm text-muted-foreground mt-2">
                This folder will be created inside the current folder.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewFolderName("");
              setShowNewFolderDialog(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Simplified version of FolderList for the move dialog
const FolderSelectionTree = ({ 
  selectedFolder, 
  onSelectFolder, 
  currentFolder 
}: { 
  selectedFolder: number | null, 
  onSelectFolder: (folderId: number | null) => void, 
  currentFolder: number | null 
}) => {
  const { data: folders = [] } = useQuery({
    queryKey: ["/api/folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch folders");
      return response.json();
    }
  });
  
  // Extended folder type with children property
  interface FolderWithChildren extends Folder {
    children: FolderWithChildren[];
  }
  
  // Function to build a tree from flat folder list
  const buildFolderTree = (folders: Folder[], parentId: number | null = null): FolderWithChildren[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderTree(folders, folder.id)
      }));
  };
  
  const renderFolderTree = (folders: FolderWithChildren[], level = 0) => {
    return folders.map(folder => (
      <div key={folder.id}>
        <div 
          className={`flex items-center px-2 py-1 rounded-md cursor-pointer ${
            selectedFolder === folder.id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          style={{ marginLeft: `${level * 12}px` }}
          onClick={() => {
            // Don't allow moving to the current folder
            if (folder.id !== currentFolder) {
              onSelectFolder(folder.id);
            }
          }}
        >
          <FolderIcon className="h-4 w-4 mr-2" style={{ color: folder.color || "currentColor" }} />
          <span className={folder.id === currentFolder ? "text-gray-400" : ""}>
            {folder.name}
            {folder.id === currentFolder ? " (current)" : ""}
          </span>
        </div>
        {folder.children && renderFolderTree(folder.children, level + 1)}
      </div>
    ));
  };
  
  const folderTree = buildFolderTree(folders);
  
  return <div>{renderFolderTree(folderTree)}</div>;
};

export default FileManager;