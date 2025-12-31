import React, { useState, useRef, useEffect } from 'react';
import { FolderTree, FolderOpen, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Add directory attribute to the HTMLInputElement type
declare module 'react' {
  interface HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

interface MagicFolder {
  id: string;
  pattern: string;
  name: string;
  path: string;
  isActive: boolean;
}

interface MagicFoldersCardProps {
  onSelectFolder: (folder: string) => void;
}

const MagicFoldersCard: React.FC<MagicFoldersCardProps> = ({ onSelectFolder }) => {
  const { toast } = useToast();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>('/User/Documents/MagicFolder');
  
  const [folders, setFolders] = useState<MagicFolder[]>([
    {
      id: '1',
      pattern: 'content_owner_date',
      name: 'Magic folder',
      path: '/User/Documents/MagicFolder',
      isActive: true
    }
  ]);
  
  const [selectedPattern, setSelectedPattern] = useState('content_owner_date');
  
  const handlePickFolder = () => {
    // In a real desktop app, this would open a native folder picker
    // For this web app, we'll simulate by using a hidden input for a folder selection
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };
  
  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Since browser security prevents showing the real path, we'll simulate it
    const fakePath = `/User/Documents/Selected_${Math.floor(Math.random() * 1000)}`;
    setSelectedFolderPath(fakePath);
    onSelectFolder(fakePath);
    
    toast({
      title: "Folder Selected",
      description: `Selected folder: ${fakePath}`,
    });
  };
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <h2 className="text-xl font-semibold text-orange-500 mb-4">Magic Folders</h2>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-orange-500 bg-opacity-20 rounded-full p-1">
            <FolderTree className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="text-sm font-medium text-orange-500">Magic folder</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">Automatically organize your files in background mode</p>
        
        <div className="relative mb-3">
          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="content_owner_date">content_owner_date</option>
            <option value="content_date_category">content_date_category</option>
            <option value="owner_content_category">owner_content_category</option>
            <option value="date_content_owner">date_content_owner</option>
            <option value="category_date_content">category_date_content</option>
            <option value="university_guidelines">university_guidelines</option>
            <option value="corporate_organization">corporate_organization</option>
            <option value="sequential_numbering">sequential_numbering</option>
            <option value="daily_journal">daily_journal</option>
            <option value="project_document">project_document</option>
            <option value="custom_pattern">custom_pattern</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </div>
        </div>
        
        {/* Hidden input for folder selection */}
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          // @ts-ignore: Typescript doesn't recognize these attributes, but they are valid in modern browsers
          webkitdirectory="true"
          directory="true"
          onChange={handleFolderSelected}
        />
        
        <div className="flex flex-col gap-2">
          <Button 
            className="w-full border border-zinc-700 bg-transparent hover:bg-zinc-800 text-white flex items-center justify-center"
            onClick={handlePickFolder}
          >
            <FolderOpen className="mr-2 h-4 w-4 text-orange-500" />
            Pick folder
          </Button>
          
          {selectedFolderPath && (
            <div className="p-2 bg-zinc-800 rounded-md border border-zinc-700 text-xs text-gray-300 truncate">
              {selectedFolderPath}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <div className="text-xs text-gray-400">
            35 files processed
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicFoldersCard;