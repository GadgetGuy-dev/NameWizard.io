import React, { createContext, useContext, useState, useCallback, useReducer } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIModel } from '@/components/ai/ModelSelectionDropdown';

// Define the types for processing state
export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error' | 'cancelled';

export type ProcessingFile = {
  id: string;
  file: File;
  originalName: string;
  newName?: string;
  suggestedNames?: string[];
  status: ProcessingStatus;
  error?: string;
  metadata?: Record<string, any>;
  preview?: string;
  selected?: boolean;
};

export type BatchProcessingState = {
  files: ProcessingFile[];
  allFiles: ProcessingFile[];
  status: ProcessingStatus;
  progress: number;
  activeModelId: string | null;
  error?: string;
  selectedFolder?: string;
  targetFolder?: string;
};

type BatchProcessingAction =
  | { type: 'ADD_FILES'; payload: ProcessingFile[] }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'CLEAR_FILES' }
  | { type: 'SET_STATUS'; payload: ProcessingStatus }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_ACTIVE_MODEL'; payload: string | null }
  | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<ProcessingFile> } }
  | { type: 'UPDATE_FILE_STATUS'; payload: { id: string; status: ProcessingStatus; error?: string } }
  | { type: 'SELECT_FILE'; payload: { id: string; selected: boolean } }
  | { type: 'SELECT_ALL_FILES'; payload: boolean }
  | { type: 'SET_FOLDER'; payload: string }
  | { type: 'SET_TARGET_FOLDER'; payload: string };

type BatchProcessingContextType = {
  state: BatchProcessingState;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFileStatus: (id: string, status: ProcessingStatus, error?: string) => void;
  updateFile: (id: string, updates: Partial<ProcessingFile>) => void;
  updateProgress: (progress: number) => void;
  startProcessing: (modelId: string) => void;
  cancelProcessing: () => void;
  completeProcessing: (success: boolean, error?: string) => void;
  selectFile: (id: string, selected: boolean) => void;
  selectAllFiles: (selected: boolean) => void;
  setFolder: (folder: string) => void;
  setTargetFolder: (folder: string) => void;
  isProcessing: boolean;
  hasFiles: boolean;
  selectedFiles: ProcessingFile[];
  processedCount: number;
  failedCount: number;
};

const initialState: BatchProcessingState = {
  files: [],
  allFiles: [],
  status: 'idle',
  progress: 0,
  activeModelId: null,
};

// Create the context
const BatchProcessingContext = createContext<BatchProcessingContextType | null>(null);

// Reducer function to update state
function batchProcessingReducer(state: BatchProcessingState, action: BatchProcessingAction): BatchProcessingState {
  switch (action.type) {
    case 'ADD_FILES':
      return {
        ...state,
        files: [...state.files, ...action.payload],
        allFiles: [...state.allFiles, ...action.payload],
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.payload),
        allFiles: state.allFiles.filter((file) => file.id !== action.payload),
      };
    case 'CLEAR_FILES':
      return {
        ...state,
        files: [],
        allFiles: [],
        status: 'idle',
        progress: 0,
        error: undefined,
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        // Reset progress if returning to idle
        progress: action.payload === 'idle' ? 0 : state.progress,
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_ACTIVE_MODEL':
      return {
        ...state,
        activeModelId: action.payload,
      };
    case 'UPDATE_FILE': {
      const updatedFiles = state.files.map((file) =>
        file.id === action.payload.id ? { ...file, ...action.payload.updates } : file
      );
      const updatedAllFiles = state.allFiles.map((file) =>
        file.id === action.payload.id ? { ...file, ...action.payload.updates } : file
      );
      return {
        ...state,
        files: updatedFiles,
        allFiles: updatedAllFiles,
      };
    }
    case 'UPDATE_FILE_STATUS': {
      const updatedFiles = state.files.map((file) =>
        file.id === action.payload.id
          ? { ...file, status: action.payload.status, error: action.payload.error }
          : file
      );
      const updatedAllFiles = state.allFiles.map((file) =>
        file.id === action.payload.id
          ? { ...file, status: action.payload.status, error: action.payload.error }
          : file
      );
      return {
        ...state,
        files: updatedFiles,
        allFiles: updatedAllFiles,
      };
    }
    case 'SELECT_FILE': {
      const updatedFiles = state.files.map((file) =>
        file.id === action.payload.id ? { ...file, selected: action.payload.selected } : file
      );
      const updatedAllFiles = state.allFiles.map((file) =>
        file.id === action.payload.id ? { ...file, selected: action.payload.selected } : file
      );
      return {
        ...state,
        files: updatedFiles,
        allFiles: updatedAllFiles,
      };
    }
    case 'SELECT_ALL_FILES': {
      const updatedFiles = state.files.map((file) => ({ ...file, selected: action.payload }));
      const updatedAllFiles = state.allFiles.map((file) => ({ ...file, selected: action.payload }));
      return {
        ...state,
        files: updatedFiles,
        allFiles: updatedAllFiles,
      };
    }
    case 'SET_FOLDER':
      return {
        ...state,
        selectedFolder: action.payload,
        // Only show files in the selected folder
        files: action.payload
          ? state.allFiles.filter((file) => file.metadata?.folder === action.payload)
          : state.allFiles,
      };
    case 'SET_TARGET_FOLDER':
      return {
        ...state,
        targetFolder: action.payload,
      };
    default:
      return state;
  }
}

// Create the provider component
export function BatchProcessingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(batchProcessingReducer, initialState);
  const { toast } = useToast();

  // Generate a unique ID for each file
  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add files to the batch
  const addFiles = useCallback((files: File[]) => {
    const newFiles: ProcessingFile[] = files.map((file) => ({
      id: generateFileId(),
      file,
      originalName: file.name,
      status: 'idle',
      selected: true,
    }));

    dispatch({ type: 'ADD_FILES', payload: newFiles });

    toast({
      title: `${files.length} file(s) added`,
      description: `Ready to process ${files.length} file(s)`,
    });
  }, [toast]);

  // Remove a file from the batch
  const removeFile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FILE', payload: id });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    dispatch({ type: 'CLEAR_FILES' });
    toast({
      title: 'All files cleared',
      description: 'The file list has been cleared',
    });
  }, [toast]);

  // Update a file's status
  const updateFileStatus = useCallback((id: string, status: ProcessingStatus, error?: string) => {
    dispatch({ type: 'UPDATE_FILE_STATUS', payload: { id, status, error } });
  }, []);

  // Update a file with partial data
  const updateFile = useCallback((id: string, updates: Partial<ProcessingFile>) => {
    dispatch({ type: 'UPDATE_FILE', payload: { id, updates } });
  }, []);
  
  // Update overall progress
  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  }, []);

  // Start processing the batch
  const startProcessing = useCallback((modelId: string) => {
    dispatch({ type: 'SET_STATUS', payload: 'processing' });
    dispatch({ type: 'SET_ACTIVE_MODEL', payload: modelId });
    dispatch({ type: 'SET_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_ERROR', payload: undefined });
    toast({
      title: 'Processing started',
      description: `Processing ${state.files.filter(file => file.selected).length} file(s)`,
    });
  }, [state.files, toast]);

  // Cancel processing
  const cancelProcessing = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'cancelled' });
    toast({
      title: 'Processing cancelled',
      description: 'The file processing has been cancelled',
      variant: 'destructive',
    });
  }, [toast]);

  // Complete processing
  const completeProcessing = useCallback((success: boolean, error?: string) => {
    dispatch({ type: 'SET_STATUS', payload: success ? 'success' : 'error' });
    dispatch({ type: 'SET_PROGRESS', payload: 100 });
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
    }

    toast({
      title: success ? 'Processing complete' : 'Processing failed',
      description: success
        ? `Successfully processed ${state.files.filter(f => f.status === 'success').length} file(s)`
        : error || 'An error occurred during processing',
      variant: success ? 'default' : 'destructive',
    });
  }, [state.files, toast]);

  // Select/deselect a file
  const selectFile = useCallback((id: string, selected: boolean) => {
    dispatch({ type: 'SELECT_FILE', payload: { id, selected } });
  }, []);

  // Select/deselect all files
  const selectAllFiles = useCallback((selected: boolean) => {
    dispatch({ type: 'SELECT_ALL_FILES', payload: selected });
  }, []);

  // Set the current folder filter
  const setFolder = useCallback((folder: string) => {
    dispatch({ type: 'SET_FOLDER', payload: folder });
  }, []);

  // Set the target folder for move operations
  const setTargetFolder = useCallback((folder: string) => {
    dispatch({ type: 'SET_TARGET_FOLDER', payload: folder });
  }, []);

  // Calculate derived state
  const isProcessing = state.status === 'processing';
  const hasFiles = state.files.length > 0;
  const selectedFiles = state.files.filter((file) => file.selected);
  const processedCount = state.files.filter((file) => file.status === 'success').length;
  const failedCount = state.files.filter((file) => file.status === 'error').length;

  // Create the context value
  const contextValue: BatchProcessingContextType = {
    state,
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    updateFile,
    updateProgress,
    startProcessing,
    cancelProcessing,
    completeProcessing,
    selectFile,
    selectAllFiles,
    setFolder,
    setTargetFolder,
    isProcessing,
    hasFiles,
    selectedFiles,
    processedCount,
    failedCount,
  };

  return (
    <BatchProcessingContext.Provider value={contextValue}>
      {children}
    </BatchProcessingContext.Provider>
  );
}

// Hook to use the batch processing context
export function useBatchProcessing() {
  const context = useContext(BatchProcessingContext);
  if (!context) {
    throw new Error('useBatchProcessing must be used within a BatchProcessingProvider');
  }
  return context;
}