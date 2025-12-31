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
import { X, Plus, Info, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface TemplateVariable {
  id: string;
  name: string;
  selected: boolean;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variables: TemplateVariable[], separator: string) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [variables, setVariables] = useState<TemplateVariable[]>([
    { id: 'invoice_no', name: 'Invoice No.', selected: true },
    { id: 'file_name', name: 'File name', selected: true },
    { id: 'date', name: 'Date', selected: true },
    { id: 'purpose', name: 'Purpose', selected: true },
  ]);
  
  const [separator, setSeparator] = useState<string>('_');
  const [previewFilename, setPreviewFilename] = useState('Invoice No._Filename_16.12.2024_Purpose_.pdf');
  const [newVariableName, setNewVariableName] = useState('');
  
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
  
  const addNewVariable = () => {
    if (!newVariableName.trim()) {
      toast({
        title: "Error",
        description: "Variable name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const id = newVariableName.toLowerCase().replace(/\s+/g, '_');
    
    if (variables.some(v => v.id === id)) {
      toast({
        title: "Error",
        description: "A variable with this name already exists",
        variant: "destructive",
      });
      return;
    }
    
    setVariables(prev => [...prev, { id, name: newVariableName, selected: true }]);
    setNewVariableName('');
    updatePreviewFilename();
  };
  
  const handleSave = () => {
    if (variables.filter(v => v.selected).length === 0) {
      toast({
        title: "Error",
        description: "At least one variable must be selected",
        variant: "destructive",
      });
      return;
    }
    
    onSave(variables, separator);
    
    toast({
      title: "Template Saved",
      description: "Your naming template has been saved successfully",
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Edit Renaming Template</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a pattern to consistently name your files
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white flex items-center mb-4">
              File name pattern
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-zinc-900 rounded-md min-h-12 border border-zinc-800">
              {variables.filter(v => v.selected).map((variable) => (
                <div 
                  key={variable.id}
                  className="rounded-md bg-orange-950 px-2.5 py-1 text-sm text-orange-500 flex items-center"
                >
                  {variable.name}
                  <button 
                    className="ml-1.5 text-orange-500 hover:text-orange-400"
                    onClick={() => toggleVariable(variable.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {variables.map((variable) => (
                <button
                  key={variable.id}
                  className={`rounded-md px-2.5 py-1 text-sm ${
                    variable.selected 
                      ? 'bg-orange-950 text-orange-500' 
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                  onClick={() => toggleVariable(variable.id)}
                  disabled={variable.selected}
                >
                  {variable.name}
                </button>
              ))}
              
              <div className="flex items-center">
                <input
                  type="text"
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="New variable"
                  className="rounded-l-md bg-zinc-800 border-zinc-700 text-white text-sm px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button 
                  className="rounded-r-md bg-orange-500 px-2.5 py-1 text-sm text-white hover:bg-orange-600"
                  onClick={addNewVariable}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white mr-2">File name</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                        <p className="text-xs">The original filename</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white mr-2">Date</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                        <p className="text-xs">Document date in DD.MM.YYYY format</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white mr-2">Purpose</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                        <p className="text-xs">Document purpose (AI extracted)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-4">
            <div className="mb-5">
              <h4 className="text-sm font-medium text-white mb-2">Preview</h4>
              <div className="text-sm text-white bg-zinc-900 rounded-md p-3 border border-zinc-800">
                {previewFilename}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-white mr-3">Variable separator</span>
              <div className="flex gap-2">
                {['_', '-', '.', ' '].map((sep) => (
                  <button
                    key={sep}
                    className={`w-6 h-6 flex items-center justify-center rounded-md ${
                      separator === sep 
                        ? 'bg-orange-950 text-orange-500 border border-orange-700' 
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                    onClick={() => handleSeparatorChange(sep)}
                  >
                    {sep === ' ' ? 'Sp' : sep}
                  </button>
                ))}
                <button
                  className={`px-2 py-1 rounded-md text-xs ${
                    separator === '' 
                      ? 'bg-orange-950 text-orange-500 border border-orange-700' 
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                  onClick={() => handleSeparatorChange('')}
                >
                  None
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-white hover:bg-zinc-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;