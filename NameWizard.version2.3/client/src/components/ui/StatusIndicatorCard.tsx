import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Zap,
  Server,
  Cpu, 
  HardDrive, 
  Database 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type SystemStatus = 'healthy' | 'warning' | 'error' | 'offline' | 'starting' | 'updating' | 'idle';

export interface SystemComponent {
  name: string;
  status: SystemStatus;
  description?: string;
  lastUpdated?: Date;
  icon?: keyof typeof componentIcons;
  message?: string;
  performance?: number; // 0-100 percentage
}

const componentIcons = {
  server: Server,
  database: Database,
  storage: HardDrive,
  processor: Cpu,
  api: Zap,
  default: Server
};

const statusConfig = {
  healthy: { 
    icon: CheckCircle2, 
    label: 'Healthy', 
    color: 'text-green-500', 
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  warning: { 
    icon: AlertTriangle, 
    label: 'Warning', 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200' 
  },
  error: { 
    icon: XCircle, 
    label: 'Error', 
    color: 'text-red-500', 
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200' 
  },
  offline: { 
    icon: XCircle, 
    label: 'Offline', 
    color: 'text-gray-500',  
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  starting: { 
    icon: Clock, 
    label: 'Starting', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200' 
  },
  updating: { 
    icon: RefreshCw, 
    label: 'Updating', 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200' 
  },
  idle: { 
    icon: Clock, 
    label: 'Idle', 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200' 
  }
};

interface StatusIndicatorCardProps {
  /**
   * Title of the system status card
   */
  title: string;
  
  /**
   * Optional description of the system
   */
  description?: string;
  
  /**
   * List of system components to display status for
   */
  components: SystemComponent[];
  
  /**
   * Overall system status
   */
  overallStatus?: SystemStatus;
  
  /**
   * Action to perform when refresh button is clicked
   */
  onRefresh?: () => void;
  
  /**
   * Whether the refresh button is loading
   */
  isRefreshing?: boolean;
}

/**
 * A card that displays system status with individual component indicators
 */
export function StatusIndicatorCard({
  title,
  description,
  components,
  overallStatus = 'healthy',
  onRefresh,
  isRefreshing = false
}: StatusIndicatorCardProps) {
  // Calculate overall status if not explicitly provided
  if (!overallStatus) {
    if (components.some(c => c.status === 'error')) {
      overallStatus = 'error';
    } else if (components.some(c => c.status === 'warning')) {
      overallStatus = 'warning';
    } else if (components.some(c => c.status === 'offline')) {
      overallStatus = 'offline';
    } else if (components.some(c => c.status === 'updating')) {
      overallStatus = 'updating';
    } else if (components.some(c => c.status === 'starting')) {
      overallStatus = 'starting';
    } else if (components.every(c => c.status === 'idle')) {
      overallStatus = 'idle';
    } else {
      overallStatus = 'healthy';
    }
  }
  
  // Get config for overall status
  const { icon: StatusIcon, label, color, bgColor, borderColor } = statusConfig[overallStatus];
  
  // Generate a time formatter
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
  
  return (
    <Card className="shadow-sm border overflow-hidden">
      <CardHeader className={`${bgColor} border-b ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${color}`} />
              <span>{title}</span>
              <span className={`text-sm font-normal ${color}`}>({label})</span>
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {components.map((component, index) => {
            const { status } = component;
            const { icon: ComponentStatusIcon, color: statusColor } = statusConfig[status];
            const ComponentIcon = componentIcons[component.icon || 'default'];
            
            return (
              <div key={index} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ComponentIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">{component.name}</span>
                    <ComponentStatusIcon className={`h-4 w-4 ml-2 ${statusColor}`} />
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-muted-foreground">
                          {component.lastUpdated && timeFormatter.format(component.lastUpdated)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Last updated</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {component.message && (
                  <p className="text-xs text-muted-foreground ml-6">{component.message}</p>
                )}
                
                {component.performance !== undefined && (
                  <div className="w-full pt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Performance</span>
                      <span>{component.performance}%</span>
                    </div>
                    <Progress 
                      value={component.performance} 
                      className={`h-1.5 ${
                        component.performance > 80 ? 'bg-amber-500/20' : 
                        component.performance > 50 ? 'bg-blue-500/20' : 'bg-green-500/20'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {components.some(c => c.status === 'error' || c.status === 'warning') && (
        <CardFooter className="bg-muted py-2 px-4 border-t">
          <p className="text-xs text-muted-foreground">
            {components.some(c => c.status === 'error') 
              ? 'Some components are experiencing issues. Please check system status.'
              : 'Performance issues detected. System is operating with reduced capacity.'}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}