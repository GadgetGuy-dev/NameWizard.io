import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cloud, CheckCircle, XCircle, Save, ExternalLink, Eye, EyeOff
 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudStorageConfig {
  dropbox: {
    accessToken: string;
    connected: boolean;
  };
  googleDrive: {
    accessToken: string;
    connected: boolean;
  };
}

const ApiKeysPage = () => {
  const { toast } = useToast();
  const [showDropboxToken, setShowDropboxToken] = useState(false);
  const [showGDriveToken, setShowGDriveToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [cloudConfig, setCloudConfig] = useState<CloudStorageConfig>(() => {
    const saved = localStorage.getItem('nameWizardCloudConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {
          dropbox: { accessToken: '', connected: false },
          googleDrive: { accessToken: '', connected: false }
        };
      }
    }
    return {
      dropbox: { accessToken: '', connected: false },
      googleDrive: { accessToken: '', connected: false }
    };
  });

  const [dropboxToken, setDropboxToken] = useState(cloudConfig.dropbox.accessToken || '');
  const [gdriveToken, setGdriveToken] = useState(cloudConfig.googleDrive.accessToken || '');

  const saveDropboxConfig = async () => {
    setIsSaving(true);
    try {
      const newConfig = {
        ...cloudConfig,
        dropbox: {
          accessToken: dropboxToken,
          connected: dropboxToken.length > 0
        }
      };
      setCloudConfig(newConfig);
      localStorage.setItem('nameWizardCloudConfig', JSON.stringify(newConfig));
      toast({
        title: "Dropbox Connected",
        description: "Your Dropbox access token has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Dropbox configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveGDriveConfig = async () => {
    setIsSaving(true);
    try {
      const newConfig = {
        ...cloudConfig,
        googleDrive: {
          accessToken: gdriveToken,
          connected: gdriveToken.length > 0
        }
      };
      setCloudConfig(newConfig);
      localStorage.setItem('nameWizardCloudConfig', JSON.stringify(newConfig));
      toast({
        title: "Google Drive Connected",
        description: "Your Google Drive access token has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Google Drive configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectDropbox = () => {
    const newConfig = {
      ...cloudConfig,
      dropbox: { accessToken: '', connected: false }
    };
    setCloudConfig(newConfig);
    setDropboxToken('');
    localStorage.setItem('nameWizardCloudConfig', JSON.stringify(newConfig));
    toast({
      title: "Dropbox Disconnected",
      description: "Your Dropbox connection has been removed."
    });
  };

  const disconnectGDrive = () => {
    const newConfig = {
      ...cloudConfig,
      googleDrive: { accessToken: '', connected: false }
    };
    setCloudConfig(newConfig);
    setGdriveToken('');
    localStorage.setItem('nameWizardCloudConfig', JSON.stringify(newConfig));
    toast({
      title: "Google Drive Disconnected",
      description: "Your Google Drive connection has been removed."
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
          <Cloud className="h-6 w-6" /> Cloud Storage
        </h1>
        <p className="text-zinc-400 text-sm">Connect your cloud storage accounts to import and export files</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📦</span>
                <div>
                  <CardTitle className="text-orange-400">Dropbox</CardTitle>
                  <CardDescription>Connect your Dropbox account to access files</CardDescription>
                </div>
              </div>
              <Badge className={cloudConfig.dropbox.connected ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}>
                {cloudConfig.dropbox.connected ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Not Connected</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dropbox-token">Access Token</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="dropbox-token"
                    type={showDropboxToken ? "text" : "password"}
                    placeholder="Enter your Dropbox access token"
                    value={dropboxToken}
                    onChange={(e) => setDropboxToken(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 pr-10"
                    data-testid="input-dropbox-token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setShowDropboxToken(!showDropboxToken)}
                  >
                    {showDropboxToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Get your access token from the{' '}
                <a 
                  href="https://www.dropbox.com/developers/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  Dropbox Developer Console <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveDropboxConfig}
                disabled={isSaving || !dropboxToken}
                className="bg-orange-500 hover:bg-orange-600"
                data-testid="button-save-dropbox"
              >
                <Save className="h-4 w-4 mr-2" />
                {cloudConfig.dropbox.connected ? 'Update Connection' : 'Connect Dropbox'}
              </Button>
              {cloudConfig.dropbox.connected && (
                <Button
                  variant="outline"
                  onClick={disconnectDropbox}
                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                  data-testid="button-disconnect-dropbox"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📁</span>
                <div>
                  <CardTitle className="text-orange-400">Google Drive</CardTitle>
                  <CardDescription>Connect your Google Drive account to access files</CardDescription>
                </div>
              </div>
              <Badge className={cloudConfig.googleDrive.connected ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}>
                {cloudConfig.googleDrive.connected ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Not Connected</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gdrive-token">Access Token</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="gdrive-token"
                    type={showGDriveToken ? "text" : "password"}
                    placeholder="Enter your Google Drive access token"
                    value={gdriveToken}
                    onChange={(e) => setGdriveToken(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 pr-10"
                    data-testid="input-gdrive-token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setShowGDriveToken(!showGDriveToken)}
                  >
                    {showGDriveToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Get your access token from the{' '}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveGDriveConfig}
                disabled={isSaving || !gdriveToken}
                className="bg-orange-500 hover:bg-orange-600"
                data-testid="button-save-gdrive"
              >
                <Save className="h-4 w-4 mr-2" />
                {cloudConfig.googleDrive.connected ? 'Update Connection' : 'Connect Google Drive'}
              </Button>
              {cloudConfig.googleDrive.connected && (
                <Button
                  variant="outline"
                  onClick={disconnectGDrive}
                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                  data-testid="button-disconnect-gdrive"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="py-4">
            <p className="text-sm text-zinc-400 text-center">
              Your cloud storage credentials are stored securely in your browser. 
              They are used only to access your files for renaming operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiKeysPage;
