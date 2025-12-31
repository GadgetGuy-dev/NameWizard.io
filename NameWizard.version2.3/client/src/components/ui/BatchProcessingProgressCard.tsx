import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BatchProcessingProgressCardProps {
  title?: string;
  showCancelButton?: boolean;
  onClose?: () => void;
  description?: string;
  progress?: number;
  totalItems?: number;
  processedItems?: number;
  failedItems?: number;
  status?: 'idle' | 'processing' | 'completed' | 'error' | 'cancelled';
  error?: string;
  isIndeterminate?: boolean;
}

export function BatchProcessingProgressCard({
  title = 'Processing Files',
  showCancelButton = true,
  onClose,
  description = 'Please wait while your files are being processed...',
  progress = 0,
  totalItems = 0,
  processedItems = 0,
  failedItems = 0,
  status = 'idle',
  error,
  isIndeterminate = false,
}: BatchProcessingProgressCardProps) {
  
  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Ready
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-primary/20 text-primary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-destructive/20 text-destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-orange-500/20 text-orange-600">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {getStatusDisplay()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {/* Progress bar */}
        {status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>
                {isIndeterminate 
                  ? 'Processing...' 
                  : `${processedItems} of ${totalItems} files processed`}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={isIndeterminate ? undefined : progress} 
              className={isIndeterminate ? "animate-pulse" : ""} 
            />
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm">
            {error}
          </div>
        )}
        
        {/* Stats */}
        {status !== 'idle' && !isIndeterminate && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium">{totalItems}</p>
            </div>
            <div className="text-center p-2 rounded-md bg-green-500/10">
              <p className="text-xs text-muted-foreground">Processed</p>
              <p className="font-medium text-green-600">{processedItems}</p>
            </div>
            <div className="text-center p-2 rounded-md bg-destructive/10">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="font-medium text-destructive">{failedItems}</p>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end">
          {(status === 'processing' && showCancelButton) && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          
          {(['completed', 'error', 'cancelled'].includes(status)) && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}