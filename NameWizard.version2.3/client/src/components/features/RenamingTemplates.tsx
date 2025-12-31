import { useState } from 'react';
import { X, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TemplateVariable {
  id: string;
  name: string;
  selected: boolean;
}

const RenamingTemplates = () => {
  const [variables, setVariables] = useState<TemplateVariable[]>([
    { id: 'invoice_no', name: 'Invoice No.', selected: true },
    { id: 'file_name', name: 'File name', selected: true },
    { id: 'date', name: 'Date', selected: true },
    { id: 'purpose', name: 'Purpose', selected: true },
  ]);
  
  const [activeVariable, setActiveVariable] = useState<string | null>(null);
  const [separator, setSeparator] = useState<string>('_');
  const [previewFilename, setPreviewFilename] = useState('Invoice No._Filename_16.12.2024_Purpose_.pdf');
  
  const toggleVariable = (id: string) => {
    setVariables(prev => 
      prev.map(v => v.id === id ? { ...v, selected: !v.selected } : v)
    );
    
    // Update preview filename
    updatePreviewFilename();
  };
  
  const updatePreviewFilename = () => {
    const selectedVars = variables.filter(v => v.selected).map(v => v.name);
    const newName = selectedVars.join(separator) + '.pdf';
    setPreviewFilename(newName);
  };
  
  const handleSeparatorChange = (sep: string) => {
    setSeparator(sep);
    updatePreviewFilename();
  };
  
  return (
    <div className="bg-[#f3f8fb] p-8 rounded-3xl">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white w-16 h-16 rounded-xl mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12V5C20 3.89543 19.1046 3 18 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 12L16 16M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-1 text-gray-800">Your Renaming Templates</h2>
          <p className="text-gray-600 text-center">Use the Renaming pattern to set up naming configuration for renaming</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 flex items-center mb-4">
              <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              File name pattern
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {variables.filter(v => v.selected).map((variable) => (
                <div 
                  key={variable.id}
                  className="rounded-md bg-blue-100 px-2.5 py-1 text-sm text-blue-800 flex items-center"
                >
                  {variable.name}
                  <button 
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                    onClick={() => toggleVariable(variable.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="text-gray-500">|</div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {variables.map((variable) => (
                <button
                  key={variable.id}
                  className={`rounded-md px-2.5 py-1 text-sm ${
                    variable.selected 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleVariable(variable.id)}
                  disabled={variable.selected}
                >
                  {variable.name}
                  {variable.selected && (
                    <X className="inline-block ml-1.5 w-3.5 h-3.5" />
                  )}
                </button>
              ))}
              
              <button className="flex items-center justify-center rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-800 hover:bg-gray-200">
                <Plus className="w-3.5 h-3.5 mr-1" />
                New variable
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">File name</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">The original filename</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">Date</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Document date in DD.MM.YYYY format</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">Purpose</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Document purpose (AI extracted)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">New variable</span>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="text-sm text-gray-800 bg-gray-50 rounded-md p-2">
                {previewFilename}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">Variable separator</span>
              <div className="flex gap-2">
                {['_', '-', '.', ' '].map((sep) => (
                  <button
                    key={sep}
                    className={`w-6 h-6 flex items-center justify-center rounded-md ${
                      separator === sep ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100'
                    }`}
                    onClick={() => handleSeparatorChange(sep)}
                  >
                    {sep === ' ' ? 'Sp' : sep}
                  </button>
                ))}
                <span className="text-sm text-gray-500">None</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenamingTemplates;