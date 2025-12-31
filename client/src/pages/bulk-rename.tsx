import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, RefreshCw, Search, Type, Hash, Calendar, ArrowUpDown, Eye, Download, Undo, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface FileItem {
  id: string;
  originalName: string;
  newName: string;
  size: number;
  type: string;
  selected: boolean;
  status: 'pending' | 'preview' | 'renamed' | 'error';
}

const BulkRenamePage = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [numberStart, setNumberStart] = useState(1);
  const [numberPadding, setNumberPadding] = useState(3);
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [caseType, setCaseType] = useState('lowercase');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [activeTab, setActiveTab] = useState('find-replace');
  const [undoStack, setUndoStack] = useState<FileItem[][]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileItem[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      originalName: file.name,
      newName: file.name,
      size: file.size,
      type: file.type || 'unknown',
      selected: true,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Files added",
      description: `${acceptedFiles.length} file(s) added for renaming`
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const saveToUndoStack = () => {
    setUndoStack(prev => [...prev, files.map(f => ({ ...f }))]);
  };

  const applyFindReplace = () => {
    if (!findText) {
      toast({ title: "Enter text to find", variant: "destructive" });
      return;
    }
    saveToUndoStack();
    setFiles(prev => prev.map(file => {
      if (!file.selected) return file;
      const newName = file.originalName.replace(new RegExp(findText, 'g'), replaceText);
      return { ...file, newName, status: 'preview' };
    }));
  };

  const applyNumbering = () => {
    saveToUndoStack();
    let counter = numberStart;
    setFiles(prev => prev.map(file => {
      if (!file.selected) return file;
      const ext = file.originalName.includes('.') ? '.' + file.originalName.split('.').pop() : '';
      const baseName = file.originalName.replace(ext, '');
      const paddedNum = String(counter).padStart(numberPadding, '0');
      counter++;
      return { ...file, newName: `${prefix}${baseName}_${paddedNum}${suffix}${ext}`, status: 'preview' };
    }));
  };

  const applyDateFormat = () => {
    saveToUndoStack();
    const now = new Date();
    const dateStr = dateFormat
      .replace('YYYY', String(now.getFullYear()))
      .replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(now.getDate()).padStart(2, '0'));
    
    setFiles(prev => prev.map(file => {
      if (!file.selected) return file;
      const ext = file.originalName.includes('.') ? '.' + file.originalName.split('.').pop() : '';
      const baseName = file.originalName.replace(ext, '');
      return { ...file, newName: `${prefix}${baseName}_${dateStr}${suffix}${ext}`, status: 'preview' };
    }));
  };

  const applyCaseChange = () => {
    saveToUndoStack();
    setFiles(prev => prev.map(file => {
      if (!file.selected) return file;
      let newName = file.originalName;
      switch (caseType) {
        case 'lowercase':
          newName = file.originalName.toLowerCase();
          break;
        case 'uppercase':
          newName = file.originalName.toUpperCase();
          break;
        case 'titlecase':
          newName = file.originalName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          break;
      }
      return { ...file, newName: `${prefix}${newName}${suffix}`, status: 'preview' };
    }));
  };

  const applyChanges = () => {
    const selectedFiles = files.filter(f => f.selected && f.status === 'preview');
    if (selectedFiles.length === 0) {
      toast({ title: "No files to rename", description: "Preview changes first", variant: "destructive" });
      return;
    }
    
    setFiles(prev => prev.map(file => {
      if (file.selected && file.status === 'preview') {
        return { ...file, status: 'renamed' };
      }
      return file;
    }));
    
    toast({
      title: "Rename complete",
      description: `${selectedFiles.length} file(s) renamed successfully`
    });
  };

  const undoChanges = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setFiles(previousState);
      toast({ title: "Changes undone", description: "Reverted to previous state" });
    } else {
      setFiles(prev => prev.map(file => ({
        ...file,
        newName: file.originalName,
        status: 'pending'
      })));
      toast({ title: "Reset complete", description: "All files reset to original names" });
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setFiles(prev => prev.map(file => ({ ...file, selected: checked })));
  };

  const toggleSelect = (id: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, selected: !file.selected } : file
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    toast({ title: "All files cleared" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasCollision = () => {
    const names = files.filter(f => f.selected).map(f => f.newName);
    return new Set(names).size !== names.length;
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
          <RefreshCw className="h-5 w-5 mr-2" /> Bulk Rename
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-orange-500">Upload Files</CardTitle>
                <CardDescription>Drag and drop files or click to select</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 hover:border-orange-500'
                  }`}
                >
                  <input {...getInputProps()} data-testid="file-input" />
                  <p className="text-zinc-400">
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {files.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-orange-500">Files ({files.length})</CardTitle>
                    <CardDescription>Preview and manage your files</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearAll} className="border-zinc-700">
                      <Trash2 className="h-4 w-4 mr-1" /> Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
                    <Checkbox 
                      checked={files.every(f => f.selected)} 
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                      data-testid="select-all-checkbox"
                    />
                    <span className="text-sm text-zinc-400">Select All</span>
                    {hasCollision() && (
                      <span className="ml-auto text-red-500 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> Duplicate names detected
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {files.map(file => (
                      <div 
                        key={file.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          file.status === 'renamed' ? 'border-green-600 bg-green-900/10' :
                          file.status === 'preview' ? 'border-orange-600 bg-orange-900/10' :
                          file.status === 'error' ? 'border-red-600 bg-red-900/10' :
                          'border-zinc-800 bg-zinc-950'
                        }`}
                        data-testid={`file-row-${file.id}`}
                      >
                        <Checkbox 
                          checked={file.selected} 
                          onCheckedChange={() => toggleSelect(file.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-zinc-400 truncate">{file.originalName}</div>
                          {file.newName !== file.originalName && (
                            <div className="text-sm text-orange-400 truncate flex items-center">
                              <span className="mr-1">→</span> {file.newName}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">{formatFileSize(file.size)}</div>
                        <div className="flex items-center gap-1">
                          {file.status === 'renamed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {file.status === 'preview' && <Eye className="h-4 w-4 text-orange-500" />}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-orange-500">Rename Options</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 gap-1 mb-4">
                    <TabsTrigger value="find-replace" className="text-xs"><Search className="h-3 w-3 mr-1" />Find/Replace</TabsTrigger>
                    <TabsTrigger value="numbering" className="text-xs"><Hash className="h-3 w-3 mr-1" />Numbering</TabsTrigger>
                    <TabsTrigger value="date" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Date</TabsTrigger>
                    <TabsTrigger value="case" className="text-xs"><Type className="h-3 w-3 mr-1" />Case</TabsTrigger>
                  </TabsList>

                  <TabsContent value="find-replace" className="space-y-3">
                    <div>
                      <Label className="text-zinc-300">Find</Label>
                      <Input 
                        value={findText} 
                        onChange={e => setFindText(e.target.value)} 
                        placeholder="Text to find"
                        className="bg-zinc-800 border-zinc-700"
                        data-testid="find-input"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Replace with</Label>
                      <Input 
                        value={replaceText} 
                        onChange={e => setReplaceText(e.target.value)} 
                        placeholder="Replacement text"
                        className="bg-zinc-800 border-zinc-700"
                        data-testid="replace-input"
                      />
                    </div>
                    <Button onClick={applyFindReplace} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                  </TabsContent>

                  <TabsContent value="numbering" className="space-y-3">
                    <div>
                      <Label className="text-zinc-300">Start Number</Label>
                      <Input 
                        type="number" 
                        value={numberStart} 
                        onChange={e => setNumberStart(Number(e.target.value))} 
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Zero Padding</Label>
                      <Input 
                        type="number" 
                        value={numberPadding} 
                        onChange={e => setNumberPadding(Number(e.target.value))} 
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <Button onClick={applyNumbering} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                  </TabsContent>

                  <TabsContent value="date" className="space-y-3">
                    <div>
                      <Label className="text-zinc-300">Date Format</Label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                          <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                          <SelectItem value="YYYYMMDD">YYYYMMDD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={applyDateFormat} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                  </TabsContent>

                  <TabsContent value="case" className="space-y-3">
                    <div>
                      <Label className="text-zinc-300">Case Type</Label>
                      <Select value={caseType} onValueChange={setCaseType}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lowercase">lowercase</SelectItem>
                          <SelectItem value="uppercase">UPPERCASE</SelectItem>
                          <SelectItem value="titlecase">Title Case</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={applyCaseChange} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                  <div>
                    <Label className="text-zinc-300">Prefix</Label>
                    <Input 
                      value={prefix} 
                      onChange={e => setPrefix(e.target.value)} 
                      placeholder="Add prefix"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Suffix</Label>
                    <Input 
                      value={suffix} 
                      onChange={e => setSuffix(e.target.value)} 
                      placeholder="Add suffix"
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                onClick={applyChanges} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!files.some(f => f.status === 'preview')}
                data-testid="apply-button"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Apply Changes
              </Button>
              <Button 
                onClick={undoChanges} 
                variant="outline" 
                className="border-zinc-700"
                data-testid="undo-button"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" className="w-full border-zinc-700" data-testid="download-button">
              <Download className="h-4 w-4 mr-2" /> Download All Renamed
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkRenamePage;
