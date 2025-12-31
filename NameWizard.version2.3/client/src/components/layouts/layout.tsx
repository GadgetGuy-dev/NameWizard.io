import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutGrid, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  Settings2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">
            <Link href="/">
              <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-transparent bg-clip-text cursor-pointer">
                NameWizard.io
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <NavLink href="/" isActive={location === "/"}>
                  Dashboard
                </NavLink>
                <NavLink href="/files" isActive={location === "/files"}>
                  My Files
                </NavLink>
                <NavLink href="/features" isActive={location === "/features"}>
                  Features
                </NavLink>
                <div className="relative group">
                  <button className="flex items-center text-zinc-400 hover:text-white transition-colors">
                    <User className="h-5 w-5 mr-1" />
                    <span className="max-w-[100px] truncate">{user.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all origin-top-right z-50">
                    <div className="py-2">
                      <div className="flex items-center px-4 py-2 text-sm hover:bg-zinc-700 transition-colors cursor-pointer"
                           onClick={() => window.location.href = "/profile"}>
                        <Settings2 className="h-4 w-4 mr-2" />
                        Profile Settings
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm hover:bg-zinc-700 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink href="/features" isActive={location === "/features"}>
                  Features
                </NavLink>
                <Link href="/auth">
                  <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer inline-block">
                    Get Started
                  </span>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-800 border-t border-zinc-700 pb-4">
            <div className="container mx-auto px-4 pt-4 flex flex-col space-y-4">
              {user ? (
                <>
                  <MobileNavLink href="/" onClick={toggleMobileMenu}>
                    <LayoutGrid className="h-5 w-5 mr-2" /> Dashboard
                  </MobileNavLink>
                  <MobileNavLink href="/files" onClick={toggleMobileMenu}>
                    <FileText className="h-5 w-5 mr-2" /> My Files
                  </MobileNavLink>
                  <MobileNavLink href="/features" onClick={toggleMobileMenu}>
                    <Sparkles className="h-5 w-5 mr-2" /> Features
                  </MobileNavLink>
                  <MobileNavLink href="/profile" onClick={toggleMobileMenu}>
                    <Settings className="h-5 w-5 mr-2" /> Profile Settings
                  </MobileNavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="flex items-center px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Log Out
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/features" onClick={toggleMobileMenu}>
                    <Sparkles className="h-5 w-5 mr-2" /> Features
                  </MobileNavLink>
                  <MobileNavLink href="/auth" onClick={toggleMobileMenu}>
                    <LogIn className="h-5 w-5 mr-2" /> Get Started
                  </MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-800 border-t border-zinc-700 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">NameWizard.io</h4>
              <p className="text-zinc-400 text-sm">
                Advanced AI-powered file management tools to simplify your workflow.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/features#sync">
                    <span className="hover:text-white transition-colors cursor-pointer">File Sync</span>
                  </Link>
                </li>
                <li>
                  <Link href="/features#categorization">
                    <span className="hover:text-white transition-colors cursor-pointer">Content Categorization</span>
                  </Link>
                </li>
                <li>
                  <Link href="/features#optimization">
                    <span className="hover:text-white transition-colors cursor-pointer">File Optimization</span>
                  </Link>
                </li>
                <li>
                  <Link href="/features#preview">
                    <span className="hover:text-white transition-colors cursor-pointer">File Preview</span>
                  </Link>
                </li>
                <li>
                  <Link href="/features#annotation">
                    <span className="hover:text-white transition-colors cursor-pointer">File Annotation</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/about">
                    <span className="hover:text-white transition-colors cursor-pointer">About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-700 text-center text-zinc-400 text-sm">
            <p>&copy; {new Date().getFullYear()} NameWizard.io. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Navigation Links for desktop
interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, isActive, children }) => {
  return (
    <Link href={href}>
      <span
        className={`text-sm font-medium transition-colors cursor-pointer ${
          isActive ? "text-white" : "text-zinc-400 hover:text-white"
        }`}
      >
        {children}
      </span>
    </Link>
  );
};

// Navigation Links for mobile
interface MobileNavLinkProps {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, onClick, children }) => {
  return (
    <Link href={href}>
      <span
        className="flex items-center px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
        onClick={onClick}
      >
        {children}
      </span>
    </Link>
  );
};

// Need to import this icon
const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3l1.87 5.13L19 10l-5.13 1.87L12 17l-1.87-5.13L5 10l5.13-1.87z" />
    <path d="M5 3l.5 2L8 6l-2.5.5L5 10l-.5-3.5L2 6l2.5-.5z" />
    <path d="M18 3l.5 2L21 6l-2.5.5L18 10l-.5-3.5L15 6l2.5-.5z" />
  </svg>
);

// Need to import this icon
const LogIn: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export default Layout;