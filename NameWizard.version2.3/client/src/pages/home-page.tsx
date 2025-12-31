import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useBatchProcessing } from '@/context/BatchProcessingContext';
import { 
  Upload, 
  FileText, 
  Image, 
  Download, 
  Settings, 
  Camera, 
  FolderOpen,
  Wand2,
  Circle,
  CheckCircle,
  AlertCircle,
  Activity,
  Cloud,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileList, ProcessingFile } from '@/components/FileList';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);
  const [ocrMethod, setOcrMethod] = useState('extract-title');
  const [magicFolderEnabled, setMagicFolderEnabled] = useState(false);
  const [folderPattern, setFolderPattern] = useState('content_owner_date');
  
  // Service status states
  const [serviceStatus, setServiceStatus] = useState({
    aiServices: { active: true, count: 1 },
    renaming: { active: true, count: 0 },
    magicFolders: { active: true, count: 1 },
    templates: { active: true, count: 3 },
    errorDetection: { active: true, count: 0 }
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const convertToProcessingFiles = (files: File[]): ProcessingFile[] => {
    return files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalName: file.name,
      newName: undefined,
      size: file.size,
      type: file.type,
      status: 'pending' as const,
      progress: 0,
      selected: false,
      lastModified: file.lastModified
    }));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const newProcessingFiles = convertToProcessingFiles(files);
    
    setSelectedFiles(prev => [...prev, ...files]);
    setProcessingFiles(prev => [...prev, ...newProcessingFiles]);
    
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready for processing`
    });
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newProcessingFiles = convertToProcessingFiles(files);
    
    setSelectedFiles(prev => [...prev, ...files]);
    setProcessingFiles(prev => [...prev, ...newProcessingFiles]);
    
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready for processing`
    });
  };

  // File list handlers
  const handleDeleteFile = (id: string) => {
    setProcessingFiles(prev => prev.filter(file => file.id !== id));
    const fileIndex = processingFiles.findIndex(f => f.id === id);
    if (fileIndex !== -1) {
      setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndex));
    }
    toast({
      title: "File removed",
      description: "File has been removed from the queue"
    });
  };

  const handleDeleteSelected = () => {
    const selectedIds = processingFiles.filter(f => f.selected).map(f => f.id);
    setProcessingFiles(prev => prev.filter(file => !file.selected));
    setSelectedFiles(prev => prev.filter((_, index) => 
      !processingFiles[index]?.selected
    ));
    toast({
      title: "Files removed",
      description: `${selectedIds.length} files removed from the queue`
    });
  };

  const handleSelectFile = (id: string, selected: boolean) => {
    setProcessingFiles(prev => prev.map(file => 
      file.id === id ? { ...file, selected } : file
    ));
  };

  const handleSelectAll = (selected: boolean) => {
    setProcessingFiles(prev => prev.map(file => ({ ...file, selected })));
  };

  const handleDownloadAll = () => {
    toast({
      title: "Download started",
      description: "Preparing all files for download..."
    });
    // In a real app, this would trigger a zip download
  };

  const handleDownloadFile = (id: string) => {
    const file = processingFiles.find(f => f.id === id);
    if (file) {
      toast({
        title: "Download started",
        description: `Downloading ${file.originalName}...`
      });
      // In a real app, this would trigger the file download
    }
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files to process",
        variant: "destructive"
      });
      return;
    }

    // Update files to processing status
    setProcessingFiles(prev => prev.map(file => ({
      ...file,
      status: 'processing' as const,
      progress: 0
    })));

    setServiceStatus(prev => ({
      ...prev,
      renaming: { active: true, count: selectedFiles.length }
    }));

    // Simulate processing with progress updates
    const processFiles = async () => {
      for (let i = 0; i < processingFiles.length; i++) {
        const file = processingFiles[i];
        
        // Simulate processing time
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setProcessingFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }
        
        // Complete the file
        setProcessingFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'completed' as const, 
            progress: 100,
            newName: `renamed_${f.originalName}`
          } : f
        ));
      }
    };

    try {
      await processFiles();
      
      toast({
        title: "Processing complete",
        description: "All files have been processed successfully"
      });

      setServiceStatus(prev => ({
        ...prev,
        renaming: { active: true, count: 0 }
      }));
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred while processing files",
        variant: "destructive"
      });
    }
  };

  // Cloud storage source state
  const [fileSource, setFileSource] = useState<'local' | 'dropbox' | 'googledrive'>('local');

  const handleScreenshot = async () => {
    try {
      // Check if the browser supports screen capture
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast({
          title: "Screenshot not supported",
          description: "Your browser doesn't support screen capture. Please use Chrome, Edge, or Firefox.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Select screen region",
        description: "A dialog will open to select what to capture"
      });

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `screenshot_${Date.now()}.png`, { type: 'image/png' });
          const newProcessingFile = convertToProcessingFiles([file])[0];
          
          setSelectedFiles(prev => [...prev, file]);
          setProcessingFiles(prev => [...prev, newProcessingFile]);

          toast({
            title: "Screenshot captured",
            description: "Image added to processing queue for OCR"
          });
        }
      }, 'image/png');

    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Permission denied",
          description: "Screen capture was cancelled or denied"
        });
      } else {
        toast({
          title: "Screenshot failed",
          description: error.message || "Could not capture screenshot",
          variant: "destructive"
        });
      }
    }
  };

  const handleOCRProcess = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files to process",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('ocrMethod', ocrMethod);
      formData.append('llmProvider', 'openai');

      const response = await fetch('/api/batch-process', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Processing completed",
          description: `Successfully processed ${data.summary.successful} of ${data.summary.total} files`
        });

        // Update service status
        setServiceStatus(prev => ({
          ...prev,
          renaming: { active: true, count: 0 }
        }));

        // Here you could update a state to show the results
        console.log('Processing results:', data.results);
      } else {
        throw new Error(data.message || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: error.message || "An error occurred during processing",
        variant: "destructive"
      });

      setServiceStatus(prev => ({
        ...prev,
        renaming: { active: true, count: 0 }
      }));
    }
  };

  const fileTypeIcons = [
    { type: 'pdf', color: 'bg-red-500', label: 'PDF' },
    { type: 'doc', color: 'bg-blue-500', label: 'DOC' },
    { type: 'docx', color: 'bg-blue-600', label: 'DOCX' },
    { type: 'xls', color: 'bg-green-500', label: 'XLS' },
    { type: 'txt', color: 'bg-gray-500', label: 'TXT' },
    { type: 'md', color: 'bg-purple-500', label: 'MD' },
    { type: 'csv', color: 'bg-emerald-500', label: 'CSV' },
    { type: 'png', color: 'bg-pink-500', label: 'PNG' },
    { type: 'jpg', color: 'bg-orange-500', label: 'JPG' },
    { type: 'ppt', color: 'bg-red-600', label: 'PPT' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Main heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-orange-400 mb-2">
            Upload, organize, and rename your files effortlessly
          </h2>
        </div>

        {/* File Source Selector */}
        <div className="flex justify-center gap-3 mb-4">
          <Button 
            variant={fileSource === 'local' ? 'default' : 'outline'}
            onClick={() => setFileSource('local')}
            className={fileSource === 'local' ? 'bg-orange-600 hover:bg-orange-700' : 'border-gray-600'}
            data-testid="source-local"
          >
            <HardDrive className="h-4 w-4 mr-2" /> Local Upload
          </Button>
          <Button 
            variant={fileSource === 'dropbox' ? 'default' : 'outline'}
            onClick={() => {
              setFileSource('dropbox');
              toast({ title: "Dropbox", description: "Configure Dropbox in API Keys settings" });
            }}
            className={fileSource === 'dropbox' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600'}
            data-testid="source-dropbox"
          >
            <Cloud className="h-4 w-4 mr-2" /> Dropbox
          </Button>
          <Button 
            variant={fileSource === 'googledrive' ? 'default' : 'outline'}
            onClick={() => {
              setFileSource('googledrive');
              toast({ title: "Google Drive", description: "Configure Google Drive in API Keys settings" });
            }}
            className={fileSource === 'googledrive' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-600'}
            data-testid="source-gdrive"
          >
            <Cloud className="h-4 w-4 mr-2" /> Google Drive
          </Button>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            className={cn(
              "border-2 border-dashed border-gray-600 rounded-lg p-12 text-center transition-colors",
              isDragOver && "border-orange-500 bg-orange-500/10"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-orange-400 mb-2">
              {fileSource === 'local' 
                ? 'Drop files here to auto-rename or click to select' 
                : `Select files from ${fileSource === 'dropbox' ? 'Dropbox' : 'Google Drive'}`}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {fileSource === 'local' ? 'Maximum file size is 10MB' : 'Connect your cloud storage in settings'}
            </p>
            
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <Button asChild variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
              <label htmlFor="file-input" className="cursor-pointer">
                {fileSource === 'local' ? 'Select Files' : 'Browse Cloud'}
              </label>
            </Button>
          </div>

          {/* File type badges */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {fileTypeIcons.map((icon) => (
              <Badge
                key={icon.type}
                className={cn(icon.color, "text-white text-xs px-2 py-1")}
              >
                {icon.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* File List Component */}
        <FileList
          files={processingFiles}
          onDeleteFile={handleDeleteFile}
          onDeleteSelected={handleDeleteSelected}
          onSelectFile={handleSelectFile}
          onSelectAll={handleSelectAll}
          onDownloadAll={handleDownloadAll}
          onDownloadFile={handleDownloadFile}
        />

        {/* Process Flow Icons */}
        <div className="flex justify-center items-center space-x-12 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-400">SELECT</span>
            <span className="text-xs text-gray-400">Your document</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-purple-400">PROCESS</span>
            <span className="text-xs text-gray-400">a few seconds</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <Download className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-400">DOWNLOAD</span>
            <span className="text-xs text-gray-400">Perfectly named file</span>
          </div>
        </div>

        {/* OCR Processing Section */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              OCR Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-2 block">OCR Renaming Options</Label>
                <Select value={ocrMethod} onValueChange={setOcrMethod}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Extract Document Title" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="extract-title">Extract Document Title</SelectItem>
                    <SelectItem value="extract-content">Extract Content Summary</SelectItem>
                    <SelectItem value="extract-metadata">Extract Metadata</SelectItem>
                    <SelectItem value="smart-naming">Smart AI Naming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleScreenshot}
                  data-testid="screenshot-button"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  SCREENSHOT
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    document.getElementById('file-input')?.click();
                  }}
                  data-testid="select-file-button"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  SELECT FILE
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Magic Folders Section */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center">
              <Wand2 className="h-5 w-5 mr-2" />
              Magic Folders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">Magic folder</span>
                <span className="text-gray-400 text-sm">Automatically organize your files in background mode</span>
              </div>
              
              <div className="flex items-center justify-between">
                <Select value={folderPattern} onValueChange={setFolderPattern}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="content_owner_date">content_owner_date</SelectItem>
                    <SelectItem value="date_content_type">date_content_type</SelectItem>
                    <SelectItem value="project_date_version">project_date_version</SelectItem>
                    <SelectItem value="custom_pattern">Custom Pattern</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setMagicFolderEnabled(!magicFolderEnabled);
                    toast({
                      title: magicFolderEnabled ? "Magic Folder disabled" : "Magic Folder enabled",
                      description: magicFolderEnabled ? "Auto-organization turned off" : `Auto-organizing with ${folderPattern} pattern`
                    });
                  }}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {magicFolderEnabled ? 'Disable Magic Folder' : 'Pick folder'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleProcess}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
          >
            Start Processing
          </Button>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Circle className={cn("h-3 w-3", serviceStatus.aiServices.active ? "text-green-500 fill-current" : "text-gray-500")} />
                <span className="text-gray-300">Active</span>
                <span className="text-blue-400">AI Services</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {serviceStatus.aiServices.count}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Circle className={cn("h-3 w-3", serviceStatus.renaming.active ? "text-green-500 fill-current" : "text-gray-500")} />
                <span className="text-gray-300">Active</span>
                <span className="text-blue-400">Renaming</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {serviceStatus.renaming.count}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Circle className={cn("h-3 w-3", serviceStatus.magicFolders.active ? "text-green-500 fill-current" : "text-gray-500")} />
                <span className="text-gray-300">Active</span>
                <span className="text-blue-400">Magic Folders</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {serviceStatus.magicFolders.count}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Circle className={cn("h-3 w-3", serviceStatus.templates.active ? "text-green-500 fill-current" : "text-gray-500")} />
                <span className="text-gray-300">Active</span>
                <span className="text-blue-400">Templates</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {serviceStatus.templates.count}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Circle className={cn("h-3 w-3", serviceStatus.errorDetection.active ? "text-green-500 fill-current" : "text-gray-500")} />
                <span className="text-gray-300">Active</span>
                <span className="text-blue-400">Error Detection</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {serviceStatus.errorDetection.count}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-400">NameWizard.io v1.0</span>
              <span className="text-xs text-gray-500">Edit with Lovable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;