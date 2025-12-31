import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  Key, 
  LogOut, 
  FileIcon, 
  FileText, 
  FolderOpen, 
  History, 
  Shield,
  Database,
  Activity,
  RefreshCw,
  KeyRound,
  Cloud,
  Zap,
  LayoutDashboard,
  Crown
} from 'lucide-react';

const PLAN_COLORS: Record<string, string> = {
  god: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white",
  free: "bg-gray-600 text-gray-100",
  credits_low: "bg-blue-600 text-blue-100",
  credits_high: "bg-purple-600 text-purple-100",
  unlimited: "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
};

const PLAN_LABELS: Record<string, string> = {
  god: "God",
  free: "Free",
  credits_low: "Basic",
  credits_high: "Pro",
  unlimited: "Unlimited"
};

const Navbar = () => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/auth');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container max-w-7xl mx-auto py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex flex-col">
            <span className="font-bold text-xl text-orange-500 hover:text-orange-400 transition">NameWizard.io</span>
            <span className="text-xs text-gray-400">Rename your files with ease</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-300 hover:text-orange-400 transition">
              Pricing
            </Link>
            <Link href="/ai-features" className="text-gray-300 hover:text-orange-400 transition">
              AI Features
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-zinc-800">
                    <AvatarFallback className="bg-orange-500 text-white">
                      {getUserInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-orange-200" align="end" forceMount>
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span className="text-orange-500 font-bold">My Account</span>
                  {(() => {
                    const isGodAdmin = user?.role === 'god_admin';
                    const planType = (user as any)?.planType || 'free';
                    const displayType = isGodAdmin ? 'god' : planType;
                    const showCrown = isGodAdmin || planType === 'unlimited';
                    return (
                      <Badge className={PLAN_COLORS[displayType] || PLAN_COLORS.free} data-testid="badge-plan">
                        {showCrown && <Crown className="h-3 w-3 mr-1" />}
                        {PLAN_LABELS[displayType] || "Free"}
                      </Badge>
                    );
                  })()}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/api-keys" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <Cloud className="mr-2 h-4 w-4" />
                    <span>Cloud Storage</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/subscription" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuLabel className="text-orange-500 font-bold">
                  Renaming Options
                </DropdownMenuLabel>
                
                <DropdownMenuItem asChild>
                  <Link href="/bulk-rename" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <FileIcon className="mr-2 h-4 w-4" />
                    <span>Bulk Rename</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/magic-folders" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>Magic Folders</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/renaming-templates" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Renaming Templates</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuLabel className="text-orange-500 font-bold">
                  Activity
                </DropdownMenuLabel>
                
                <DropdownMenuItem asChild>
                  <Link href="/history" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </Link>
                </DropdownMenuItem>
                
                {user && (user.role === 'admin' || user.role === 'god_admin') && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuLabel className="text-orange-500 font-bold">
                      <Shield className="inline-block mr-1 h-4 w-4" /> Admin Controls
                    </DropdownMenuLabel>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400" data-testid="link-admin-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/admin/api-management" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                        <KeyRound className="mr-2 h-4 w-4" />
                        <span>API Key Management</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/api-dashboard" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                        <Zap className="mr-2 h-4 w-4" />
                        <span>API Key Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/admin/system-status" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                        <Activity className="mr-2 h-4 w-4" />
                        <span>System Status</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/admin/auto-testing" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Auto Testing</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/admin/key-backups" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                        <Cloud className="mr-2 h-4 w-4" />
                        <span>Backup & Restore</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {user.role === 'god_admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400" data-testid="link-admin-users">
                            <User className="mr-2 h-4 w-4" />
                            <span>User Management</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/api-metrics" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400" data-testid="link-admin-metrics">
                            <Zap className="mr-2 h-4 w-4" />
                            <span>API Metrics</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/db-management" className="w-full flex items-center cursor-pointer text-orange-200 hover:text-orange-400">
                            <Database className="mr-2 h-4 w-4" />
                            <span>DB Management</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-orange-200 hover:text-orange-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
