import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  Settings, 
  FileArchive, 
  PanelLeft, 
  User, 
  LogOut,
  Bot,
  Brain,
  CreditCard,
  HelpCircle,
  LogIn,
  UserPlus,
  Clock,
  FileText,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { href: '/features', label: 'Features', icon: <Layout className="w-4 h-4" /> },
    { href: '/pricing', label: 'Pricing', icon: <CreditCard className="w-4 h-4" /> },
    { href: '/help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Top navigation */}
      <header className="border-b border-zinc-800 bg-black">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-500">NameWizard.io</span>
            </Link>
            <p className="ml-4 text-gray-400 hidden md:block">Rename your files with ease</p>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* New Home button */}
            <Link href="/">
              <Button variant="ghost" className="text-gray-300 hover:text-white px-2">
                <Home className="h-4 w-4" />
                <span className="ml-1 text-sm">Home</span>
              </Button>
            </Link>
            
            {/* New Files button */}
            <Link href="/files">
              <Button variant="ghost" className="text-gray-300 hover:text-white px-2">
                <FileText className="h-4 w-4" />
                <span className="ml-1 text-sm">Files</span>
              </Button>
            </Link>
            
            {!user ? (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="border-zinc-700 text-gray-300 hover:text-white text-sm px-3 py-1">
                    <LogIn className="mr-1 h-3 w-3" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1">
                    <UserPlus className="mr-1 h-3 w-3" />
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center justify-start overflow-hidden rounded-full p-2 text-gray-300 hover:text-white hover:bg-zinc-900">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-700">
                  <DropdownMenuLabel className="text-gray-200 font-semibold">
                    <div>
                      <p className="font-medium text-gray-200">{user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer w-full flex items-center text-gray-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      <Home className="mr-2 h-4 w-4" />
                      <span className="font-medium">Home</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/file-history" className="cursor-pointer w-full flex items-center text-gray-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      <Clock className="mr-2 h-4 w-4" />
                      <span className="font-medium">File History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/agents" className="cursor-pointer w-full flex items-center text-gray-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      <Bot className="mr-2 h-4 w-4 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">AI Agents</span>
                        <span className="text-xs text-gray-400">Manage & configure automated assistants</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full flex items-center text-gray-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuLabel className="text-gray-200 font-semibold">
                    <span>AI Features</span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/ai-features" className="cursor-pointer w-full flex items-center text-gray-300 hover:text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white">
                      <Brain className="mr-2 h-4 w-4 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">AI Features</span>
                        <span className="text-xs text-gray-400">Manage & configure AI features</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-700" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-400 hover:bg-zinc-800 focus:bg-zinc-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      
      {/* Secondary navigation */}
      {user && (
        <div className="border-b border-zinc-800 bg-zinc-950">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-3 ${
                    isActive(item.href)
                      ? 'text-orange-500 border-b-2 border-orange-500'
                      : 'text-gray-300 hover:text-white'
                  } transition-colors`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2 text-sm">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 bg-zinc-950">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;