import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileIcon, ImageIcon, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { dropAreaActive, staggerContainer, staggerItem, slideUp } from "@/utils/animations";

// TypeScript definitions for the File System Access API
interface ShowOpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

interface FileSystemAccessAPI {
  showOpenFilePicker: (options?: ShowOpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
}

// Extend Window interface to include the File System Access API
declare global {
  interface Window {
    showOpenFilePicker?: (options?: ShowOpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  }
}

interface FileWithHandle extends File {
  handle?: FileSystemFileHandle;
}

interface FileUploadCardProps {
  onFilesAdded: (files: FileWithHandle[], fileHandles?: FileSystemFileHandle[]) => void;
}

export default function FileUploadCard({ onFilesAdded }: FileUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<FileWithHandle[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files) as FileWithHandle[];
        setPreviewFiles(files);
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  // Use File System Access API if available
  const openFileDialog = async () => {
    console.log('Opening file dialog...');
    try {
      // Check if the File System Access API is available
      if ('showOpenFilePicker' in window) {
        console.log('File System Access API is available');
        // Use the File System Access API
        try {
          // Assertion to satisfy TypeScript
          const showOpenFilePicker = window.showOpenFilePicker as (options?: ShowOpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
          const fileHandles = await showOpenFilePicker({
            multiple: true,
            types: [
              {
                description: 'All Files',
                accept: {
                  'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
                  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                  'text/*': ['.txt', '.md', '.csv']
                }
              }
            ]
          });
          
          console.log(`Got ${fileHandles.length} file handles`);
          
          // Get the files from the handles
          const filesWithHandles: FileWithHandle[] = await Promise.all(
            fileHandles.map(async (handle: FileSystemFileHandle) => {
              const file = await handle.getFile() as FileWithHandle;
              // Explicitly set the handle property on the file
              file.handle = handle;
              console.log(`Attached handle to file: ${file.name}`);
              return file;
            })
          );
          
          console.log('Files with handles:', filesWithHandles.map(f => ({ 
            name: f.name, 
            hasHandle: !!f.handle,
            handleName: f.handle?.name 
          })));
          
          setPreviewFiles(filesWithHandles);
          onFilesAdded(filesWithHandles, fileHandles);
        } catch (err) {
          // User cancelled the picker or there was an error
          console.warn('File picker was cancelled or errored:', err);
          // Fall back to traditional file input if picker fails
          useTraditionalFileInput();
        }
      } else {
        console.log('File System Access API is not available, using traditional file input');
        // Fall back to the traditional file input
        useTraditionalFileInput();
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      // Fall back to traditional file input
      useTraditionalFileInput();
    }
  };
  
  // Helper to use traditional file input when File System Access API is not available
  const useTraditionalFileInput = () => {
    console.log('Using traditional file input');
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        console.log(`Selected ${target.files.length} files using traditional input`);
        const files = Array.from(target.files) as FileWithHandle[];
        setPreviewFiles(files);
        onFilesAdded(files);
      }
    };
    input.click();
  };

  // Helper function to get appropriate icon for file type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-orange-400" />;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4 text-orange-400" />;
    } else {
      return <FileIcon className="h-4 w-4 text-orange-400" />;
    }
  };

  return (
    <Card className="bg-black border-zinc-800">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 text-orange-500">Upload Files</h2>

        <motion.div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-zinc-900"
          variants={dropAreaActive}
          animate={isDragging ? "active" : "inactive"}
          initial="inactive"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <motion.div 
            className="flex flex-col items-center justify-center space-y-3"
            animate={{ y: isDragging ? -5 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: isDragging ? 1.1 : 1,
                rotate: isDragging ? [0, -10, 10, -10, 0] : 0
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              <UploadCloud className="h-12 w-12 text-orange-500" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Drag files here or click to browse
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Support for images, documents, and other file types
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" className="bg-orange-950/30 text-orange-400 border-orange-800 hover:bg-orange-950/50 hover:text-orange-300">
                Select Files
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="mt-4 text-sm text-zinc-500 flex items-center justify-between">
          <p>Maximum 50 files, 10MB each</p>
        </div>

        <AnimatePresence>
          {previewFiles.length > 0 && (
            <motion.div 
              className="mt-6 border border-zinc-800 rounded-md p-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.h3 
                className="text-sm font-medium text-orange-400 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Files Ready for Processing
              </motion.h3>
              <motion.div 
                className="max-h-32 overflow-y-auto"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {previewFiles.map((file, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center py-1 border-b border-zinc-800 last:border-0"
                    variants={staggerItem}
                    custom={index}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                    transition={{ duration: 0.2 }}
                  >
                    {getFileIcon(file)}
                    <span className="ml-2 text-sm text-zinc-300 truncate max-w-[200px]">{file.name}</span>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + (index * 0.05), type: "spring", stiffness: 500 }}
                    >
                      <Badge className="ml-auto bg-zinc-800 text-xs px-2 py-0.5 text-zinc-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </Badge>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
