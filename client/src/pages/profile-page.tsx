import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Save, Key, Cloud, CheckCircle, XCircle, LogIn, LogOut, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SiDropbox, SiGoogledrive } from 'react-icons/si';

interface CloudConnection {
  connected: boolean;
  email?: string;
  connectedAt?: Date;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    displayName: user?.username || '',
    phoneNumber: '',
    language: 'English',
    theme: 'System',
    emailNotifications: true,
    pushNotifications: true
  });

  const [cloudConnections, setCloudConnections] = useState<{
    dropbox: CloudConnection;
    googleDrive: CloudConnection;
  }>(() => {
    const saved = localStorage.getItem('nameWizardUserCloudConnections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          dropbox: { ...parsed.dropbox, connectedAt: parsed.dropbox?.connectedAt ? new Date(parsed.dropbox.connectedAt) : undefined },
          googleDrive: { ...parsed.googleDrive, connectedAt: parsed.googleDrive?.connectedAt ? new Date(parsed.googleDrive.connectedAt) : undefined }
        };
      } catch (e) {
        return { dropbox: { connected: false }, googleDrive: { connected: false } };
      }
    }
    return { dropbox: { connected: false }, googleDrive: { connected: false } };
  });

  useEffect(() => {
    localStorage.setItem('nameWizardUserCloudConnections', JSON.stringify(cloudConnections));
  }, [cloudConnections]);

  const connectDropbox = () => {
    toast({ title: "Connecting to Dropbox", description: "Opening authorization window..." });
    setTimeout(() => {
      setCloudConnections(prev => ({
        ...prev,
        dropbox: { connected: true, email: 'user@dropbox.com', connectedAt: new Date() }
      }));
      toast({ title: "Dropbox connected", description: "Your Dropbox account is now linked" });
    }, 1500);
  };

  const disconnectDropbox = () => {
    setCloudConnections(prev => ({
      ...prev,
      dropbox: { connected: false }
    }));
    toast({ title: "Dropbox disconnected" });
  };

  const connectGoogleDrive = () => {
    toast({ title: "Connecting to Google Drive", description: "Opening Google authorization..." });
    setTimeout(() => {
      setCloudConnections(prev => ({
        ...prev,
        googleDrive: { connected: true, email: 'user@gmail.com', connectedAt: new Date() }
      }));
      toast({ title: "Google Drive connected", description: "Your Google account is now linked" });
    }, 1500);
  };

  const disconnectGoogleDrive = () => {
    setCloudConnections(prev => ({
      ...prev,
      googleDrive: { connected: false }
    }));
    toast({ title: "Google Drive disconnected" });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated successfully",
    });
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔧</span>
            <div>
              <h1 className="text-3xl font-bold text-orange-500">My Account</h1>
              <p className="text-zinc-400">Manage your profile and cloud storage connections</p>
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Profile Settings
            </TabsTrigger>
            <TabsTrigger value="cloud-storage" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Cloud className="w-4 h-4 mr-2" /> Cloud Storage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud-storage" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <SiDropbox className="w-6 h-6 text-blue-400" /> Dropbox
                </CardTitle>
                <CardDescription>Connect your Dropbox account to access and organize files</CardDescription>
              </CardHeader>
              <CardContent>
                {cloudConnections.dropbox.connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="text-green-400 font-medium">Connected</div>
                          <div className="text-sm text-zinc-400">{cloudConnections.dropbox.email}</div>
                          {cloudConnections.dropbox.connectedAt && (
                            <div className="text-xs text-zinc-500">Connected on {cloudConnections.dropbox.connectedAt.toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={disconnectDropbox}
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                        data-testid="button-disconnect-dropbox"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-zinc-500" />
                      <div>
                        <div className="text-zinc-400 font-medium">Not Connected</div>
                        <div className="text-sm text-zinc-500">Sign in with your Dropbox account</div>
                      </div>
                    </div>
                    <Button 
                      onClick={connectDropbox}
                      className="bg-blue-500 hover:bg-blue-600"
                      data-testid="button-connect-dropbox"
                    >
                      <LogIn className="w-4 h-4 mr-2" /> Sign in with Dropbox
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <SiGoogledrive className="w-6 h-6 text-yellow-400" /> Google Drive
                </CardTitle>
                <CardDescription>Connect your Google account to access and organize files</CardDescription>
              </CardHeader>
              <CardContent>
                {cloudConnections.googleDrive.connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="text-green-400 font-medium">Connected</div>
                          <div className="text-sm text-zinc-400">{cloudConnections.googleDrive.email}</div>
                          {cloudConnections.googleDrive.connectedAt && (
                            <div className="text-xs text-zinc-500">Connected on {cloudConnections.googleDrive.connectedAt.toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={disconnectGoogleDrive}
                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                        data-testid="button-disconnect-gdrive"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-zinc-500" />
                      <div>
                        <div className="text-zinc-400 font-medium">Not Connected</div>
                        <div className="text-sm text-zinc-500">Sign in with your Google account</div>
                      </div>
                    </div>
                    <Button 
                      onClick={connectGoogleDrive}
                      className="bg-red-500 hover:bg-red-600"
                      data-testid="button-connect-gdrive"
                    >
                      <LogIn className="w-4 h-4 mr-2" /> Sign in with Google
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
        <div className="space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-lg font-medium text-orange-500 flex items-center mb-4">
              <span className="mr-2">👤</span> Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="bg-zinc-900 border-zinc-700 text-orange-200"
                  data-testid="display-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="bg-zinc-900 border-zinc-700 text-orange-200"
                  data-testid="phone-input"
                />
              </div>
            </div>
          </section>
          
          {/* Preferences */}
          <section>
            <h2 className="text-lg font-medium text-orange-500 flex items-center mb-4">
              <span className="mr-2">⚙️</span> Preferences
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Input 
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="bg-zinc-900 border-zinc-700 text-orange-200"
                />
              </div>
              
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Input 
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="bg-zinc-900 border-zinc-700 text-orange-200"
                />
              </div>
            </div>
          </section>
          
          {/* Notifications */}
          <section>
            <h2 className="text-lg font-medium text-orange-500 flex items-center mb-4">
              <span className="mr-2">🔔</span> Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch 
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                  data-testid="email-notifications-switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Push Notifications</Label>
                <Switch 
                  id="pushNotifications"
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                  data-testid="push-notifications-switch"
                />
              </div>
            </div>
          </section>
          
          {/* Security */}
          <section>
            <h2 className="text-lg font-medium text-orange-500 flex items-center mb-4">
              <span className="mr-2">🔒</span> Security
            </h2>
            
            <div className="space-y-4">
              <Button 
                variant="outline"
                className="w-full justify-center border-zinc-700 hover:bg-zinc-800"
                data-testid="change-password-button"
              >
                Change Password
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-center border-zinc-700 hover:bg-zinc-800"
                data-testid="enable-2fa-button"
              >
                Enable Two-Factor Authentication
              </Button>
            </div>
          </section>
          
          {/* Billing */}
          <section>
            <h2 className="text-lg font-medium text-orange-500 flex items-center mb-4">
              <span className="mr-2">💳</span> Billing
            </h2>
            
            <div className="space-y-4">
              <Button 
                variant="outline"
                className="w-full justify-center border-zinc-700 hover:bg-zinc-800"
              >
                Manage Subscription
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-center border-zinc-700 hover:bg-zinc-800"
              >
                View Payment History
              </Button>
            </div>
          </section>
          
          {/* API Keys */}
          <section>
            <h2 className="text-lg font-medium text-orange-500 flex items-center mb-4">
              <span className="mr-2">🔑</span> API Keys
            </h2>
            
            <div className="grid gap-4">
              <p className="text-zinc-300">
                Manage your API keys in the dedicated API Keys section:
              </p>
              
              <Link href="/api-keys" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition" data-testid="api-keys-link">
                <Key className="h-4 w-4" />
                <span>Go to API Keys Management</span>
              </Link>
            </div>
          </section>
          
          {/* Save Settings Button */}
          <Button 
            onClick={handleSaveSettings}
            className="w-full bg-orange-600 hover:bg-orange-700 text-black py-2 flex items-center justify-center"
            data-testid="save-settings-button"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-800 text-sm text-zinc-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-orange-500 mb-2">NameWizard.io</h3>
              <p>Intelligent file renaming solution powered by AI.</p>
              <p className="mt-1">© 2025 NameWizard AI. All rights reserved.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-orange-500 mb-2">Support</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-orange-500">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500">FAQ</a></li>
                <li><a href="#" className="hover:text-orange-500">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-orange-500 mb-2">Legal</h3>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-orange-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-500">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProfilePage;
