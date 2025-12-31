import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { PanelLeft, Check, FileText, FolderTree, Layers, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RenamingTemplates from '@/components/features/RenamingTemplates';
import MagicFolders from '@/components/features/MagicFolders';
import BulkRename from '@/components/features/BulkRename';
import TemplateModal from '@/components/features/modals/TemplateModal';
import MagicFolderModal from '@/components/features/modals/MagicFolderModal';
import BulkRenameModal from '@/components/features/modals/BulkRenameModal';

// Dark mode versions of the feature components
const DarkRenamingTemplates = () => {
  const [selectedVariables, setSelectedVariables] = useState(['Invoice No.', 'File name', 'Date', 'Purpose']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSaveTemplate = (variables: any[], separator: string) => {
    setSelectedVariables(variables.filter(v => v.selected).map(v => v.name));
    
    toast({
      title: "Template Updated",
      description: "Your naming template has been saved successfully",
    });
  };
  
  return (
    <>
      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-950">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-950 flex items-center justify-center text-orange-500 mr-3">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Renaming Templates</h3>
              <p className="text-gray-400 text-sm">Define custom naming patterns</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm text-gray-400">Active</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-md p-3 bg-zinc-900">
            <div className="mb-2 text-sm text-gray-400">Current Pattern</div>
            <div className="flex flex-wrap gap-2">
              {selectedVariables.map((variable) => (
                <span key={variable} className="bg-orange-950 text-orange-500 px-2 py-0.5 rounded text-sm">
                  {variable}
                </span>
              ))}
            </div>
          </div>
          
          <div className="border border-zinc-800 rounded-md p-3 bg-zinc-900">
            <div className="mb-2 text-sm text-gray-400">Preview</div>
            <div className="text-sm text-white">
              Invoice No._Filename_16.12.2024_Purpose_.pdf
            </div>
          </div>
          
          <button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-medium text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Edit Template
          </button>
        </div>
      </div>
      
      <TemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTemplate}
      />
    </>
  );
};

const DarkMagicFolders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const [folders, setFolders] = useState([
    {
      id: '1',
      path: '/User/Desktop/New folder/MagicFolder',
      fileCount: 35,
      renamedCount: 15,
      isActive: true
    }
  ]);
  
  const handleSaveFolders = (updatedFolders: any[]) => {
    setFolders(updatedFolders);
    
    toast({
      title: "Folders Updated",
      description: `${updatedFolders.length} magic folders have been saved`,
    });
  };
  
  return (
    <>
      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-950">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-950 flex items-center justify-center text-orange-500 mr-3">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Magic Folders</h3>
              <p className="text-gray-400 text-sm">Auto-organize files</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm text-gray-400">Active</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-md p-3 bg-zinc-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Folders</span>
              <span className="bg-orange-950 text-orange-500 px-2 py-0.5 rounded text-xs">
                {folders.filter(f => f.isActive).length} Active
              </span>
            </div>
            {folders.map(folder => (
              <div key={folder.id} className="flex items-center text-sm text-white mb-1 last:mb-0">
                <FolderTree className="w-4 h-4 mr-2 text-orange-500" />
                {folder.path}
                {!folder.isActive && <span className="ml-2 text-xs text-gray-500">(inactive)</span>}
              </div>
            ))}
          </div>
          
          <div className="border border-zinc-800 rounded-md p-3 bg-zinc-900">
            <div className="mb-2 text-sm text-gray-400">Stats</div>
            <div className="flex justify-between text-sm">
              <span className="text-white">
                {folders.reduce((sum, folder) => sum + folder.fileCount, 0)} files
              </span>
              <span className="text-orange-500">
                {folders.reduce((sum, folder) => sum + folder.renamedCount, 0)} renamed
              </span>
            </div>
          </div>
          
          <button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-medium text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Manage Folders
          </button>
        </div>
      </div>
      
      <MagicFolderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        folders={folders}
        onSave={handleSaveFolders}
      />
    </>
  );
};

const DarkBulkRename = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-950">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-950 flex items-center justify-center text-orange-500 mr-3">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">Bulk Rename</h3>
              <p className="text-gray-400 text-sm">Process multiple files at once</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm text-gray-400">Ready</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-md p-3 bg-zinc-900">
            <div className="mb-2 text-sm text-gray-400">Recent Activity</div>
            <div className="text-sm text-white flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-orange-500" />
                <span>Batch renaming completed</span>
              </div>
              <span className="text-gray-400">11:35</span>
            </div>
          </div>
          
          <div className="border border-zinc-800 rounded-md p-3 bg-zinc-900">
            <div className="mb-2 text-sm text-gray-400">Status</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white">2 files pending</span>
              <span className="text-orange-500">Using Template v2.1</span>
            </div>
          </div>
          
          <button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-medium text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            Start New Batch
          </button>
        </div>
      </div>
      
      <BulkRenameModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: "Content-Aware Naming",
      description: "AI analyzes your file contents to suggest relevant names based on content and context."
    },
    {
      title: "Batch Processing with Smart Grouping",
      description: "Process multiple files simultaneously with intelligent grouping for similar content."
    },
    {
      title: "Customizable Naming Templates",
      description: "Create and save your own naming patterns for consistent file organization."
    },
    {
      title: "AI-Powered Metadata Extraction",
      description: "Automatically extract and use metadata from files for more accurate naming."
    },
    {
      title: "Image & Document Content Detection",
      description: "Recognize content within images and documents for context-aware naming."
    },
    {
      title: "Preview & Approval Workflow",
      description: "Review suggested names before applying changes to maintain control."
    },
    {
      title: "Local AI Model Support",
      description: "Use locally-hosted AI models for enhanced privacy and offline capabilities."
    },
    {
      title: "Intelligent Case & Format Handling",
      description: "Apply consistent casing and formatting across your files."
    },
    {
      title: "Multi-Format and Multi-Language Support",
      description: "Works with all file types and supports multiple languages."
    },
    {
      title: "Duplicate & Conflict Resolution",
      description: "Automatically detect and resolve naming conflicts and duplicates."
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Features</h1>
          <p className="text-gray-300">
            Discover NameWizard's powerful AI-driven file naming capabilities
          </p>
        </div>
        
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="mb-6 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="demo" className="data-[state=active]:bg-orange-950 data-[state=active]:text-orange-500">
              Feature Demos
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-orange-950 data-[state=active]:text-orange-500">
              Feature Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="mt-0">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <DarkRenamingTemplates />
                <DarkMagicFolders />
                <DarkBulkRename />
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-950 flex items-center justify-center text-orange-500 mr-3">
                    <PanelLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Full Feature Experience</h3>
                    <p className="text-gray-400 text-sm">Try these features in a complete workflow</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-medium text-sm">
                    Try Renaming Templates
                  </button>
                  <button className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md font-medium text-sm">
                    Configure Magic Folders
                  </button>
                  <button className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md font-medium text-sm">
                    Start Bulk Rename
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="border border-zinc-800 bg-zinc-950 rounded-lg p-6 hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 bg-orange-950 text-orange-500 rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-white">{feature.title}</h3>
                      <p className="text-gray-300 mt-1 font-normal">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FeaturesPage;