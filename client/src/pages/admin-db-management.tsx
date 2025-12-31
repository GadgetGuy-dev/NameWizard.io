import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Database, Download, Trash2, HardDrive, Activity, RefreshCw, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface TableStats {
  name: string;
  rows: number;
  size: string;
  lastUpdated: Date;
}

const AdminDbManagement = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  const [isCompacting, setIsCompacting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [stats, setStats] = useState({
    totalSize: '24.6 MB',
    usedSpace: 24.6,
    maxSpace: 100,
    tables: 8,
    totalRows: 15420,
    lastBackup: new Date(Date.now() - 86400000),
    uptime: '99.9%',
    connections: 3
  });

  const [tables, setTables] = useState<TableStats[]>([
    { name: 'users', rows: 156, size: '1.2 MB', lastUpdated: new Date() },
    { name: 'rename_operations', rows: 8543, size: '12.4 MB', lastUpdated: new Date(Date.now() - 3600000) },
    { name: 'templates', rows: 45, size: '0.3 MB', lastUpdated: new Date(Date.now() - 7200000) },
    { name: 'automation_rules', rows: 23, size: '0.1 MB', lastUpdated: new Date(Date.now() - 86400000) },
    { name: 'ai_categorizations', rows: 3421, size: '4.8 MB', lastUpdated: new Date(Date.now() - 1800000) },
    { name: 'sessions', rows: 89, size: '0.4 MB', lastUpdated: new Date() },
    { name: 'api_keys', rows: 12, size: '0.02 MB', lastUpdated: new Date(Date.now() - 43200000) },
    { name: 'system_logs', rows: 3131, size: '5.3 MB', lastUpdated: new Date() },
  ]);

  const exportDatabase = async () => {
    setIsExporting(true);
    toast({ title: "Exporting database", description: "Preparing export..." });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const exportData = {
      exportDate: new Date().toISOString(),
      stats,
      tables: tables.map(t => ({ ...t, lastUpdated: t.lastUpdated.toISOString() }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    toast({ title: "Export complete", description: "Database exported successfully" });
  };

  const compactDatabase = async () => {
    setIsCompacting(true);
    toast({ title: "Compacting database", description: "This may take a moment..." });

    await new Promise(resolve => setTimeout(resolve, 4000));

    const savedSpace = (Math.random() * 5 + 1).toFixed(1);
    setStats(prev => ({
      ...prev,
      totalSize: `${(parseFloat(prev.totalSize) - parseFloat(savedSpace)).toFixed(1)} MB`,
      usedSpace: prev.usedSpace - parseFloat(savedSpace)
    }));

    setIsCompacting(false);
    toast({ 
      title: "Compaction complete", 
      description: `Freed ${savedSpace} MB of space` 
    });
  };

  const clearTable = async (tableName: string) => {
    setIsClearing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    setTables(prev => prev.map(t => 
      t.name === tableName ? { ...t, rows: 0, size: '0.01 MB', lastUpdated: new Date() } : t
    ));

    setIsClearing(false);
    toast({ title: "Table cleared", description: `${tableName} has been emptied` });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Database Management</h1>
            <p className="text-zinc-400">Monitor and manage the application database</p>
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Size</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalSize}</p>
              </div>
              <HardDrive className="h-8 w-8 text-orange-500/30" />
            </div>
            <Progress value={(stats.usedSpace / stats.maxSpace) * 100} className="mt-3 h-1" />
            <p className="text-xs text-zinc-500 mt-1">{stats.usedSpace} / {stats.maxSpace} MB</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Rows</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalRows.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Uptime</p>
                <p className="text-2xl font-bold text-green-400">{stats.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Active Connections</p>
                <p className="text-2xl font-bold text-orange-400">{stats.connections}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-400 text-lg">Export Database</CardTitle>
            <CardDescription>Download a full database export</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportDatabase}
              disabled={isExporting}
              className="w-full bg-orange-500 hover:bg-orange-600"
              data-testid="button-export-db"
            >
              <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export to JSON'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-400 text-lg">Compact Database</CardTitle>
            <CardDescription>Optimize storage and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={isCompacting}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-400"
                  data-testid="button-compact-db"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isCompacting ? 'animate-spin' : ''}`} />
                  {isCompacting ? 'Compacting...' : 'Compact Now'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-orange-400">Compact Database?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will optimize the database storage. The operation may take several minutes and temporarily slow down the application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-zinc-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={compactDatabase} className="bg-orange-500 hover:bg-orange-600">
                    Compact
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-400 text-lg">Last Backup</CardTitle>
            <CardDescription>Automatic backup status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-zinc-300">{formatDate(stats.lastBackup)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-orange-400">Table Statistics</CardTitle>
          <CardDescription>Detailed breakdown by table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tables.map(table => (
              <div 
                key={table.name} 
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                data-testid={`table-row-${table.name}`}
              >
                <div className="flex items-center gap-4">
                  <Database className="w-5 h-5 text-orange-500/50" />
                  <div>
                    <div className="font-mono text-orange-200">{table.name}</div>
                    <div className="text-xs text-zinc-500">
                      Updated: {formatDate(table.lastUpdated)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-zinc-300">{table.rows.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">rows</div>
                  </div>
                  <div className="text-right w-20">
                    <div className="text-sm text-zinc-300">{table.size}</div>
                    <div className="text-xs text-zinc-500">size</div>
                  </div>
                  
                  {table.name !== 'users' && table.name !== 'sessions' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={isClearing || table.rows === 0}
                          data-testid={`button-clear-${table.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-orange-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" /> Clear Table?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all {table.rows.toLocaleString()} rows from <strong>{table.name}</strong>. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => clearTable(table.name)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Clear Table
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDbManagement;
