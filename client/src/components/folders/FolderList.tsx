import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronRight, ChevronDown, Folder, File, Plus, 
  Edit, Trash2, MoreVertical, X, Check
} from "lucide-react";
import { Folder as FolderType, File as FileType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { fetchChildFolders, fetchFolderFiles, createFolder, updateFolder, deleteFolder, fetchRootFolders } from "@/services/folderService";

interface FolderItemProps {
  folder: FolderType;
  level: number;
  selectedFolder: number | null;
  onSelectFolder: (folderId: number | null) => void;
  onRefresh: () => void;
}

// Component for rendering a single folder with its children
const FolderItem = ({ folder, level, selectedFolder, onSelectFolder, onRefresh }: FolderItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const { toast } = useToast();
  
  const { data: childFolders = [], refetch: refetchChildren } = useQuery({
    queryKey: [`/api/folders/${folder.id}/children`],
    queryFn: () => fetchChildFolders(folder.id),
    enabled: expanded
  });
  
  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: [`/api/folders/${folder.id}/files`],
    queryFn: () => fetchFolderFiles(folder.id),
    enabled: expanded
  });
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleSelect = () => {
    onSelectFolder(folder.id);
  };
  
  const handleRename = async () => {
    if (isRenaming) {
      try {
        await updateFolder(folder.id, { name: newName });
        setIsRenaming(false);
        onRefresh();
        toast({
          title: "Folder renamed",
          description: `Folder has been renamed to ${newName}.`
        });
      } catch (error) {
        toast({
          title: "Error renaming folder",
          description: "An error occurred while renaming the folder.",
          variant: "destructive"
        });
      }
    } else {
      setIsRenaming(true);
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteFolder(folder.id);
      setShowDeleteDialog(false);
      onRefresh();
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting folder",
        description: "The folder may contain files or subfolders.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateSubfolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder({
        name: newFolderName,
        parentId: folder.id
      });
      
      setNewFolderName("");
      setShowNewFolderDialog(false);
      
      // Ensure the folder is expanded to show the new subfolder
      if (!expanded) {
        setExpanded(true);
      } else {
        refetchChildren();
      }
      
      toast({
        title: "Subfolder created",
        description: `Subfolder ${newFolderName} has been created.`
      });
    } catch (error) {
      toast({
        title: "Error creating subfolder",
        description: "An error occurred while creating the subfolder.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
          selectedFolder === folder.id ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
        style={{ marginLeft: `${level * 12}px` }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 p-0 mr-1" 
          onClick={toggleExpand}
        >
          {childFolders.length > 0 || files.length > 0 ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="w-4" />
          )}
        </Button>
        
        <div 
          className="flex-1 flex items-center cursor-pointer overflow-hidden" 
          onClick={handleSelect}
        >
          <Folder className="h-4 w-4 mr-1 flex-shrink-0" 
            style={{ color: folder.color || "currentColor" }} 
          />
          
          {isRenaming ? (
            <Input
              className="h-7 py-0 px-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              onBlur={() => setIsRenaming(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setIsRenaming(false);
              }}
            />
          ) : (
            <span className="truncate">{folder.name}</span>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowNewFolderDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Subfolder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRename}>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {expanded && (
        <div>
          {childFolders.map((childFolder) => (
            <FolderItem
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
      
      {/* Dialog for creating a new subfolder */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subfolder</DialogTitle>
            <DialogDescription>
              Create a new subfolder under "{folder.name}".
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubfolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog for folder deletion */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{folder.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface FolderListProps {
  selectedFolder: number | null;
  onSelectFolder: (folderId: number | null) => void;
}

// Main component for rendering the folder list
const FolderList = ({ selectedFolder, onSelectFolder }: FolderListProps) => {
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { toast } = useToast();
  
  const { data: rootFolders = [], refetch: refetchRootFolders } = useQuery({
    queryKey: ["/api/folders/root"],
    queryFn: fetchRootFolders
  });
  
  const handleRefresh = () => {
    refetchRootFolders();
  };
  
  const handleCreateRootFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder({
        name: newFolderName,
        parentId: null
      });
      
      setNewFolderName("");
      setShowNewFolderDialog(false);
      refetchRootFolders();
      
      toast({
        title: "Folder created",
        description: `Folder ${newFolderName} has been created.`
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
    <div className="pb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Folders</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowNewFolderDialog(true)}
          className="h-8 px-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
      
      <div className="mb-2">
        <div 
          className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
            selectedFolder === null ? "bg-gray-100 dark:bg-gray-800" : ""
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <div className="w-6" />
          <Folder className="h-4 w-4 mr-2" />
          <span>All Files</span>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto p-1">
          {rootFolders.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No folders yet. Create one to organize your files.
            </div>
          ) : (
            rootFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                level={0}
                selectedFolder={selectedFolder}
                onSelectFolder={onSelectFolder}
                onRefresh={handleRefresh}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Dialog for creating a new root folder */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your files.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRootFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderList;