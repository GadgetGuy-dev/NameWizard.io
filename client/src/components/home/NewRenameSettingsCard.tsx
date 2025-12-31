import React, { useState } from 'react';
import { ChevronDown, BrainCog, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NewRenameSettingsCardProps {
  onRename: (pattern: string, model: string) => void;
}

const NewRenameSettingsCard: React.FC<NewRenameSettingsCardProps> = ({ onRename }) => {
  const [namingPattern, setNamingPattern] = useState('Content Owner Date');
  const [selectedModel, setSelectedModel] = useState('GPT-4o (Recommended)');

  const handleRename = () => {
    onRename(namingPattern, selectedModel);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Rename Settings</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-300 mb-1">Naming Pattern</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1 text-gray-500 hover:text-gray-400">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                  <p className="text-xs max-w-xs">Choose the naming pattern for your files. This pattern will be used to rename all files.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="relative">
            <select
              value={namingPattern}
              onChange={(e) => setNamingPattern(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Content Owner Date">Content Owner Date</option>
              <option value="Content Date Category">Content Date Category</option>
              <option value="Owner Content Category">Owner Content Category</option>
              <option value="Date Content Owner">Date Content Owner</option>
              <option value="Category Date Content">Category Date Content</option>
              <option value="University Guidelines">University Guidelines</option>
              <option value="Corporate Organization">Corporate Organization</option>
              <option value="Sequential Numbering">Sequential Numbering</option>
              <option value="Daily Journal">Daily Journal</option>
              <option value="Project Document">Project Document</option>
              <option value="Custom Pattern">Custom Pattern</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-300 mb-1">AI Model</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1 text-gray-500 hover:text-gray-400">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                  <p className="text-xs max-w-xs">Select the AI model to use for analyzing file content and generating names.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="GPT-4o (Recommended)">GPT-4o (Recommended)</option>
              <option value="GPT-3.5 (Faster)">GPT-3.5 (Faster)</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              <option value="Llama 3 70B Instruct">Llama 3 70B Instruct</option>
              <option value="Pi / Inflection 2.5">Pi / Inflection 2.5</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <BrainCog className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3"
          onClick={handleRename}
        >
          Analyze & Rename
        </Button>
        
        <p className="text-xs text-zinc-500 text-center">
          Add valid API keys in Profile settings to enable AI renaming
        </p>
      </div>
    </div>
  );
};

export default NewRenameSettingsCard;