import React, { useMemo } from 'react';
import { Check, ChevronDown, Info, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export type AIModel = {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'local' | 'perplexity' | 'other';
  isAvailable: boolean;
  description?: string;
  capabilities?: string[];
  tier?: 'free' | 'basic' | 'premium' | 'enterprise';
  contextWindow?: number;
  isMultimodal?: boolean;
};

export type AIProvider = {
  id: string;
  name: string;
  models: AIModel[];
  isAvailable: boolean;
  priority: number;
};

type ModelSelectionDropdownProps = {
  selectedModel: AIModel | null;
  providers: AIProvider[];
  onModelSelect: (model: AIModel) => void;
  label?: string;
  disabled?: boolean;
  showProviderGroups?: boolean;
};

// Helper to get the provider icon
function getProviderIcon(provider: string) {
  switch (provider) {
    case 'openai':
      return '🟢';
    case 'anthropic':
      return '🟣';
    case 'google':
      return '🔵';
    case 'meta':
      return '🟡';
    case 'mistral':
      return '🔴';
    case 'perplexity':
      return '🟠';
    case 'local':
      return '🏠';
    default:
      return '🤖';
  }
}

// Helper to get available badge based on tier
function getTierBadge(tier?: string) {
  if (!tier) return null;
  
  switch (tier) {
    case 'free':
      return <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">Free</Badge>;
    case 'basic':
      return <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">Basic</Badge>;
    case 'premium':
      return <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">Premium</Badge>;
    case 'enterprise':
      return <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">Enterprise</Badge>;
    default:
      return null;
  }
}

function ModelMenuItem({ model, isSelected, onSelect }: { model: AIModel; isSelected: boolean; onSelect: () => void }) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex justify-between items-center py-2 px-2",
        !model.isAvailable && "opacity-50 cursor-not-allowed"
      )}
      disabled={!model.isAvailable}
      onSelect={() => model.isAvailable && onSelect()}
    >
      <div className="flex items-center gap-2">
        <span className="mr-1">{getProviderIcon(model.provider)}</span>
        <span>{model.name}</span>
        {model.isMultimodal && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge variant="outline" className="text-xs px-1 py-0 h-5 bg-teal-50 text-teal-700 border-teal-200">
                    Vision
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Supports image analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {getTierBadge(model.tier)}
      </div>
      <div className="flex items-center">
        {!model.isAvailable ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">API key not configured</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : isSelected ? (
          <Check className="h-4 w-4" />
        ) : null}
      </div>
    </DropdownMenuItem>
  );
}

export function ModelSelectionDropdown({
  selectedModel,
  providers,
  onModelSelect,
  label = 'Select Model',
  disabled = false,
  showProviderGroups = true,
}: ModelSelectionDropdownProps) {
  // Sort providers by priority (highest first) and then filter out providers with no models
  const sortedProviders = useMemo(() => {
    return providers ? [...providers]
      .sort((a, b) => b.priority - a.priority)
      .filter(provider => provider.models.length > 0) 
      : [];
  }, [providers]);

  // Get flat list of all models
  const allModels = useMemo(() => {
    return providers ? providers.flatMap(provider => provider.models) : [];
  }, [providers]);

  // Filter to only available models
  const availableModels = useMemo(() => {
    return allModels.filter(model => model.isAvailable);
  }, [allModels]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center truncate">
            {selectedModel ? (
              <>
                <span className="mr-2">{getProviderIcon(selectedModel.provider)}</span>
                <span className="truncate">{selectedModel.name}</span>
              </>
            ) : (
              <span>{label}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>
          Select AI Model
          {selectedModel?.description && (
            <p className="text-xs font-normal text-muted-foreground mt-1">
              {selectedModel.description}
            </p>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Show Provider Groups */}
        {showProviderGroups ? (
          sortedProviders.map((provider) => {
            // Skip providers with no available models
            if (!provider.isAvailable || provider.models.length === 0) return null;
            
            return (
              <DropdownMenuGroup key={provider.id}>
                <DropdownMenuLabel className="text-xs py-1.5">
                  {provider.name}
                </DropdownMenuLabel>
                {provider.models.map((model) => (
                  <ModelMenuItem
                    key={model.id}
                    model={model}
                    isSelected={selectedModel?.id === model.id}
                    onSelect={() => onModelSelect(model)}
                  />
                ))}
              </DropdownMenuGroup>
            );
          })
        ) : (
          // Show flat list
          allModels.map((model) => (
            <ModelMenuItem
              key={model.id}
              model={model}
              isSelected={selectedModel?.id === model.id}
              onSelect={() => onModelSelect(model)}
            />
          ))
        )}
        
        {availableModels.length === 0 && (
          <div className="px-2 py-4 text-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No AI models available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please configure API keys in settings
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}