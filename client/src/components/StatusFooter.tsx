import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CheckCircle, AlertTriangle, AlertCircle, Bell, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ServiceStatus {
  status: string;
  latency: number;
  reason: string | null;
}

interface SystemHealth {
  success: boolean;
  timestamp: string;
  services: Record<string, ServiceStatus>;
  alertCount: number;
  providers: {
    active: number;
    total: number;
  };
  version: string;
}

export function StatusFooter() {
  const { data: health, isLoading, isError } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
    refetchInterval: 30000,
    staleTime: 25000
  });

  const activeServices = health?.services 
    ? Object.values(health.services).filter(s => s.status === 'active').length
    : 0;
  const totalServices = health?.services ? Object.keys(health.services).length : 0;
  const hasIssues = health?.services 
    ? Object.values(health.services).some(s => s.status !== 'active')
    : false;
  const alertCount = health?.alertCount || 0;

  const getOverallStatus = () => {
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (alertCount > 0 || hasIssues) return 'warning';
    return 'healthy';
  };

  const status = getOverallStatus();

  const statusColors = {
    loading: 'bg-zinc-950 border-zinc-800',
    error: 'bg-zinc-950 border-red-600/50',
    warning: 'bg-zinc-950 border-orange-500/50',
    healthy: 'bg-zinc-950 border-orange-500/30'
  };

  const statusIcons = {
    loading: <RefreshCw className="w-3 h-3 animate-spin text-orange-400" />,
    error: <WifiOff className="w-3 h-3 text-red-500" />,
    warning: <AlertTriangle className="w-3 h-3 text-orange-400" />,
    healthy: <CheckCircle className="w-3 h-3 text-orange-500" />
  };

  const statusText = {
    loading: 'Checking...',
    error: 'Connection Error',
    warning: 'Issues Detected',
    healthy: 'All Systems Operational'
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 border-t ${statusColors[status]} backdrop-blur-sm z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <Link href="/admin/system-status">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              data-testid="status-footer-link"
            >
              {statusIcons[status]}
              <span className={`text-xs font-medium ${
                status === 'healthy' ? 'text-orange-400' :
                status === 'warning' ? 'text-orange-300' :
                status === 'error' ? 'text-red-400' :
                'text-zinc-400'
              }`}>
                {statusText[status]}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Wifi className="w-3 h-3" />
              <span>{activeServices}/{totalServices} services</span>
            </div>

            {alertCount > 0 && (
              <Link href="/admin/system-status">
                <div className="flex items-center gap-1.5 text-yellow-400 cursor-pointer hover:opacity-80">
                  <Bell className="w-3 h-3" />
                  <span>{alertCount} alert{alertCount > 1 ? 's' : ''}</span>
                </div>
              </Link>
            )}

            <div className="flex items-center gap-1.5 text-zinc-500">
              <span>v{health?.version || '1.0.0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
