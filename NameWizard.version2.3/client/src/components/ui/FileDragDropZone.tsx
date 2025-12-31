import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone, Accept, FileRejection, FileError } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, File as FileIcon, Image as ImageIcon, FileText, FilePlus, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface FileDragDropZoneProps {
  // Basic props
  onFilesSelected: (files: File[]) => void;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  multiple?: boolean;
  
  // Customization props
  title?: string;
  description?: string;
  dropzoneText?: string;
  
  // Optional callbacks
  onError?: (message: string) => void;
  onClear?: () => void;
  
  // File validation
  fileValidator?: (file: File) => { valid: boolean; message?: string } | undefined;
}

export function FileDragDropZone({
  onFilesSelected,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  },
  maxFiles = 50,
  maxSize = 50 * 1024 * 1024, // 50 MB default
  disabled = false,
  multiple = true,
  title = 'Upload Files',
  description = 'Drag and drop files here or click to browse',
  dropzoneText = 'Drop files here',
  onError,
  onClear,
  fileValidator,
}: FileDragDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<{ file: File; errors: any[] }[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Check if adding these files would exceed maxFiles
      if (files.length + acceptedFiles.length > maxFiles) {
        const message = `Cannot add more than ${maxFiles} files`;
        setErrorMessage(message);
        onError?.(message);
        return;
      }

      // Perform custom validation if provided
      const invalidFiles: { file: File; errors: any[] }[] = [];
      if (fileValidator) {
        acceptedFiles.forEach(file => {
          const result = fileValidator(file);
          if (result && !result.valid) {
            invalidFiles.push({
              file,
              errors: [{ code: 'custom-validation', message: result.message || 'Invalid file' }]
            });
          }
        });
      }

      const validFiles = fileValidator
        ? acceptedFiles.filter(file => !invalidFiles.some(invalid => invalid.file === file))
        : acceptedFiles;

      // Update files state
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      
      // Update rejected files
      setRejectedFiles(prevRejected => [
        ...prevRejected,
        ...fileRejections.map(rejection => ({
          file: rejection.file,
          errors: rejection.errors
        })),
        ...invalidFiles
      ]);

      // Clear error after 3 seconds
      if (errorMessage) {
        setTimeout(() => setErrorMessage(null), 3000);
      }
    },
    [files.length, maxFiles, fileValidator, errorMessage, onError]
  );

  // Notify parent component when files change
  useEffect(() => {
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [files, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple,
    noClick: true,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
  });

  const clearFiles = useCallback(() => {
    setFiles([]);
    setRejectedFiles([]);
    onClear?.();
  }, [onClear]);

  // Get a unique list of file types for display
  const uniqueFileTypes = new Set(files.map(file => file.type.split('/')[0]));

  // Helper function to get file icon based on MIME type
  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'application':
        return <FileText className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card
        {...getRootProps()}
        className={`p-4 border-dashed relative overflow-hidden ${
          isDraggingOver || isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        
        <div 
          className={`absolute inset-0 bg-primary/10 flex items-center justify-center font-medium transition-opacity ${
            isDraggingOver ? 'opacity-100 z-10' : 'opacity-0 -z-10'
          }`}
        >
          {dropzoneText}
        </div>
        
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>
          
          {files.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
              {uniqueFileTypes.size > 0 && (
                <span className="flex items-center gap-1">
                  (
                  {Array.from(uniqueFileTypes).map((type, index, arr) => (
                    <React.Fragment key={type}>
                      {type}
                      {index < arr.length - 1 ? ', ' : ''}
                    </React.Fragment>
                  ))}
                  )
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-3 mt-4">
            <Button 
              type="button" 
              onClick={open} 
              disabled={disabled || files.length >= maxFiles}
              variant="secondary"
              size="sm"
            >
              <FilePlus className="h-4 w-4 mr-1.5" />
              Browse Files
            </Button>
            
            {files.length > 0 && (
              <Button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearFiles();
                }} 
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* File list */}
      {files.length > 0 && (
        <Card className="overflow-hidden">
          <ScrollArea className="max-h-[240px]">
            <div className="p-1">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file)}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles(files.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Rejected files */}
      {rejectedFiles.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">The following files couldn't be added:</p>
            <ul className="text-sm list-disc list-inside">
              {rejectedFiles.map((rejected, index) => (
                <li key={index} className="ml-2">
                  <span className="font-medium">{rejected.file.name}</span>
                  <span className="text-xs block ml-5">
                    {rejected.errors.map((error: any) => error.message).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}