import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trash2, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music,
  Archive,
  Code,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export interface ProcessingFile {
  id: string;
  name: string;
  originalName: string;
  newName?: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  selected: boolean;
  lastModified: number;
}

interface FileListProps {
  files: ProcessingFile[];
  onDeleteFile: (id: string) => void;
  onDeleteSelected: () => void;
  onSelectFile: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDownloadAll: () => void;
  onDownloadFile: (id: string) => void;
}

export function FileList({
  files,
  onDeleteFile,
  onDeleteSelected,
  onSelectFile,
  onSelectAll,
  onDownloadAll,
  onDownloadFile
}: FileListProps) {
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'status' | 'progress'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="h-4 w-4" />;
    if (type.includes('code') || type.includes('javascript') || type.includes('python')) return <Code className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-gray-600 text-gray-200',
      'processing': 'bg-orange-600 text-white',
      'completed': 'bg-green-600 text-white',
      'error': 'bg-red-600 text-white'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedCount = files.filter(f => f.selected).length;
  const allSelected = files.length > 0 && selectedCount === files.length;

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (files.length === 0) return null;

  return (
    <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold text-lg">
              Queued Files ({files.length})
            </h3>
            <div className="text-sm text-gray-400">
              {selectedCount > 0 && `${selectedCount} selected`}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDeleteSelected}
                className="border-red-600 text-red-400 hover:bg-red-600/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedCount})
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={onDownloadAll}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
          <div className="col-span-1 flex items-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
              className="border-gray-600"
            />
          </div>
          <div className="col-span-4">Original Name</div>
          <div className="col-span-2">New Name</div>
          <div className="col-span-1 text-center">Size</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Progress</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
      </div>

      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedFiles.map((file) => (
          <div key={file.id} className="px-6 py-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <Checkbox
                  checked={file.selected}
                  onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                  className="border-gray-600"
                />
              </div>

              {/* Original Name */}
              <div className="col-span-4">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {file.originalName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(file.lastModified)}
                    </div>
                  </div>
                </div>
              </div>

              {/* New Name */}
              <div className="col-span-2">
                <div className="text-sm text-gray-300 truncate">
                  {file.newName || (file.status === 'completed' ? 'Ready' : 'Processing...')}
                </div>
              </div>

              {/* Size */}
              <div className="col-span-1 text-center">
                <div className="text-sm text-gray-300">
                  {formatFileSize(file.size)}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(file.status)}
                  <Badge className={`text-xs ${getStatusBadge(file.status)}`}>
                    {file.status}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={file.progress} 
                    className="flex-1 h-2 bg-gray-700"
                  />
                  <span className="text-xs text-gray-400 w-10">
                    {file.progress}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 text-center">
                <div className="flex items-center justify-center space-x-1">
                  {file.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadFile(file.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 p-1"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteFile(file.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/10 p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Total: {files.length} files ({formatFileSize(files.reduce((total, file) => total + file.size, 0))})
          </div>
          <div className="flex items-center space-x-4">
            <span>
              Completed: {files.filter(f => f.status === 'completed').length}
            </span>
            <span>
              Processing: {files.filter(f => f.status === 'processing').length}
            </span>
            <span>
              Errors: {files.filter(f => f.status === 'error').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}