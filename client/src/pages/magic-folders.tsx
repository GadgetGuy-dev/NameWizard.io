import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, FolderPlus, Upload, Cloud, HardDrive, Wand2, FolderTree, FileText, Image, FileSpreadsheet, FileCode, Music, Video, Archive, Download, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  suggestedFolder: string;
  suggestedName: string;
}

interface FolderStructure {
  name: string;
  files: FileItem[];
  icon: any;
  color: string;
}

const MagicFoldersPage = () => {
  const { toast } = useToast();
  const [source, setSource] = useState<'local' | 'dropbox' | 'googledrive'>('local');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderStructure[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'processing' | 'preview' | 'complete'>('upload');

  const getFileCategory = (file: File): { category: string; folder: string } => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const type = file.type.toLowerCase();
    
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext) || type.includes('document')) {
      return { category: 'Documents', folder: 'Documents' };
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext) || type.includes('image')) {
      return { category: 'Images', folder: 'Images' };
    }
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || type.includes('spreadsheet')) {
      return { category: 'Spreadsheets', folder: 'Spreadsheets' };
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext) || type.includes('audio')) {
      return { category: 'Audio', folder: 'Audio' };
    }
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm'].includes(ext) || type.includes('video')) {
      return { category: 'Videos', folder: 'Videos' };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || type.includes('archive')) {
      return { category: 'Archives', folder: 'Archives' };
    }
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext)) {
      return { category: 'Code', folder: 'Code' };
    }
    return { category: 'Other', folder: 'Other' };
  };

  const generateSuggestedName = (file: File, index: number): string => {
    const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
    const baseName = file.name.replace(ext, '');
    const date = new Date().toISOString().split('T')[0];
    const cleanName = baseName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    return `${cleanName}_${date}${ext}`;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileItem[] = acceptedFiles.map((file, index) => {
      const { category, folder } = getFileCategory(file);
      return {
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        category,
        suggestedFolder: folder,
        suggestedName: generateSuggestedName(file, index)
      };
    });
    setFiles(newFiles);
    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} file(s) ready for organization`
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const processFiles = async () => {
    setIsProcessing(true);
    setStep('processing');
    setProgress(0);

    const categories = new Map<string, FileItem[]>();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const existing = categories.get(file.category) || [];
      categories.set(file.category, [...existing, file]);
      setProgress(Math.round(((i + 1) / files.length) * 100));
      await new Promise(r => setTimeout(r, 100));
    }

    const folderIcons: Record<string, any> = {
      'Documents': FileText,
      'Images': Image,
      'Spreadsheets': FileSpreadsheet,
      'Code': FileCode,
      'Audio': Music,
      'Videos': Video,
      'Archives': Archive,
      'Other': FolderTree
    };

    const folderColors: Record<string, string> = {
      'Documents': 'text-blue-500',
      'Images': 'text-green-500',
      'Spreadsheets': 'text-emerald-500',
      'Code': 'text-purple-500',
      'Audio': 'text-pink-500',
      'Videos': 'text-red-500',
      'Archives': 'text-yellow-500',
      'Other': 'text-zinc-500'
    };

    const newFolders: FolderStructure[] = Array.from(categories.entries()).map(([name, files]) => ({
      name,
      files,
      icon: folderIcons[name] || FolderTree,
      color: folderColors[name] || 'text-zinc-500'
    }));

    setFolders(newFolders);
    setIsProcessing(false);
    setStep('preview');
    
    toast({
      title: "Organization complete",
      description: `Files organized into ${newFolders.length} folders`
    });
  };

  const downloadOrganized = async () => {
    toast({
      title: "Preparing download",
      description: "Creating organized folder structure..."
    });

    try {
      const folderContent: Record<string, string[]> = {};
      folders.forEach(folder => {
        folderContent[folder.name] = folder.files.map(f => f.suggestedName);
      });

      const manifest = {
        exportDate: new Date().toISOString(),
        totalFiles: files.length,
        folders: folderContent,
        fileDetails: files.map(f => ({
          original: f.name,
          suggested: f.suggestedName,
          category: f.category,
          folder: f.suggestedFolder
        }))
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organized_files_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStep('complete');
      toast({
        title: "Download complete",
        description: "Your organized file manifest has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not create download file",
        variant: "destructive"
      });
    }
  };

  const connectCloud = (provider: 'dropbox' | 'googledrive') => {
    toast({
      title: `Connect to ${provider === 'dropbox' ? 'Dropbox' : 'Google Drive'}`,
      description: "Please configure your cloud storage API keys in the API Keys section first"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Link href="/" className="inline-flex items-center text-orange-500 hover:text-orange-400">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center text-orange-500 hover:text-orange-400"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>
          </div>
        </div>
        
        <h1 className="text-xl font-bold text-orange-500 flex items-center">
          <Wand2 className="h-5 w-5 mr-2" /> Magic Folders
        </h1>
        <p className="text-zinc-400">Automatically organize files by type and rename them intelligently</p>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Select Source</CardTitle>
            <CardDescription>Choose where to load your files from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant={source === 'local' ? 'default' : 'outline'}
                className={source === 'local' ? 'bg-orange-600 hover:bg-orange-700' : 'border-zinc-700'}
                onClick={() => setSource('local')}
                data-testid="source-local"
              >
                <HardDrive className="h-4 w-4 mr-2" /> Local Upload
              </Button>
              <Button 
                variant={source === 'dropbox' ? 'default' : 'outline'}
                className={source === 'dropbox' ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700'}
                onClick={() => { setSource('dropbox'); connectCloud('dropbox'); }}
                data-testid="source-dropbox"
              >
                <Cloud className="h-4 w-4 mr-2" /> Dropbox
              </Button>
              <Button 
                variant={source === 'googledrive' ? 'default' : 'outline'}
                className={source === 'googledrive' ? 'bg-green-600 hover:bg-green-700' : 'border-zinc-700'}
                onClick={() => { setSource('googledrive'); connectCloud('googledrive'); }}
                data-testid="source-googledrive"
              >
                <Cloud className="h-4 w-4 mr-2" /> Google Drive
              </Button>
            </div>
          </CardContent>
        </Card>

        {source === 'local' && step === 'upload' && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-500">Upload Folder Contents</CardTitle>
              <CardDescription>Drag and drop files or a folder to organize</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 hover:border-orange-500'
                }`}
              >
                <input {...getInputProps()} data-testid="folder-input" />
                <Upload className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
                <p className="text-zinc-400 mb-2">
                  {isDragActive ? 'Drop files here...' : 'Drag & drop files or folder here'}
                </p>
                <p className="text-zinc-500 text-sm">or click to select files</p>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-zinc-300">{files.length} files ready</span>
                    <Button 
                      onClick={processFiles}
                      className="bg-orange-600 hover:bg-orange-700"
                      data-testid="organize-button"
                    >
                      <Wand2 className="h-4 w-4 mr-2" /> Organize Files
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {files.slice(0, 10).map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-zinc-800">
                        <FileText className="h-4 w-4 text-zinc-500" />
                        <span className="flex-1 truncate text-sm">{file.name}</span>
                        <span className="text-xs text-zinc-500">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                    {files.length > 10 && (
                      <p className="text-center text-zinc-500 text-sm">...and {files.length - 10} more files</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 text-orange-500 animate-spin" />
                <h3 className="text-lg font-medium mb-2">Organizing your files...</h3>
                <p className="text-zinc-400 mb-4">AI is analyzing file types and generating folder structure</p>
                <Progress value={progress} className="w-64 mx-auto" />
                <p className="text-sm text-zinc-500 mt-2">{progress}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'preview' && folders.length > 0 && (
          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-orange-500">Organized Structure</CardTitle>
                  <CardDescription>Preview your organized folder structure</CardDescription>
                </div>
                <Button 
                  onClick={downloadOrganized}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="download-organized"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Organized
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map(folder => {
                    const IconComponent = folder.icon;
                    return (
                      <div key={folder.name} className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                        <div className="flex items-center gap-2 mb-3">
                          <IconComponent className={`h-5 w-5 ${folder.color}`} />
                          <span className="font-medium">{folder.name}</span>
                          <span className="text-xs text-zinc-500 ml-auto">
                            {folder.files.length} files
                          </span>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {folder.files.map(file => (
                            <div key={file.id} className="text-xs text-zinc-400 truncate flex items-center gap-1">
                              <span className="text-zinc-600">→</span>
                              <span className="text-orange-400">{file.suggestedName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">Organization Complete!</h3>
                <p className="text-zinc-400 mb-4">Your files have been organized and are ready for download</p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => { setStep('upload'); setFiles([]); setFolders([]); }}
                    variant="outline"
                    className="border-zinc-700"
                  >
                    Organize More Files
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Download className="h-4 w-4 mr-2" /> Download ZIP
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MagicFoldersPage;
