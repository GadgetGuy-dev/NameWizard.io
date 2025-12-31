import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, BrainIcon } from '@/components/icons';
import { 
  Info, 
  ArrowRight, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  Play,
  File,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  DownloadCloud,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CustomProgress } from '@/components/ui/custom-progress';
import { formatModelName } from '@/utils/modelUtils';


interface UploadFileCardProps {
  onFilesSelected: (files: File[]) => void;
}

interface FileItem {
  id: string;
  file: File;
  originalName: string;
  newName: string | null;
  status: 'pending' | 'processing' | 'renamed' | 'error';
  errorMessage?: string;
  aiModel?: string; // Track which AI model was used for processing
}

// Helper function to get file extension from filename
const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1) : '';
};

// Helper function to get file name without extension
const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
};

// Helper function to get file icon based on extension
const getFileIcon = (filename: string) => {
  const extension = getFileExtension(filename).toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-400" />;
    case 'doc':
    case 'docx':
    case 'odt':
      return <FileText className="h-4 w-4 text-blue-400" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="h-4 w-4 text-green-400" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <ImageIcon className="h-4 w-4 text-purple-400" />;
    default:
      return <File className="h-4 w-4 text-gray-400" />;
  }
};

// We're using the imported formatModelName function from utils/modelUtils.ts

const UploadFileCard: React.FC<UploadFileCardProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [step, setStep] = useState<'upload' | 'review' | 'processing' | 'results'>('upload');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const addFiles = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      originalName: file.name,
      newName: null,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...fileItems]);
    
    if (step === 'upload' && fileItems.length > 0) {
      setStep('review');
    }
    
    toast({
      title: "Files uploaded",
      description: `${newFiles.length} files ready for processing`,
    });
    
    // Also call the parent component's handler
    onFilesSelected(newFiles);
  };
  
  const handleClearFiles = () => {
    setFiles([]);
    setStep('upload');
    setProcessingProgress(0);
  };
  
  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    
    if (files.length <= 1) {
      setStep('upload');
    }
    
    toast({
      title: "File removed",
      description: "File has been removed from the queue",
    });
  };
  
  const handleRedoFile = async (id: string) => {
    // Find file and its index
    const fileIndex = files.findIndex(file => file.id === id);
    if (fileIndex === -1) return;
    
    // Mark as processing
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, status: 'processing', newName: null, errorMessage: undefined } 
        : file
    ));
    
    toast({
      title: "Reprocessing file",
      description: "Generating new name with AI...",
    });
    
    try {
      // Get the current file
      const file = files[fileIndex];
      
      // Try to get AI suggestions first
      const aiSuggestedName = await getAINameSuggestions(file);
      
      // Use AI suggestion if available, otherwise fall back to local naming
      const newName = aiSuggestedName || generateSmartName(file, fileIndex);
      
      // Update with success
      setFiles(prev => prev.map(file => 
        file.id === id 
          ? { ...file, status: 'renamed', newName, errorMessage: undefined } 
          : file
      ));
      
      toast({
        title: "File renamed",
        description: aiSuggestedName 
          ? "AI-generated name applied successfully" 
          : "New name generated successfully",
      });
    } catch (error) {
      console.error("Error reprocessing file:", error);
      
      // Update with error
      setFiles(prev => prev.map(file => 
        file.id === id 
          ? { ...file, status: 'error', newName: null, errorMessage: 'Failed to generate new name' } 
          : file
      ));
      
      toast({
        title: "Error",
        description: "Failed to rename file",
        variant: "destructive"
      });
    }
  };
  
  // Generate a descriptive name based on file type
  const generateSmartName = (file: FileItem, index: number): string => {
    const originalName = file.originalName;
    const extension = getFileExtension(originalName);
    const baseName = getFileNameWithoutExtension(originalName);
    const formattedDate = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    
    // Use the original filename as part of the new name to maintain context
    // The goal is to ensure we don't completely lose the original filename information
    
    // Clean up the base name - keep only alphanumeric chars, spaces, and underscores
    const cleanBaseName = baseName
      .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
      .trim()
      .substring(0, 30) // Limit length
      .replace(/\s+/g, '_'); // Replace spaces with underscores
    
    // Different naming patterns based on file type, but preserve original name elements
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension.toLowerCase())) {
      // For images - keep original name but add metadata
      return `${cleanBaseName}_image_${formattedDate}.${extension}`;
    } 
    else if (['pdf'].includes(extension.toLowerCase())) {
      // For PDFs
      return `${cleanBaseName}_doc_${formattedDate}.${extension}`;
    }
    else if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(extension.toLowerCase())) {
      // For text documents
      return `${cleanBaseName}_text_${formattedDate}.${extension}`;
    }
    else if (['ppt', 'pptx'].includes(extension.toLowerCase())) {
      // For presentations
      return `${cleanBaseName}_pres_${formattedDate}.${extension}`;
    }
    else if (['xls', 'xlsx', 'csv'].includes(extension.toLowerCase())) {
      // For spreadsheets
      return `${cleanBaseName}_data_${formattedDate}.${extension}`;
    }
    else if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension.toLowerCase())) {
      // For audio files
      return `${cleanBaseName}_audio_${formattedDate}.${extension}`;
    }
    else if (['mp4', 'mov', 'wmv', 'avi', 'mkv', 'webm'].includes(extension.toLowerCase())) {
      // For video files
      return `${cleanBaseName}_video_${formattedDate}.${extension}`;
    }
    else {
      // Default for other file types - preserve original name with timestamp
      return `${cleanBaseName}_${formattedDate}.${extension}`;
    }
  };

  // Call the OpenAI API to generate name suggestions
  const getAINameSuggestions = async (file: FileItem): Promise<string | null> => {
    try {
      // Create a file reader to extract content (especially helpful for text files)
      const getFileContent = async (file: File): Promise<string | null> => {
        // For text-based files, read a preview of the content
        if (file.type.includes('text') || 
            file.type.includes('json') || 
            file.type.includes('javascript') || 
            file.type.includes('html') || 
            file.type.includes('css')) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              // Return just the first portion of the file for API efficiency
              resolve(result ? result.slice(0, 1000) : null);
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
          });
        }
        return null;
      };

      // Get file content for text files, for other file types we need to get content as well
      let content = await getFileContent(file.file);
      let imageContent = null;
      
      // For images, get base64 encoded content for analysis
      if (file.file.type.startsWith('image/')) {
        imageContent = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // We only need the base64 data part (remove the data URL prefix)
            const base64Data = result.split(',')[1] || result;
            resolve(base64Data);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file.file);
        });
      }
      
      // Request AI naming suggestions
      const response = await fetch('/api/ai/name-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.originalName,
          fileType: file.file.type || getFileExtension(file.originalName),
          content: content,
          imageContent: imageContent, // Add image content for more accurate analysis
          metadata: {
            size: file.file.size,
            lastModified: new Date(file.file.lastModified).toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the API provided model information
      if (data.modelUsed) {
        // Store the model information in the file object
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, aiModel: data.modelUsed } : f
        ));
      }
      
      // Return the first suggestion or fall back to our local naming function
      if (data.suggestions && data.suggestions.length > 0) {
        return data.suggestions[0];
      } else {
        // Fallback to local naming
        return null;
      }
    } catch (error) {
      console.error("Error getting AI name suggestions:", error);
      return null;
    }
  };

  const handleStartProcessing = async () => {
    setStep('processing');
    setProcessingProgress(0);
    
    // Update all files to processing status
    setFiles(prevFiles => prevFiles.map(file => ({
      ...file,
      status: 'processing'
    })));
    
    // Process files one by one
    for (let i = 0; i < files.length; i++) {
      setCurrentProcessingIndex(i);
      
      try {
        // Get the current file
        const file = files[i];
        
        // First try to get AI suggestions
        const aiSuggestedName = await getAINameSuggestions(file);
        
        // Use AI suggestion if available, otherwise fall back to local naming
        const newName = aiSuggestedName || generateSmartName(file, i);
        
        // Update the file with the new name
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[i] = {
            ...updatedFiles[i],
            newName: newName,
            status: 'renamed',
            errorMessage: undefined
          };
          return updatedFiles;
        });
      } catch (error) {
        console.error("Error processing file:", error);
        
        // Handle errors
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[i] = {
            ...updatedFiles[i],
            newName: null,
            status: 'error',
            errorMessage: 'Error processing file'
          };
          return updatedFiles;
        });
      }
      
      // Update progress percentage
      setProcessingProgress(Math.round(((i + 1) / files.length) * 100));
    }
    
    // Move to results view
    setStep('results');
    
    const successCount = files.filter(file => file.status === 'renamed').length;
    const errorCount = files.filter(file => file.status === 'error').length;
    
    toast({
      title: "Processing complete",
      description: `${successCount} files renamed successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
    });
  };
  
  // Function to download a single file with its new name
  const handleDownloadFile = (file: FileItem) => {
    if (!file.newName) {
      toast({
        title: "Download failed",
        description: "This file doesn't have a new name yet.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a temporary URL for the file
      const url = URL.createObjectURL(file.file);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = file.newName; // Use the new name for the downloaded file
      
      // Append to the document, click, and remove
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download started",
        description: `Downloading "${file.newName}"`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to download all successfully renamed files
  const handleDownloadAll = () => {
    const renamedFiles = files.filter(file => file.status === 'renamed' && file.newName);
    
    if (renamedFiles.length === 0) {
      toast({
        title: "No files to download",
        description: "There are no successfully renamed files to download.",
        variant: "destructive"
      });
      return;
    }
    
    // For each successfully renamed file, trigger a download
    renamedFiles.forEach((file, index) => {
      // Add a small delay between downloads to avoid overwhelming the browser
      setTimeout(() => {
        handleDownloadFile(file);
      }, index * 300); // 300ms delay between downloads
    });
    
    toast({
      title: "Batch download started",
      description: `Downloading ${renamedFiles.length} files with their new names`,
    });
  };

  const handleApplyChanges = async () => {
    const successCount = files.filter(file => file.status === 'renamed').length;
    
    // In a real app, this would call an API to apply changes to the filesystem
    // Let's simulate an API call to rename files on the local drive
    try {
      setProcessingProgress(0);
      
      // Show loading state
      toast({
        title: "Applying changes...",
        description: "Renaming files on your device"
      });
      
      // Simulate API call with progress
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast({
        title: "Changes applied successfully",
        description: `${successCount} files have been renamed on your local drive`,
      });
      
      // In a real app, we would return the results from the API
      // For demo purposes, we'll just go back to the upload state
      setFiles([]);
      setStep('upload');
      
    } catch (error) {
      toast({
        title: "Error applying changes",
        description: "Failed to rename files on your device. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const renderUploadArea = () => (
    <div 
      className={`
        border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer
        ${isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-300/20 hover:border-orange-500/70 hover:bg-white/5'}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleSelectFilesClick}
    >
      <p className="text-white font-medium text-center mb-4">Drop up files here to auto-rename or click to select</p>
      
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        <span className="bg-teal-500/10 text-teal-300 px-2 py-1 rounded-full text-xs">.pdf</span>
        <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full text-xs">.doc</span>
        <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full text-xs">.docx</span>
        <span className="bg-orange-500/10 text-orange-300 px-2 py-1 rounded-full text-xs">.odt</span>
        <span className="bg-violet-500/10 text-violet-300 px-2 py-1 rounded-full text-xs">.ttf</span>
        <span className="bg-gray-500/10 text-gray-300 px-2 py-1 rounded-full text-xs">.txt</span>
        <span className="bg-green-500/10 text-green-300 px-2 py-1 rounded-full text-xs">.jpg</span>
        <span className="bg-green-500/10 text-green-300 px-2 py-1 rounded-full text-xs">.jpeg</span>
        <span className="bg-green-500/10 text-green-300 px-2 py-1 rounded-full text-xs">.png</span>
        <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded-full text-xs">.pptx</span>
        <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded-full text-xs">.ppt</span>
      </div>
      
      <p className="text-zinc-400 text-sm text-center">
        Maximum file size is 10MB
      </p>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple
      />
    </div>
  );
  
  const renderFileList = () => (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="text-white font-medium">
          Drop files
        </div>
        <div className="text-blue-400 text-sm">
          {files.length} supported files loaded
        </div>
      </div>

      <div className="mb-4">
        <div 
          className="border-2 border-dashed border-zinc-300/20 rounded-lg p-4 text-center text-gray-400 mb-4 cursor-pointer hover:border-orange-500/70 transition-colors"
          onClick={handleSelectFilesClick}
        >
          Drag & Drop
        </div>
        
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex justify-between items-center bg-zinc-900/40 p-2 rounded-lg"
            >
              <div className="flex items-center">
                <div className="text-xs font-medium text-gray-300 mr-2">
                  {getFileIcon(file.originalName)}
                </div>
                <div className="text-sm text-white truncate max-w-xs">
                  {file.originalName}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                onClick={() => handleDeleteFile(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400"
          onClick={handleClearFiles}
        >
          Clear
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleStartProcessing}
        >
          Next
        </Button>
      </div>
    </div>
  );
  
  const renderProcessing = () => (
    <div className="flex flex-col">
      <div className="mb-4">
        <div className="text-white font-medium mb-2">Processing files...</div>
        <CustomProgress 
          value={processingProgress} 
          className="h-2 mb-2" 
          indicatorClassName="bg-blue-500"
        />
        <div className="text-right text-gray-400 text-sm">{processingProgress}%</div>
      </div>
      
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {files.map((file, index) => (
          <div 
            key={file.id} 
            className={`flex justify-between items-center p-2 rounded-lg ${
              index === currentProcessingIndex && file.status === 'processing'
                ? 'bg-blue-900/20 border border-blue-500/30'
                : 'bg-zinc-900/40'
            }`}
          >
            <div className="flex items-center">
              <div className="text-xs font-medium text-gray-300 mr-2">
                {getFileIcon(file.originalName)}
              </div>
              <div className="text-sm text-white truncate max-w-xs">
                {file.originalName}
              </div>
            </div>
            <div className="text-xs">
              {file.status === 'processing' && index === currentProcessingIndex && (
                <div className="text-blue-400 animate-pulse">Processing...</div>
              )}
              {file.status === 'renamed' && (
                <div className="text-green-400">Renamed</div>
              )}
              {file.status === 'error' && (
                <div className="text-red-400">Error</div>
              )}
              {file.status === 'pending' && (
                <div className="text-gray-400">Pending</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderResults = () => (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white font-medium">Renaming Complete</div>
        <div className="text-sm">
          <span className="text-green-400">
            {files.filter(file => file.status === 'renamed').length} renamed
          </span>
          {files.some(file => file.status === 'error') && (
            <span className="text-red-400 ml-2">
              {files.filter(file => file.status === 'error').length} failed
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1 max-h-60 overflow-y-auto mb-4">
        {files.map((file) => (
          <div 
            key={file.id} 
            className={`p-2 rounded-lg ${
              file.status === 'error' 
                ? 'bg-red-900/20 border border-red-500/30' 
                : 'bg-zinc-900/40'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-xs font-medium text-gray-300 mr-2">
                  {getFileIcon(file.originalName)}
                </div>
                <div className="text-sm text-white truncate max-w-xs">
                  {file.originalName}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {file.status === 'renamed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                  onClick={() => handleRedoFile(file.id)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {file.status === 'renamed' && file.newName && (
              <div className="flex flex-col pl-6 mt-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-green-400 truncate max-w-xs flex-grow">
                    → {file.newName}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
                    onClick={() => handleDownloadFile(file)}
                    title="Download file with new name"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 p-0 text-xs text-blue-400 hover:text-blue-500"
                    onClick={() => {
                      // In a production app, this would open an inline edit form or modal
                      // For this demo, we'll use a prompt to edit the name
                      const promptDefault = typeof file.newName === 'string' ? file.newName : '';
                      const newNameInput = prompt("Edit file name:", promptDefault);
                      if (newNameInput && newNameInput.trim() !== "") {
                        const newName = newNameInput.trim();
                        setFiles(prev => prev.map(f => 
                          f.id === file.id ? { ...f, newName } : f
                        ));
                        
                        toast({
                          title: "Name updated",
                          description: "Manual edit applied successfully"
                        });
                      }
                    }}
                  >
                    Edit
                  </Button>
                </div>
                
                {/* Display AI model information */}
                {file.aiModel && (
                  <div className="flex items-center">
                    <span className="text-xs text-zinc-500">
                      <BrainIcon className="h-3 w-3 inline mr-1" />
                      Processed with {formatModelName(file.aiModel)}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {file.status === 'error' && file.errorMessage && (
              <div className="text-sm text-red-400 pl-6 mt-1">
                {file.errorMessage}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Drag & Drop area for more files */}
      <div 
        className="border-2 border-dashed border-zinc-300/20 rounded-lg p-3 text-center text-gray-400 mb-4 cursor-pointer hover:border-orange-500/70 transition-colors"
        onClick={handleSelectFilesClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        Drag & Drop more files
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800"
            onClick={() => setStep('review')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800"
            onClick={handleDownloadAll}
          >
            <DownloadCloud className="h-4 w-4 mr-1" />
            Download All
          </Button>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleApplyChanges}
        >
          Apply Changes
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 relative shadow-lg">
      {step === 'upload' && renderUploadArea()}
      {step === 'review' && renderFileList()}
      {step === 'processing' && renderProcessing()}
      {step === 'results' && renderResults()}
      
      {step === 'upload' && (
        <div className="mt-6 flex justify-center items-center">
          <div className="flex items-center w-full max-w-md justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                <span className="font-semibold">1</span>
              </div>
              <div className="text-xs">
                <div className="text-zinc-400">SELECT</div>
                <div className="text-white">Your document</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                <span className="font-semibold">2</span>
              </div>
              <div className="text-xs">
                <div className="text-zinc-400">PROCCESS</div>
                <div className="text-white">a few seconds</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400">
                <span className="font-semibold">3</span>
              </div>
              <div className="text-xs">
                <div className="text-zinc-400">DOWNLOAD</div>
                <div className="text-white">Perfectly named file</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFileCard;