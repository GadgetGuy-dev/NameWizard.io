import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, CircleAlert, HelpCircle, Settings2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type FeatureStatus = 'active' | 'inactive' | 'error' | 'configuring';

interface FeatureToggleSwitchProps {
  /**
   * Feature name displayed next to the toggle
   */
  name: string;
  
  /**
   * Whether the feature is enabled
   */
  enabled: boolean;
  
  /**
   * Current status of the feature
   */
  status?: FeatureStatus;
  
  /**
   * Optional extra description
   */
  description?: string;
  
  /**
   * Configuration Icon to show settings is available
   */
  showConfigIcon?: boolean;
  
  /**
   * What happens when the toggle is switched
   */
  onToggle: (enabled: boolean) => void;
  
  /**
   * What happens when the config icon is clicked
   */
  onConfigClick?: () => void;
  
  /**
   * Whether the toggle is disabled
   */
  disabled?: boolean;
}

/**
 * A feature toggle switch component with status indicator
 */
export function FeatureToggleSwitch({
  name,
  enabled,
  status = 'inactive',
  description,
  showConfigIcon = false,
  onToggle,
  onConfigClick,
  disabled = false,
}: FeatureToggleSwitchProps) {
  // Determine status indicator
  const StatusIndicator = () => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
            <CircleCheck className="h-3 w-3 mr-1 text-green-500" />
            Active
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
            <CircleAlert className="h-3 w-3 mr-1 text-red-500" />
            Error
          </Badge>
        );
      case 'configuring':
        return (
          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
            <Settings2 className="h-3 w-3 mr-1 animate-spin text-blue-500" />
            Configuring
          </Badge>
        );
      case 'inactive':
      default:
        return (
          <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
            Inactive
          </Badge>
        );
    }
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center">
          <Label htmlFor={`toggle-${name}`} className="font-medium text-sm">
            {name}
          </Label>
          <StatusIndicator />
          
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showConfigIcon && (
            <button
              onClick={onConfigClick}
              disabled={disabled || !enabled}
              className={`p-1 rounded-full hover:bg-muted ${
                disabled || !enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-label="Configure feature"
            >
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          
          <Switch
            id={`toggle-${name}`}
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}