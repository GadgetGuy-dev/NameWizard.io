import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Cloud, 
  Zap,
  FileText,
  FolderOpen,
  AlertTriangle,
  Clock,
  Server,
  X,
  ExternalLink,
  Wrench,
  Bell,
  CheckCheck
} from 'lucide-react';

interface ServiceStatus {
  status: string;
  latency: number;
  reason: string | null;
  fixAction: string | null;
  fixLink: string | null;
}

interface SystemAlert {
  id: number;
  serviceName: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  message: string;
  reason: string | null;
  fixAction: string | null;
  fixLink: string | null;
  autoFixAvailable: boolean;
  detectedBy: string | null;
  createdAt: string;
}

interface SystemHealth {
  success: boolean;
  timestamp: string;
  totalLatency: number;
  services: {
    database: ServiceStatus;
    renaming: ServiceStatus;
    magicFolders: ServiceStatus;
    templates: ServiceStatus;
    errorDetection: ServiceStatus;
    ocr: ServiceStatus;
  };
  providers: {
    total: number;
    active: number;
    ai: number;
    ocr: number;
    cloud: number;
  };
  alerts: SystemAlert[];
  alertCount: number;
  version: string;
}

const AdminSystemStatus = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: health, isLoading, refetch, isFetching } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
    refetchInterval: 30000
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/alerts/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system/health'] });
      toast({ title: 'Alert resolved' });
    }
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({ title: 'Health Check Complete', description: 'System status has been refreshed.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to refresh system status.', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active' || status === 'passed') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
    } else if (status === 'inactive') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Inactive</Badge>;
    } else {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Info</Badge>;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'database': return <Database className="w-5 h-5" />;
      case 'renaming': return <FileText className="w-5 h-5" />;
      case 'magicFolders': return <FolderOpen className="w-5 h-5" />;
      case 'templates': return <FileText className="w-5 h-5" />;
      case 'errorDetection': return <AlertTriangle className="w-5 h-5" />;
      case 'ocr': return <Zap className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  const getServiceLabel = (key: string) => {
    const labels: Record<string, string> = {
      database: 'Database Connection',
      renaming: 'AI Renaming Service',
      magicFolders: 'Magic Folders',
      templates: 'Renaming Templates',
      errorDetection: 'Error Detection',
      ocr: 'OCR Processing'
    };
    return labels[key] || key;
  };

  const inactiveServices = health?.services 
    ? Object.entries(health.services).filter(([, s]) => s.status !== 'active')
    : [];

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">System Status</h1>
            <p className="text-zinc-400">Real-time monitoring of all system services</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-400">
            <Clock className="w-4 h-4 inline mr-1" />
            Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Never'}
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-orange-500 hover:bg-orange-600"
            data-testid="button-refresh-health"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-orange-400 hover:bg-zinc-800"
            data-testid="button-close-page"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Latency</p>
                <p className="text-2xl font-bold text-orange-400">{health?.totalLatency || 0}ms</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Providers</p>
                <p className="text-2xl font-bold text-green-400">{health?.providers?.active || 0} / {health?.providers?.total || 0}</p>
              </div>
              <Cloud className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Alerts</p>
                <p className={`text-2xl font-bold ${(health?.alertCount || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {health?.alertCount || 0}
                </p>
              </div>
              <Bell className={`w-8 h-8 ${(health?.alertCount || 0) > 0 ? 'text-yellow-500/50' : 'text-green-500/50'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Version</p>
                <p className="text-2xl font-bold text-orange-400">{health?.version || '1.0.0'}</p>
              </div>
              <Server className="w-8 h-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {inactiveServices.length > 0 && (
        <Card className="bg-zinc-900 border-yellow-500/50 mb-6">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Services Requiring Attention
            </CardTitle>
            <CardDescription>The following services are inactive and need configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inactiveServices.map(([key, service]) => (
              <div 
                key={key}
                className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                data-testid={`inactive-service-${key}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 mt-1">
                      {getServiceIcon(key)}
                    </div>
                    <div>
                      <p className="text-yellow-200 font-medium">{getServiceLabel(key)}</p>
                      {service.reason && (
                        <p className="text-sm text-yellow-400/80 mt-1">
                          <strong>Why:</strong> {service.reason}
                        </p>
                      )}
                      {service.fixAction && (
                        <p className="text-sm text-zinc-400 mt-1">
                          <Wrench className="w-3 h-3 inline mr-1" />
                          <strong>How to fix:</strong> {service.fixAction}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(service.status)}
                    {service.fixLink && (
                      <Link href={service.fixLink}>
                        <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Fix Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(health?.alerts?.length || 0) > 0 && (
        <Card className="bg-zinc-900 border-red-500/50 mb-6">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Alerts ({health?.alerts?.length || 0})
            </CardTitle>
            <CardDescription>Issues detected by the support agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {health?.alerts?.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : alert.severity === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-sm text-zinc-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-orange-200">{alert.title}</p>
                    <p className="text-sm text-zinc-400 mt-1">{alert.message}</p>
                    {alert.fixAction && (
                      <p className="text-sm text-green-400/80 mt-2">
                        <Wrench className="w-3 h-3 inline mr-1" />
                        {alert.fixAction}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveAlertMutation.mutate(alert.id)}
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                    data-testid={`resolve-alert-${alert.id}`}
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="text-orange-400">Service Health</CardTitle>
          <CardDescription>Status of all core system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health?.services && Object.entries(health.services).map(([key, service]) => (
              <div 
                key={key} 
                className={`p-4 rounded-lg border ${
                  service.status === 'active' 
                    ? 'bg-zinc-800/50 border-zinc-700' 
                    : 'bg-yellow-500/5 border-yellow-500/30'
                }`}
                data-testid={`service-status-${key}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={service.status === 'active' ? 'text-orange-400' : 'text-yellow-400'}>
                      {getServiceIcon(key)}
                    </div>
                    <p className="text-orange-200 font-medium">{getServiceLabel(key)}</p>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
                <div className="text-xs text-zinc-500">
                  Latency: {service.latency}ms
                  {service.reason && service.status !== 'active' && (
                    <span className="block mt-1 text-yellow-400/70">{service.reason}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-orange-400">Provider Summary</CardTitle>
          <CardDescription>Overview of configured API providers by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-orange-200 font-medium">AI Providers</span>
              </div>
              <Progress value={(health?.providers?.ai || 0) / Math.max(health?.providers?.total || 1, 1) * 100} className="h-2 mb-2" />
              <p className="text-sm text-zinc-400">{health?.providers?.ai || 0} configured</p>
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-3 mb-3">
                <Cloud className="w-5 h-5 text-green-400" />
                <span className="text-orange-200 font-medium">Cloud Storage</span>
              </div>
              <Progress value={(health?.providers?.cloud || 0) / Math.max(health?.providers?.total || 1, 1) * 100} className="h-2 mb-2" />
              <p className="text-sm text-zinc-400">{health?.providers?.cloud || 0} configured</p>
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-orange-200 font-medium">OCR Providers</span>
              </div>
              <Progress value={(health?.providers?.ocr || 0) / Math.max(health?.providers?.total || 1, 1) * 100} className="h-2 mb-2" />
              <p className="text-sm text-zinc-400">{health?.providers?.ocr || 0} configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemStatus;
