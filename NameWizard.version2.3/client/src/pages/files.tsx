import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { FileArchive, Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FilesPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Files</h1>
          <p className="text-gray-300">
            Manage and organize your files
          </p>
        </div>
        
        <div className="border border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-950">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
            <FileArchive className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-semibold text-white">Upload Files</h2>
          <p className="text-gray-300 max-w-md font-medium">
            Drag and drop files here or click to browse your device. AI file naming will be applied once files are uploaded.
          </p>
          <div className="flex space-x-4 mt-4">
            <Button className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Button variant="outline" className="border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800">
              <FolderOpen className="mr-2 h-4 w-4" />
              Browse Folders
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FilesPage;