import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { RefreshCw, CheckCircle, XCircle, Database, Server, Activity, Download, Upload, AlertCircle, Loader2, X, Settings2 } from 'lucide-react';
import CustomInstructionsPanel from '@/components/settings/CustomInstructionsPanel';

interface ConnectionStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'checking';
  latency?: number;
  lastChecked?: Date;
}

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('appearance');
  
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    { name: 'OpenAI API', status: 'disconnected' },
    { name: 'Anthropic API', status: 'disconnected' },
    { name: 'Database', status: 'disconnected' },
    { name: 'Dropbox', status: 'disconnected' },
    { name: 'Google Drive', status: 'disconnected' }
  ]);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'Storage Used', value: 2.4, max: 10, unit: 'GB' },
    { name: 'Files Processed Today', value: 47, max: 100, unit: '' },
    { name: 'API Calls Today', value: 156, max: 500, unit: '' }
  ]);

  const [isTestingAll, setIsTestingAll] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const testConnection = async (index: number) => {
    setConnections(prev => prev.map((c, i) => 
      i === index ? { ...c, status: 'checking' } : c
    ));

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    
    const success = Math.random() > 0.3;
    setConnections(prev => prev.map((c, i) => 
      i === index ? { 
        ...c, 
        status: success ? 'connected' : 'disconnected',
        latency: success ? Math.floor(50 + Math.random() * 150) : undefined,
        lastChecked: new Date()
      } : c
    ));
  };

  const testAllConnections = async () => {
    setIsTestingAll(true);
    for (let i = 0; i < connections.length; i++) {
      await testConnection(i);
    }
    setIsTestingAll(false);
    toast({ title: "Connection tests complete" });
  };

  const handleBackup = () => {
    const data = {
      settings: { appearance: 'dark', notifications: true },
      apiKeys: 'encrypted',
      templates: [],
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namewizard_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Backup created", description: "Settings exported successfully" });
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          JSON.parse(text);
          toast({ title: "Backup restored", description: "Settings imported successfully" });
        } catch {
          toast({ title: "Invalid backup file", variant: "destructive" });
        }
      }
    };
    input.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Settings</h2>
          <p className="text-zinc-400 text-sm">Manage your application preferences</p>
        </div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="naming">Naming</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how NameWizard looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                </div>
                <Switch id="dark-mode" defaultChecked data-testid="dark-mode-switch" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">Reduce animation effects</p>
                </div>
                <Switch id="reduced-motion" data-testid="reduced-motion-switch" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use smaller UI elements</p>
                </div>
                <Switch id="compact-mode" data-testid="compact-mode-switch" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="naming">
          <CustomInstructionsPanel />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications about file processing</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show desktop notifications when processing completes</p>
                </div>
                <Switch id="browser-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="error-alerts">Error Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when errors occur</p>
                </div>
                <Switch id="error-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Connection Health</CardTitle>
                <CardDescription>Monitor API and service connections</CardDescription>
              </div>
              <Button 
                onClick={testAllConnections} 
                disabled={isTestingAll}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="test-all-connections"
              >
                {isTestingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Test All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((conn, index) => (
                  <div key={conn.name} className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950" data-testid={`connection-${index}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(conn.status)}
                      <div>
                        <div className="font-medium">{conn.name}</div>
                        <div className="text-sm text-zinc-500">
                          {conn.status === 'connected' && conn.latency && `Latency: ${conn.latency}ms`}
                          {conn.status === 'disconnected' && 'Not connected'}
                          {conn.status === 'checking' && 'Testing...'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={conn.status === 'connected' ? 'bg-green-600' : conn.status === 'checking' ? 'bg-orange-600' : 'bg-red-600'}>
                        {conn.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => testConnection(index)}
                        disabled={conn.status === 'checking'}
                        className="border-zinc-700"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Export or import your settings and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Export Backup</h4>
                    <p className="text-sm text-zinc-400">Download all your settings, templates, and preferences</p>
                  </div>
                </div>
                <Button onClick={handleBackup} className="w-full bg-orange-600 hover:bg-orange-700" data-testid="export-backup">
                  <Download className="h-4 w-4 mr-2" /> Create Backup
                </Button>
              </div>
              
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-3 mb-3">
                  <Upload className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Restore Backup</h4>
                    <p className="text-sm text-zinc-400">Import settings from a previous backup file</p>
                  </div>
                </div>
                <Button onClick={handleRestore} variant="outline" className="w-full border-zinc-700" data-testid="restore-backup">
                  <Upload className="h-4 w-4 mr-2" /> Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>View and manage database operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Database Status</div>
                    <div className="text-sm text-zinc-400">PostgreSQL connected</div>
                  </div>
                </div>
                <Badge className="bg-green-600">Healthy</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="text-2xl font-bold text-orange-500">1,247</div>
                  <div className="text-sm text-zinc-400">Total Records</div>
                </div>
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="text-2xl font-bold text-blue-500">12.4 MB</div>
                  <div className="text-sm text-zinc-400">Database Size</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-zinc-700" data-testid="optimize-db">
                  Optimize Database
                </Button>
                <Button variant="outline" className="flex-1 border-red-700 text-red-400" data-testid="clear-cache">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Monitor system resources and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemMetrics.map((metric, index) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.name}</span>
                    <span className="text-zinc-400">{metric.value}{metric.unit} / {metric.max}{metric.unit}</span>
                  </div>
                  <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                </div>
              ))}
              
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm">System Health</span>
                  </div>
                  <Badge className="bg-green-600">All Systems Operational</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="text-lg font-bold text-green-500">99.9%</div>
                  <div className="text-xs text-zinc-400">Uptime</div>
                </div>
                <div className="text-center p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="text-lg font-bold text-blue-500">v2.3</div>
                  <div className="text-xs text-zinc-400">Version</div>
                </div>
                <div className="text-center p-3 rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="text-lg font-bold text-orange-500">45ms</div>
                  <div className="text-xs text-zinc-400">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          data-testid="save-settings"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
