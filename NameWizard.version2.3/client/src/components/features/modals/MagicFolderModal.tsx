import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Folder, FolderOpen, Settings, Save, Trash2, Plus, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MagicFolder {
  id: string;
  path: string;
  fileCount: number;
  renamedCount: number;
  isActive: boolean;
}

interface MagicFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: MagicFolder[];
  onSave: (folders: MagicFolder[]) => void;
}

const MagicFolderModal: React.FC<MagicFolderModalProps> = ({ 
  isOpen, 
  onClose, 
  folders: initialFolders, 
  onSave 
}) => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<MagicFolder[]>(initialFolders);
  const [newFolderPath, setNewFolderPath] = useState('');
  
  const toggleFolderActive = (id: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === id ? { ...folder, isActive: !folder.isActive } : folder
      )
    );
  };
  
  const removeFolder = (id: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
  };
  
  const addNewFolder = () => {
    if (!newFolderPath.trim()) {
      toast({
        title: "Error",
        description: "Folder path cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // Create new folder with random ID and add to list
    const newFolder: MagicFolder = {
      id: `folder-${Date.now()}`,
      path: newFolderPath,
      fileCount: 0,
      renamedCount: 0,
      isActive: true
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderPath('');
    
    toast({
      title: "Folder Added",
      description: "New magic folder has been added",
    });
  };
  
  const handleSave = () => {
    onSave(folders);
    
    toast({
      title: "Folders Saved",
      description: "Your magic folders have been saved successfully",
    });
    
    onClose();
  };
  
  const handleBrowseFolder = () => {
    // In a real app, this would open a folder browser dialog
    // For our demo, we'll just set a sample path
    const samplePaths = [
      '/Users/Desktop/Documents',
      '/Users/Downloads/Images',
      '/Users/Documents/Work/Project Files',
      '/Users/Desktop/New folder/Important'
    ];
    
    const randomPath = samplePaths[Math.floor(Math.random() * samplePaths.length)];
    setNewFolderPath(randomPath);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Manage Magic Folders</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure folders for automatic file organization
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            {folders.map(folder => (
              <div key={folder.id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Folder className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-sm text-white">{folder.path}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Active</span>
                      <Switch 
                        checked={folder.isActive}
                        onCheckedChange={() => toggleFolderActive(folder.id)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 border-zinc-700 text-white hover:bg-zinc-800 hover:text-red-500"
                      onClick={() => removeFolder(folder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-400">
                  <div>Files: {folder.fileCount}</div>
                  <div>Renamed: {folder.renamedCount}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">Add New Magic Folder</h3>
            
            <div className="flex gap-2">
              <div className="flex-1 border border-zinc-800 rounded-md flex">
                <div className="bg-zinc-900 border-r border-zinc-800 px-3 flex items-center">
                  <Folder className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={newFolderPath}
                  onChange={(e) => setNewFolderPath(e.target.value)}
                  placeholder="Enter folder path..."
                  className="flex-1 bg-zinc-900 text-white py-2 px-3 rounded-r-md focus:outline-none"
                />
              </div>
              <Button 
                variant="outline" 
                className="border-zinc-700 text-white hover:bg-zinc-800"
                onClick={handleBrowseFolder}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Browse
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={addNewFolder}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-400">
              <Info className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
              <p>
                Magic folders will intelligently organize and rename files based on content analysis and your naming templates.
                Files will be automatically processed when they appear in these folders.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-white hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MagicFolderModal;