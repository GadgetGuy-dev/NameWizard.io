import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Cloud, Download, Upload, Trash2, Archive, Clock, FileArchive, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Backup {
  id: number;
  name: string;
  description?: string;
  backupData: Record<string, unknown>;
  providerCount: number;
  size: number;
  createdAt: string;
  createdBy?: number;
}

const AdminKeyBackups = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');

  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ['/api/backups']
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await apiRequest('POST', '/api/backups', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
      setBackupName('');
      setBackupDescription('');
      toast({ title: "Backup created", description: "Configuration saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create backup", variant: "destructive" });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/backups/${id}/restore`, {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Backup restored", 
        description: `Restored ${data.restoredCount || 0} provider configurations` 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to restore backup", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/backups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
      toast({ title: "Backup deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete backup", variant: "destructive" });
    }
  });

  const createBackup = () => {
    if (!backupName.trim()) {
      toast({ title: "Please enter a backup name", variant: "destructive" });
      return;
    }
    createMutation.mutate({ name: backupName, description: backupDescription || undefined });
  };

  const downloadBackup = (backup: Backup) => {
    const data = {
      name: backup.name,
      createdAt: backup.createdAt,
      providerCount: backup.providerCount,
      backupData: backup.backupData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Downloading backup", description: backup.name });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      createMutation.mutate({ 
        name: data.name || file.name.replace('.json', ''),
        description: 'Imported from file'
      });
    } catch {
      toast({ title: "Import failed", description: "Invalid backup file", variant: "destructive" });
    }

    e.target.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

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
          <Cloud className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Backup & Restore</h1>
            <p className="text-zinc-400">Create and manage configuration backups</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-orange-400">Create New Backup</CardTitle>
            <CardDescription>Save your current API keys and provider configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-orange-200">Backup Name</Label>
                <Input
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="e.g., Weekly Backup - December 24"
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-backup-name"
                />
              </div>
              <div>
                <Label className="text-orange-200">Description (optional)</Label>
                <Input
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Brief description of this backup"
                  className="bg-zinc-800 border-zinc-700"
                  data-testid="input-backup-description"
                />
              </div>
              <Button 
                onClick={createBackup} 
                disabled={createMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 w-full"
                data-testid="button-create-backup"
              >
                <Archive className={`w-4 h-4 mr-2 ${createMutation.isPending ? 'animate-pulse' : ''}`} />
                {createMutation.isPending ? 'Creating...' : 'Create Backup'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-400">Import Backup</CardTitle>
            <CardDescription>Restore from a backup file</CardDescription>
          </CardHeader>
          <CardContent>
            <Label 
              htmlFor="backup-upload" 
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-orange-500/50 transition"
            >
              <Upload className="w-8 h-8 text-zinc-500 mb-2" />
              <span className="text-sm text-zinc-400">Click to upload backup file</span>
              <span className="text-xs text-zinc-500">.json files only</span>
            </Label>
            <input
              id="backup-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
              data-testid="input-file-upload"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-orange-400">Saved Backups</CardTitle>
          <CardDescription>Manage your backup archives</CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <FileArchive className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No backups yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map(backup => (
                <div 
                  key={backup.id} 
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                  data-testid={`backup-row-${backup.id}`}
                >
                  <div className="flex items-center gap-4">
                    <FileArchive className="w-10 h-10 text-orange-500/50" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-orange-200">{backup.name}</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Complete
                        </Badge>
                      </div>
                      {backup.description && (
                        <p className="text-sm text-zinc-400 mt-1">{backup.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(backup.createdAt).toLocaleDateString()}
                        </span>
                        <span>{formatSize(backup.size)}</span>
                        <span>{backup.providerCount} providers</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadBackup(backup)}
                      className="border-zinc-600"
                      data-testid={`button-download-${backup.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-orange-500 text-orange-400"
                          data-testid={`button-restore-${backup.id}`}
                        >
                          <Upload className="w-4 h-4 mr-1" /> Restore
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-orange-400">Restore Backup?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will replace your current provider configurations with the backup. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => restoreMutation.mutate(backup.id)}
                            className="bg-orange-500 hover:bg-orange-600"
                            disabled={restoreMutation.isPending}
                          >
                            {restoreMutation.isPending ? 'Restoring...' : 'Restore'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          data-testid={`button-delete-${backup.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-orange-400">Delete Backup?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This backup will be permanently deleted. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(backup.id)}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKeyBackups;
