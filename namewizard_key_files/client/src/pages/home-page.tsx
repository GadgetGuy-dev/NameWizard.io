import React, { useState, useCallback } from 'react';
import { FileDragDropZone, type FileDragDropZoneProps } from '@/components/ui/FileDragDropZone';
import { BatchProcessingProgressCard } from '@/components/ui/BatchProcessingProgressCard';
import { ModelSelectionDropdown, type AIModel, type AIProvider } from '@/components/ai/ModelSelectionDropdown';
import { ModelFallbackIndicator, FallbackState } from '@/components/ai/ModelFallbackIndicator';
import { useBatchProcessing } from '@/context/BatchProcessingContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { fileLogger } from '@/utils/logger';
import { Loader2, Settings, FolderTree, Wand2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  preview?: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  newName?: string;
  suggestedNames?: string[];
  selected?: boolean;
  errorMessage?: string;
}

interface ProcessingOptions {
  useAI: boolean;
  selectedModel: AIModel | null;
  includeMetadata: boolean;
  customPattern: string;
  customRules: string;
  autoOrganizeIntoFolders: boolean;
  preserveOriginalFiles: boolean;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { startProcessing, updateProgress, completeProcessing, cancelProcessing } = useBatchProcessing();
  const { toast } = useToast();
  
  // Files state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  // Available AI models
  const [availableModels] = useState<AIModel[]>([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      isAvailable: true,
      tier: 'premium',
      isMultimodal: true
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      isAvailable: true,
      tier: 'premium',
      isMultimodal: true
    }
  ]);
  
  // Processing options state
  const [options, setOptions] = useState<ProcessingOptions>({
    useAI: true,
    selectedModel: availableModels[0],
    includeMetadata: true,
    customPattern: '[date] [title] [index]',
    customRules: '',
    autoOrganizeIntoFolders: false,
    preserveOriginalFiles: true,
  });
  
  // Model fallback state
  const [modelFallback, setModelFallback] = useState<FallbackState>({
    active: false,
    primaryModel: null,
    currentModel: null,
    triedModels: [],
    remainingModels: [],
    failed: false,
    progressPercentage: 0
  });
  
  // Handle file uploads
  const handleFilesAdded = useCallback((newFiles: any[]) => {
    const fileItems = newFiles.map(file => ({
      id: file.id,
      name: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      preview: file.preview,
      status: 'idle' as const
    }));
    
    setFiles(prev => [...prev, ...fileItems]);
    fileLogger.info(`Added ${newFiles.length} files`);
    
    toast({
      title: `${newFiles.length} file${newFiles.length === 1 ? '' : 's'} added`,
      description: "Use the settings below to configure how files should be renamed."
    });
  }, [toast]);
  
  // Handle file removal
  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setSelectedFileIds(prev => prev.filter(fileId => fileId !== id));
  }, []);
  
  // Handle bulk file selection
  const handleSelectFile = useCallback((id: string, selected: boolean) => {
    if (selected) {
      setSelectedFileIds(prev => [...prev, id]);
    } else {
      setSelectedFileIds(prev => prev.filter(fileId => fileId !== id));
    }
  }, []);
  
  // Simulate file processing with AI
  const simulateProcessing = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "No files to process",
        description: "Please add files first.",
        variant: "destructive"
      });
      return;
    }
    
    // Start batch processing
    startProcessing(files.length);
    
    // Update files to processing state
    setFiles(prev => 
      prev.map(file => ({
        ...file,
        status: 'processing'
      }))
    );
    
    // Simulate model fallback for demonstration
    if (options.useAI) {
      setModelFallback({
        ...modelFallback,
        active: true,
        primaryModel: options.selectedModel,
        currentModel: options.selectedModel,
        progressPercentage: 5
      });
      
      // Simulate model fallback after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // "First model failed"
      setModelFallback(prev => ({
        ...prev,
        currentModel: 'claude_3_5_sonnet',
        triedModels: [options.selectedModel],
        remainingModels: ['gpt_4o_mini', 'gpt_3_5_turbo'],
        progressPercentage: 25
      }));
    }
    
    // Process each file with a delay
    let processed = 0;
    let failed = 0;
    
    for (const file of files) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      try {
        // Generate a "suggested" name
        const suggestionCount = Math.floor(Math.random() * 3) + 1;
        const suggestions: string[] = [];
        
        if (options.useAI) {
          // Different naming patterns based on file type
          if (file.type.includes('image')) {
            for (let i = 0; i < suggestionCount; i++) {
              suggestions.push(`Photo_${new Date().toISOString().slice(0, 10)}_${i+1}.${file.name.split('.').pop()}`);
            }
          } else if (file.type.includes('pdf')) {
            for (let i = 0; i < suggestionCount; i++) {
              suggestions.push(`Document_${new Date().getFullYear()}_${i+1}.${file.name.split('.').pop()}`);
            }
          } else {
            for (let i = 0; i < suggestionCount; i++) {
              suggestions.push(`File_${new Date().toISOString().slice(0, 10)}_${i+1}.${file.name.split('.').pop()}`);
            }
          }
        } else {
          // Use pattern-based naming
          const date = new Date().toISOString().slice(0, 10);
          const title = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
          const extension = file.name.split('.').pop();
          
          suggestions.push(options.customPattern
            .replace('[date]', date)
            .replace('[title]', title)
            .replace('[index]', '1') + '.' + extension);
        }
        
        // Update file with success
        setFiles(prev => 
          prev.map(f => f.id === file.id ? {
            ...f,
            status: 'success',
            suggestedNames: suggestions,
            newName: suggestions[0]
          } : f)
        );
        
        processed++;
      } catch (error) {
        failed++;
        
        // Update file with error
        setFiles(prev => 
          prev.map(f => f.id === file.id ? {
            ...f,
            status: 'error',
            errorMessage: 'Failed to process file'
          } : f)
        );
      }
      
      // Update progress
      updateProgress(processed, failed);
    }
    
    // Complete the batch
    completeProcessing();
    
    // Complete model fallback
    if (options.useAI) {
      setModelFallback(prev => ({
        ...prev,
        active: false,
        progressPercentage: 100
      }));
    }
    
    toast({
      title: "Processing complete",
      description: `${processed} files processed, ${failed} failed`,
      variant: failed > 0 ? "destructive" : "default"
    });
  }, [files, options, modelFallback, startProcessing, updateProgress, completeProcessing, toast]);
  
  // Apply suggested names
  const applyRenaming = useCallback(() => {
    const renamedCount = files.filter(file => 
      file.status === 'success' && 
      file.newName && 
      file.newName !== file.originalName
    ).length;
    
    if (renamedCount === 0) {
      toast({
        title: "No files to rename",
        description: "There are no successfully processed files with new names.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would make API calls to actually rename the files
    // For this demo, we'll just simulate success
    
    toast({
      title: "Files renamed successfully",
      description: `${renamedCount} files have been renamed.`,
    });
    
    // Clear the file list after successful rename
    setFiles([]);
    setSelectedFileIds([]);
  }, [files, toast]);
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NameWizard.io</h1>
          <p className="text-muted-foreground">
            AI-powered file renaming and organization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="text-sm text-right">
              <p className="font-medium">{user.username}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <a href="/auth">Login / Register</a>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* File upload area */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileDragDropZone
                onFilesAdded={handleFilesAdded}
                showFileList={true}
                maxSize={50 * 1024 * 1024} // 50MB
                enablePreviews={true}
              />
            </CardContent>
          </Card>
          
          {/* File processing progress */}
          {files.length > 0 && (
            <BatchProcessingProgressCard
              title="Processing Files"
              description="Analyzing files and generating name suggestions..."
              showCancelButton={true}
              onClose={() => {}}
            />
          )}
          
          {/* Model fallback indicator */}
          {modelFallback.active && (
            <div className="mt-4">
              <ModelFallbackIndicator state={modelFallback} detailed={true} />
            </div>
          )}
          
          {/* File preview and renaming */}
          {files.some(file => file.status === 'success') && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Rename Files</CardTitle>
                  <Button onClick={applyRenaming}>
                    Apply Renaming
                  </Button>
                </div>
                <CardDescription>
                  Review and customize the suggested file names
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map(file => (
                    file.status === 'success' && (
                      <div 
                        key={file.id} 
                        className="border rounded-md p-4 flex items-start gap-4"
                      >
                        {/* File preview/icon */}
                        <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0 border bg-muted flex items-center justify-center">
                          {file.preview ? (
                            <img 
                              src={file.preview} 
                              alt={file.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-muted-foreground">
                              {file.type.includes('image') ? (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 10a1 1 0 100-2 1 1 0 000 2z"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 15l3-3a1 1 0 011.41 0L17 19"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 16l2-2a1 1 0 011.41 0L19 16"/>
                                </svg>
                              ) : file.type.includes('pdf') ? (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 16V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3z"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 13H8"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 17H8"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 9H8"/>
                                </svg>
                              ) : (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 16V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3z"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11V7"/>
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 9h4"/>
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* File details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h4 className="font-medium">Original Name</h4>
                            <p className="text-sm text-muted-foreground break-all">{file.originalName}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              New Name
                              {options.useAI && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">AI Generated</span>}
                            </h4>
                            <Input 
                              value={file.newName || ''}
                              onChange={(e) => {
                                setFiles(prev => 
                                  prev.map(f => f.id === file.id ? {
                                    ...f,
                                    newName: e.target.value
                                  } : f)
                                );
                              }}
                              className="mt-1"
                            />
                          </div>
                          
                          {file.suggestedNames && file.suggestedNames.length > 1 && (
                            <div>
                              <h4 className="font-medium">Other Suggestions</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {file.suggestedNames.slice(1).map((name, idx) => (
                                  <Button 
                                    key={idx} 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setFiles(prev => 
                                        prev.map(f => f.id === file.id ? {
                                          ...f,
                                          newName: name
                                        } : f)
                                      );
                                    }}
                                  >
                                    {name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Settings panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Renaming Settings
              </CardTitle>
              <CardDescription>
                Configure how your files will be renamed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger 
                    value="ai"
                    onClick={() => setOptions(prev => ({ ...prev, useAI: true }))}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Renaming
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pattern"
                    onClick={() => setOptions(prev => ({ ...prev, useAI: false }))}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Pattern Renaming
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <ModelSelectionDropdown
                      selectedModel={options.selectedModel}
                      onModelSelect={(model) => setOptions(prev => ({ ...prev, selectedModel: model }))}
                      availableApiKeys={availableApiKeys}
                    />
                    <p className="text-xs text-muted-foreground">
                      Select the AI model that will analyze your files and suggest names.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include Metadata</Label>
                      <p className="text-xs text-muted-foreground">
                        Use file metadata (creation date, size, etc.) to improve suggestions
                      </p>
                    </div>
                    <Switch
                      checked={options.includeMetadata}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeMetadata: checked }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pattern" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Naming Pattern</Label>
                    <Input
                      value={options.customPattern}
                      onChange={(e) => setOptions(prev => ({ ...prev, customPattern: e.target.value }))}
                      placeholder="[date] [title] [index]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use tags like [date], [title], and [index] to create a naming pattern
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Custom Rules</Label>
                    <Textarea
                      value={options.customRules}
                      onChange={(e) => setOptions(prev => ({ ...prev, customRules: e.target.value }))}
                      placeholder="E.g., Replace spaces with underscores"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add custom rules for more advanced renaming (optional)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Organize into Folders</Label>
                    <p className="text-xs text-muted-foreground">
                      Create folders and organize files based on content
                    </p>
                  </div>
                  <Switch
                    checked={options.autoOrganizeIntoFolders}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, autoOrganizeIntoFolders: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Preserve Original Files</Label>
                    <p className="text-xs text-muted-foreground">
                      Keep original files after renaming
                    </p>
                  </div>
                  <Switch
                    checked={options.preserveOriginalFiles}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveOriginalFiles: checked }))}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                disabled={files.length === 0}
                onClick={simulateProcessing}
              >
                {options.useAI ? 'Generate AI Suggestions' : 'Apply Pattern Renaming'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Folder organization preview */}
          {options.autoOrganizeIntoFolders && files.some(f => f.status === 'success') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  Folder Organization
                </CardTitle>
                <CardDescription>
                  Preview how files will be organized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Documents
                    <span className="text-xs text-muted-foreground ml-auto">3 files</span>
                  </div>
                  
                  <div className="flex items-center gap-2 font-medium">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Images
                    <span className="text-xs text-muted-foreground ml-auto">2 files</span>
                  </div>
                  
                  <div className="flex items-center gap-2 font-medium">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Other
                    <span className="text-xs text-muted-foreground ml-auto">1 file</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Customize Folders
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;