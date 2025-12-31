import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileType, Download, Trash2, Check, RotateCw, RefreshCw, Edit, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/utils/fileUtils";
import { FileItem, FileStatus } from "@/pages/home";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  staggerContainer, 
  staggerItem, 
  buttonHover, 
  slideInRight, 
  fadeInScale, 
  successState,
  pulse
} from "@/utils/animations";

interface FileListCardProps {
  files: FileItem[];
  onFileNameChange: (id: string, newName: string) => void;
  onRename: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onDeleteCheckedFiles: (selectedFileIds?: string[]) => void;
  onRenameAll: () => void;
}

export default function FileListCard({ 
  files, 
  onFileNameChange, 
  onRename, 
  onDeleteFile,
  onDeleteCheckedFiles,
  onRenameAll
}: FileListCardProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  
  // Add status tracking to files
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const [processedFiles, setProcessedFiles] = useState<Record<string, string>>({});
  
  // Track file extension changes
  const [outputExtensions, setOutputExtensions] = useState<Record<string, string>>({});
  
  // Sync file statuses with the file objects
  useEffect(() => {
    // Initialize statuses for new files
    files.forEach(file => {
      if (file.status && !fileStatuses[file.id]) {
        setFileStatuses(prev => ({...prev, [file.id]: file.status as FileStatus}));
      }
      if (file.processedName && !processedFiles[file.id]) {
        setProcessedFiles(prev => ({...prev, [file.id]: file.processedName as string}));
      }
    });
  }, [files]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(file => file.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleFileSelect = (id: string, checked: boolean) => {
    const newSelectedFiles = new Set(selectedFiles);
    
    if (checked) {
      newSelectedFiles.add(id);
    } else {
      newSelectedFiles.delete(id);
    }
    
    setSelectedFiles(newSelectedFiles);
    setSelectAll(newSelectedFiles.size === files.length);
  };

  const getFileTypeColor = (type: string): string => {
    type = type.toLowerCase();
    
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
      return 'bg-orange-950 text-orange-300 border-orange-800';
    }
    
    if (type.includes('pdf') || type === 'pdf') {
      return 'bg-red-950 text-red-300 border-red-800';
    }
    
    if (['doc', 'docx', 'txt', 'rtf'].includes(type) || type.includes('word')) {
      return 'bg-blue-950 text-blue-300 border-blue-800';
    }
    
    if (['ppt', 'pptx'].includes(type) || type.includes('presentation')) {
      return 'bg-amber-950 text-amber-300 border-amber-800';
    }
    
    if (['xls', 'xlsx', 'csv'].includes(type) || type.includes('sheet')) {
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
    
    return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  const getFileIcon = (type: string) => {
    return <FileType className="h-5 w-5 text-orange-500 mr-2" />;
  };

  if (files.length === 0) {
    return (
      <Card className="col-span-full bg-black border-zinc-800">
        <CardContent className="pt-6">
          <motion.div 
            className="p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto max-w-md">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <FileType className="h-12 w-12 mx-auto text-orange-500" />
              </motion.div>
              <motion.h3 
                className="mt-2 text-sm font-medium text-zinc-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                No files uploaded
              </motion.h3>
              <motion.p 
                className="mt-1 text-sm text-zinc-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Get started by uploading some files first.
              </motion.p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="col-span-full bg-black border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <motion.h2 
              className="text-lg font-semibold text-orange-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Files to Rename
            </motion.h2>
            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => {
                    // First set all files to converting status
                    const newStatuses = {...fileStatuses};
                    const newProcessedFiles = {...processedFiles};
                    
                    // Process files in batches to simulate conversion
                    Promise.all(
                      files.map(async (file) => {
                        // Mark as converting
                        setFileStatuses(prev => ({...prev, [file.id]: "converting"}));
                        
                        // Simulate processing time (staggered)
                        return new Promise(resolve => {
                          setTimeout(() => {
                            // Mark as finished and store processed name
                            setFileStatuses(prev => ({...prev, [file.id]: "finished"}));
                            setProcessedFiles(prev => ({...prev, [file.id]: file.newName}));
                            resolve(file.id);
                          }, 1000 + Math.random() * 2000); // Random time between 1-3 seconds
                        });
                      })
                    ).then(() => {
                      // All files processed
                      onRenameAll();
                    });
                  }}
                >
                  Rename All
                </Button>
              </motion.div>
              {selectedFiles.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-orange-800 text-orange-400 hover:bg-orange-950/50 hover:text-orange-300"
                    onClick={() => onDeleteCheckedFiles(Array.from(selectedFiles))}
                  >
                    Delete Selected ({selectedFiles.size})
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 table-fixed">
            <thead className="bg-zinc-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider w-[50px]">
                  <Checkbox 
                    checked={selectAll} 
                    onCheckedChange={handleSelectAll}
                    className="border-orange-700 data-[state=checked]:bg-orange-600 data-[state=checked]:text-white"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider w-[30%]">
                  Original Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                  New Name
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-500 uppercase tracking-wider w-[100px]">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-500 uppercase tracking-wider w-[100px]">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-500 uppercase tracking-wider w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-zinc-800">
              <AnimatePresence>
                {files.map((file, index) => {
                  const isChecked = selectedFiles.has(file.id);
                  const fileType = file.type.split('/').pop()?.toUpperCase() || 'FILE';
                  const status = fileStatuses[file.id] || "ready";
                  const processedName = processedFiles[file.id];
                  const outputExtension = outputExtensions[file.id];
                  
                  // Status badge styles and text
                  let statusBadge = null;
                  if (status === "converting") {
                    statusBadge = (
                      <Badge 
                        className="bg-yellow-950 text-yellow-300 border-yellow-800"
                        variant="outline"
                      >
                        CONVERTING
                      </Badge>
                    );
                  } else if (status === "finished") {
                    statusBadge = (
                      <Badge 
                        className="bg-green-950 text-green-300 border-green-800"
                        variant="outline"
                      >
                        FINISHED
                      </Badge>
                    );
                  } else if (status === "ready") {
                    statusBadge = (
                      <Badge 
                        className="bg-blue-950 text-blue-300 border-blue-800"
                        variant="outline"
                      >
                        READY
                      </Badge>
                    );
                  } else if (status === "failed") {
                    statusBadge = (
                      <Badge 
                        className="bg-red-950 text-red-300 border-red-800"
                        variant="outline"
                      >
                        FAILED
                      </Badge>
                    );
                  }
                  
                  // Show appropriate name field
                  const nameField = status === "finished" ? (
                    // For finished files, show the result with original and new name
                    <div className="flex flex-col gap-1">
                      <div className="text-zinc-300">{processedName || file.newName}</div>
                      <div className="text-xs text-zinc-500">Original: {file.original}</div>
                    </div>
                  ) : status === "converting" ? (
                    // For converting files, show the status indicator
                    <div className="flex items-center">
                      <span className="text-zinc-400 italic">Converting...</span>
                      <RotateCw className="ml-2 h-4 w-4 text-orange-500 animate-spin" />
                    </div>
                  ) : (
                    // For ready files, show the editable input
                    <Input 
                      value={file.newName}
                      onChange={(e) => onFileNameChange(file.id, e.target.value)}
                      className="py-2 px-3 text-base bg-zinc-900 border-zinc-700 text-zinc-300 focus:border-orange-600 focus:ring-orange-600 w-full"
                      size={40}
                    />
                  );
                  
                  return (
                    <motion.tr 
                      key={file.id} 
                      className="hover:bg-zinc-900"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <Checkbox 
                            checked={isChecked}
                            onCheckedChange={(checked) => handleFileSelect(file.id, !!checked)}
                            className="border-orange-700 data-[state=checked]:bg-orange-600 data-[state=checked]:text-white"
                          />
                        </motion.div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {getFileIcon(file.type)}
                          </motion.div>
                          <span 
                            className="text-zinc-300 truncate"
                            title={file.original}
                          >
                            {file.original}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {nameField}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <motion.div
                          whileHover={{ y: -2 }}
                          animate={status === "finished" ? { y: [0, -3, 0] } : {}}
                          transition={status === "finished" ? { 
                            duration: 0.5,
                            delay: 0.1,
                            ease: "easeInOut",
                            times: [0, 0.5, 1]
                          } : {}}
                        >
                          {statusBadge}
                        </motion.div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 text-right">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex gap-1 justify-end">
                          {status === "ready" && (
                            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-orange-500 hover:text-orange-400 hover:bg-zinc-900"
                                title="Apply rename"
                                onClick={() => {
                                  // Simulate conversion process
                                  setFileStatuses(prev => ({...prev, [file.id]: "converting"}));
                                  
                                  // After "conversion" is done, mark as finished
                                  setTimeout(() => {
                                    setFileStatuses(prev => ({...prev, [file.id]: "finished"}));
                                    setProcessedFiles(prev => ({...prev, [file.id]: file.newName}));
                                    onRename(file.id);
                                  }, 2000);
                                }}
                              >
                                <Check className="h-5 w-5" />
                              </Button>
                            </motion.div>
                          )}
                          {status === "finished" && (
                            <>
                              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-green-500 hover:text-green-400 hover:bg-zinc-900"
                                  title="Edit Name"
                                  onClick={() => {
                                    // Allow re-editing of renamed files
                                    setFileStatuses(prev => ({...prev, [file.id]: "ready"}));
                                    toast({
                                      title: "Edit Mode",
                                      description: "You can now edit the file name again"
                                    });
                                  }}
                                >
                                  <Edit className="h-5 w-5" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-blue-500 hover:text-blue-400 hover:bg-zinc-900"
                                  title="Download"
                                >
                                  <Download className="h-5 w-5" />
                                </Button>
                              </motion.div>
                            </>
                          )}
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                              title="Delete file"
                              onClick={() => onDeleteFile(file.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <CardFooter className="py-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-500">
          <span>{files.length} files ({formatFileSize(totalSize)} total)</span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-zinc-500 hover:text-orange-400 hover:bg-zinc-800 font-medium inline-flex items-center"
              onClick={() => {
                // Create array of all file IDs
                const allFileIds = files.map(file => file.id);
                // Select all files
                setSelectedFiles(new Set(allFileIds));
                // Call onDeleteCheckedFiles to delete all files
                onDeleteCheckedFiles(allFileIds);
                // Reset statuses and selections
                setFileStatuses({});
                setProcessedFiles({});
                setSelectedFiles(new Set());
                setSelectAll(false);
                
                toast({
                  title: "All files removed",
                  description: "The file list has been cleared"
                });
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}