import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AIModel } from './ModelSelectionDropdown';

export type FallbackState = 'idle' | 'in-progress' | 'success' | 'failure';

interface ModelFallbackIndicatorProps {
  status: FallbackState;
  primaryModel: AIModel | null;
  fallbackModels: AIModel[];
  currentModel: AIModel | null;
  attemptedModels: string[];
  error?: string;
  className?: string;
}

export function ModelFallbackIndicator({
  status,
  primaryModel,
  fallbackModels,
  currentModel,
  attemptedModels,
  error,
  className,
}: ModelFallbackIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  // Get status icon based on current state
  const getStatusIcon = (modelId: string) => {
    // Current model being used
    if (currentModel?.id === modelId) {
      if (status === 'in-progress') {
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      }
      if (status === 'success') {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
      if (status === 'failure') {
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      }
    }
    
    // Failed model
    if (attemptedModels.includes(modelId) && currentModel?.id !== modelId) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    
    // Not yet tried
    return <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Alert for failures */}
        {status === 'failure' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Failed</AlertTitle>
            <AlertDescription>
              {error || "We couldn't process your request with any available AI model."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Alert for in-progress fallback */}
        {status === 'in-progress' && currentModel && primaryModel && currentModel.id !== primaryModel.id && (
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Trying Alternative Model</AlertTitle>
            <AlertDescription>
              The primary model failed. Now trying with {currentModel.name}...
            </AlertDescription>
          </Alert>
        )}
        
        {/* Alert for successful fallback */}
        {status === 'success' && currentModel && primaryModel && currentModel.id !== primaryModel.id && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Alternative Model Used</AlertTitle>
            <AlertDescription>
              Successfully processed with {currentModel.name} after primary model failed.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Model sequence */}
        <div className="space-y-2">
          <div className="text-sm font-medium">AI Model Fallback Sequence</div>
          <div className="flex items-center flex-wrap gap-2">
            {/* Primary model */}
            {primaryModel && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center border rounded-full pl-1 pr-2 py-0.5 text-xs bg-background">
                  {getStatusIcon(primaryModel.id)}
                  <span className="ml-1.5">{primaryModel.name}</span>
                </div>
                {fallbackModels.length > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            )}
            
            {/* Fallback models */}
            {fallbackModels.map((model, index) => (
              <div key={model.id} className="flex items-center gap-1.5">
                <div className="flex items-center border rounded-full pl-1 pr-2 py-0.5 text-xs bg-background">
                  {getStatusIcon(model.id)}
                  <span className="ml-1.5">{model.name}</span>
                </div>
                {index < fallbackModels.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Show error details if provided */}
        {error && status === 'failure' && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="text-sm font-medium">Error Details</div>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-24">
                {error}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}