import React, { useState } from 'react';
import { AnalyzeIcon, IntelligentIcon, BrainIcon } from '@/components/icons';
import { Info, Check, BrainCog } from 'lucide-react';
import { formatModelName } from '@/utils/modelUtils';

interface RenameSettingsCardProps {
  onRename: (pattern: string, model?: string) => void;
}

const RenameSettingsCard: React.FC<RenameSettingsCardProps> = ({ onRename }) => {
  const [pattern, setPattern] = useState('Content_Owner_Date');
  const [useAiRenaming, setUseAiRenaming] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt_4o');
  
  const handleAnalyzeAndRename = () => {
    onRename(pattern, selectedModel);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 h-full relative">
      <div className="absolute top-5 right-5">
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Info className="h-5 w-5" />
        </button>
      </div>
      
      <h2 className="text-xl font-semibold text-orange-500 mb-4">Rename Settings</h2>
      
      <div className="space-y-6">
        {/* Use content-based naming patterns */}
        <div className="flex items-center">
          <button 
            className={`w-5 h-5 rounded-full border ${
              useAiRenaming 
                ? 'bg-orange-500 border-orange-500' 
                : 'bg-transparent border-zinc-600'
            } flex items-center justify-center mr-3`}
            onClick={() => setUseAiRenaming(!useAiRenaming)}
          >
            {useAiRenaming && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className="text-zinc-100">Use content-based naming patterns</span>
        </div>
        
        {/* Naming Pattern */}
        <div className="space-y-2">
          <label className="block text-zinc-400 text-sm">Naming Pattern</label>
          <div className="relative">
            <select 
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Content_Owner_Date">Content_Owner_Date</option>
              <option value="Date_Content_Type">Date_Content_Type</option>
              <option value="Author_Title_Date">Author_Title_Date</option>
              <option value="Project_Category_Name">Project_Category_Name</option>
              <option value="Custom">Custom Pattern</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* AI-Powered Renaming */}
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <div className="flex mb-2">
            <div className="bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center mr-2">
              <IntelligentIcon className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-medium">AI-Powered Renaming</h3>
          </div>
          <p className="text-zinc-400 text-sm mb-3">
            Intelligently renames files based on content analysis
          </p>
          
          {/* AI Model Selection */}
          <div className="mb-3">
            <label className="block text-zinc-400 text-xs mb-1 flex items-center">
              <BrainIcon className="h-3 w-3 mr-1" />
              AI Model
            </label>
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="gpt_4o">GPT-4o (Recommended)</option>
                <option value="claude_3_7_sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt_4o_mini">GPT-4o Mini</option>
                <option value="gpt_4_turbo">GPT-4 Turbo</option>
                <option value="claude_3_sonnet">Claude 3 Sonnet</option>
                <option value="llama_3_2_90b">Llama 3.2 90B</option>
                <option value="gemini_1_5_pro">Gemini 1.5 Pro</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <BrainCog className="h-3.5 w-3.5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1 italic">
              Selected model: {formatModelName(selectedModel)}
            </p>
          </div>
          
          <button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded transition-colors flex items-center justify-center"
            onClick={handleAnalyzeAndRename}
          >
            <AnalyzeIcon className="w-4 h-4 mr-2" />
            Analyze & Rename
          </button>
        </div>
        
        {/* Preview */}
        <div className="space-y-2">
          <h3 className="text-zinc-400 uppercase text-xs tracking-wider">PREVIEW</h3>
          <div className="space-y-1">
            <p className="text-zinc-400 text-sm">Original: <span className="text-white">example-file.jpg</span></p>
            <p className="text-zinc-400 text-sm">New: <span className="text-orange-500">Author_2023-09-15_example-file.jpg</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameSettingsCard;