import React, { useState, useRef } from 'react';
import { Upload, ArrowRight, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewUploadFileCardProps {
  onFilesSelected: (files: File[]) => void;
}

const NewUploadFileCard: React.FC<NewUploadFileCardProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const maxFileSize = 10; // Maximum file size in MB

  const acceptedFileTypes = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'ppt', 'pptx', 'txt'
  ];

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
      handleFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (files: File[]) => {
    // Check file sizes
    const validFiles = files.filter(file => {
      const fileSizeInMB = file.size / (1024 * 1024);
      return fileSizeInMB <= maxFileSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "File size exceeded",
        description: `Some files exceed the maximum size of ${maxFileSize}MB`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      toast({
        title: "Files uploaded",
        description: `${validFiles.length} files ready for processing`,
      });
    }
  };

  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-orange-500 mb-4">Upload, organize, and rename your files effortlessly</h2>
      
      <div className="border border-dashed border-zinc-700 rounded-lg p-8 bg-zinc-950 mb-4">
        <div 
          className={`flex flex-col items-center justify-center ${isDragging ? 'border-2 border-dashed border-orange-500 bg-orange-950 bg-opacity-10 rounded-md' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelectFilesClick}
        >
          <p className="text-orange-500 font-medium mb-4 text-center">Drop files here to auto-rename or click to select</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {acceptedFileTypes.map((type, index) => (
              <span 
                key={index} 
                className={`text-xs px-2 py-1 rounded ${type === 'pdf' ? 'bg-red-600' : 
                  type === 'doc' || type === 'docx' ? 'bg-blue-600' : 
                  type === 'xls' || type === 'xlsx' ? 'bg-green-600' : 
                  type === 'jpg' || type === 'jpeg' || type === 'png' ? 'bg-purple-600' : 
                  type === 'ppt' || type === 'pptx' ? 'bg-orange-600' : 'bg-gray-600'} text-white`}
              >
                {type}
              </span>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm">Maximum file size is {maxFileSize}MB</p>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileInputChange}
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="flex items-center justify-between w-full max-w-lg">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2">1</div>
            <span className="text-center text-sm text-gray-400">SELECT</span>
            <span className="text-center text-xs text-gray-500">Your document</span>
          </div>
          
          <ArrowRight className="text-gray-600" />
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white mb-2">2</div>
            <span className="text-center text-sm text-gray-400">PROCESS</span>
            <span className="text-center text-xs text-gray-500">a few seconds</span>
          </div>
          
          <ArrowRight className="text-gray-600" />
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white mb-2">3</div>
            <span className="text-center text-sm text-gray-400">DOWNLOAD</span>
            <span className="text-center text-xs text-gray-500">Perfectly named file</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUploadFileCard;