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
import { Upload, File, FileText, ArrowRight, Save, Info, Play, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomProgress } from '@/components/ui/custom-progress';

interface FileRenameData {
  id: string;
  originalName: string;
  newName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

interface BulkRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkRenameModal: React.FC<BulkRenameModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileRenameData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [templateVersion, setTemplateVersion] = useState('2.1');
  
  const addSampleFiles = () => {
    // In a real app, this would be a file upload/selection dialog
    // For our demo, we'll add sample files
    const sampleFiles: FileRenameData[] = [
      {
        id: `file-${Date.now()}-1`,
        originalName: 'Invoice_2025001.pdf',
        newName: '',
        status: 'pending'
      },
      {
        id: `file-${Date.now()}-2`,
        originalName: 'receipt-march-2025.pdf',
        newName: '',
        status: 'pending'
      },
      {
        id: `file-${Date.now()}-3`,
        originalName: 'Contract_Agreement_Company.docx',
        newName: '',
        status: 'pending'
      },
      {
        id: `file-${Date.now()}-4`,
        originalName: 'IMG_20250101_123456.jpg',
        newName: '',
        status: 'pending'
      }
    ];
    
    setFiles(sampleFiles);
    
    toast({
      title: "Files Added",
      description: `${sampleFiles.length} files have been added for bulk renaming`,
    });
  };
  
  const startProcessing = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "Please add files to process",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Update all files to processing status
    setFiles(prev => prev.map(file => ({ ...file, status: 'processing' })));
    
    // Simulate AI renaming process with progress
    for (let i = 0; i < files.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      
      // Generate AI-suggested name
      const originalName = files[i].originalName;
      let newName = '';
      
      // Generate a new name based on file type and content
      if (originalName.includes('Invoice')) {
        newName = `Invoice_${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}_CompanyX_Paid.pdf`;
      } else if (originalName.includes('receipt')) {
        newName = `Receipt_${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}_Office_Supplies.pdf`;
      } else if (originalName.includes('Contract')) {
        newName = `Contract_Agreement_${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}_Signed.docx`;
      } else if (originalName.includes('IMG')) {
        newName = `Meeting_Screenshot_${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}_Team.jpg`;
      }
      
      // Update files with randomly success/error status (mostly success)
      setFiles(prev => prev.map((file, idx) => {
        if (idx === i) {
          const isSuccess = Math.random() > 0.1; // 90% success rate
          return {
            ...file,
            newName: newName,
            status: isSuccess ? 'success' : 'error',
            errorMessage: isSuccess ? undefined : 'File may be locked or permissions issue'
          };
        }
        return file;
      }));
      
      // Update progress
      setProcessingProgress(Math.round(((i + 1) / files.length) * 100));
    }
    
    setIsProcessing(false);
    
    // Show toast when complete
    toast({
      title: "Processing Complete",
      description: `${files.length} files have been processed`,
    });
  };
  
  const clearFiles = () => {
    setFiles([]);
    setProcessingProgress(0);
    setIsProcessing(false);
  };
  
  const applyChanges = () => {
    const successCount = files.filter(file => file.status === 'success').length;
    
    toast({
      title: "Changes Applied",
      description: `${successCount} files have been successfully renamed`,
    });
    
    // Close modal
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-white max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Bulk Rename Files</DialogTitle>
          <DialogDescription className="text-gray-400">
            Process multiple files and apply naming templates
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {files.length === 0 ? (
            <div className="border-2 border-dashed border-zinc-800 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Add Files to Rename</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Upload files or select from your computer to batch rename using AI-powered templates
              </p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white mx-auto"
                onClick={addSampleFiles}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>
          ) : (
            <>
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <div className="bg-zinc-900 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-white font-medium">Files to Process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                      Template Version: <span className="text-orange-500">{templateVersion}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 border-zinc-700 text-white hover:bg-zinc-800"
                      onClick={clearFiles}
                    >
                      Clear All
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-7 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={addSampleFiles}
                    >
                      Add More
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="px-4 py-3 border-t border-zinc-800 flex items-start gap-3"
                    >
                      <div className="w-8 flex-shrink-0 pt-1">
                        <File className={`w-5 h-5 ${
                          file.status === 'success' ? 'text-green-500' : 
                          file.status === 'error' ? 'text-red-500' : 
                          file.status === 'processing' ? 'text-blue-500' : 
                          'text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center text-sm">
                            <span className="text-xs font-medium text-gray-500 mr-1">ORIGINAL</span>
                            <span className="text-white truncate">{file.originalName}</span>
                          </div>
                          
                          {file.newName && (
                            <div className="flex items-center text-sm">
                              <span className="text-xs font-medium text-orange-500 mr-1">NEW</span>
                              <span className="text-white truncate">{file.newName}</span>
                            </div>
                          )}
                          
                          {file.status === 'error' && file.errorMessage && (
                            <div className="flex items-center text-xs text-red-500">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {file.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-20 flex items-center justify-center">
                        {file.status === 'processing' ? (
                          <div className="text-xs text-blue-500 animate-pulse">Processing...</div>
                        ) : file.status === 'success' ? (
                          <div className="text-xs text-green-500">Renamed</div>
                        ) : file.status === 'error' ? (
                          <div className="text-xs text-red-500">Failed</div>
                        ) : (
                          <div className="text-xs text-gray-400">Pending</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {processingProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Processing files...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <CustomProgress value={processingProgress} className="h-2" indicatorClassName="bg-orange-500" />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                  onClick={startProcessing}
                  disabled={isProcessing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Start Processing'}
                </Button>
                
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  onClick={applyChanges}
                  disabled={isProcessing || files.filter(f => f.status === 'success').length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
              
              <div className="flex items-start gap-2 text-xs text-gray-400 border-t border-zinc-800 pt-3">
                <Info className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                <p>
                  Files will be renamed according to your template settings.
                  The AI will analyze each file's content to extract meaningful information for naming.
                  You'll have a chance to review all changes before they're applied.
                </p>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-white hover:bg-zinc-800">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkRenameModal;