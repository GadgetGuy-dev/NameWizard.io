import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import NewUploadFileCard from '@/components/home/NewUploadFileCard';
import NewRenameSettingsCard from '@/components/home/NewRenameSettingsCard';
import MagicFoldersCard from '@/components/home/MagicFoldersCard';
import { useToast } from '@/hooks/use-toast';

const HomePage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    toast({
      title: "Files Uploaded",
      description: `${selectedFiles.length} files have been uploaded.`,
      variant: "default",
    });
  };

  const handleRename = (pattern: string, model: string) => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload files before renaming.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would call the API to rename files
    toast({
      title: "Renaming Files",
      description: `Renaming ${files.length} files with pattern: ${pattern} using ${model}`,
      variant: "default",
    });
  };

  const handleSelectFolder = (folderPath: string) => {
    toast({
      title: "Folder Selected",
      description: `Selected folder: ${folderPath}`,
      variant: "default",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Upload Section */}
        <NewUploadFileCard onFilesSelected={handleFilesSelected} />
        
        {/* Settings and Magic Folders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <NewRenameSettingsCard onRename={handleRename} />
          <MagicFoldersCard onSelectFolder={handleSelectFolder} />
        </div>
        
        {/* Status Footer */}
        <div className="border-t border-zinc-800 mt-8 pt-4 pb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-400">Active: AI Services</span>
                <span className="ml-1 px-1 bg-zinc-800 text-xs rounded text-gray-400">1</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-400">Active: Renaming</span>
                <span className="ml-1 px-1 bg-zinc-800 text-xs rounded text-gray-400">1</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-400">Active: Magic Folders</span>
                <span className="ml-1 px-1 bg-zinc-800 text-xs rounded text-gray-400">1</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-400">Active: Templates</span>
                <span className="ml-1 px-1 bg-zinc-800 text-xs rounded text-gray-400">3</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              NameWizard.io v1.0
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;