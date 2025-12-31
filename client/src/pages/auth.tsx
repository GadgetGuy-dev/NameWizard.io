import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginMutation, registerMutation, user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // If user is already logged in, redirect to home page
  if (user) {
    setLocation('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ username, password });
      } else {
        // Check for empty fields to provide better feedback
        if (!username.trim()) {
          toast({
            title: 'Username Required',
            description: 'Please enter a username',
            variant: 'destructive',
          });
          return;
        }
        
        if (!email.trim()) {
          toast({
            title: 'Email Required',
            description: 'Please enter an email address',
            variant: 'destructive',
          });
          return;
        }
        
        if (!password.trim() || password.length < 6) {
          toast({
            title: 'Invalid Password',
            description: 'Password must be at least 6 characters',
            variant: 'destructive',
          });
          return;
        }
        
        await registerMutation.mutateAsync({ username, email, password });
      }
    } catch (error: any) {
      // Extract and show specific error messages
      let errorMessage = error.message || 'An error occurred';
      let errorTitle = isLogin ? 'Login Failed' : 'Registration Failed';
      
      // Custom handling for specific error messages
      if (errorMessage.includes('Username already exists')) {
        errorTitle = 'Username Taken';
        errorMessage = 'This username is already in use. Please choose a different username.';
      } else if (errorMessage.includes('Email already exists')) {
        errorTitle = 'Email Already Registered';
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Top navigation */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-bold text-orange-500">NameWizard.io</span>
            </Link>
            <p className="ml-4 text-gray-400 hidden md:block">Rename your files with ease</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant={isLogin ? "default" : "outline"} 
                className={isLogin 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "border-zinc-700 text-gray-300 hover:text-white"
                }
                onClick={() => setIsLogin(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant={!isLogin ? "default" : "outline"}
                className={!isLogin 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "border-zinc-700 text-gray-300 hover:text-white"
                }
                onClick={() => setIsLogin(false)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 bg-zinc-950">
        <div className="container mx-auto p-6">
          <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto mt-8 gap-8">
            {/* Auth Form */}
            <div className="w-full md:w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? 'Login to NameWizard.io' : 'Create an Account'}
                </h2>
                <p className="text-gray-300">
                  {isLogin
                    ? 'Welcome back! Please enter your credentials.'
                    : 'Join today and start organizing your files like a pro.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="username-input" className="block text-sm font-medium text-gray-300 mb-1">
                      {isLogin ? 'Username or Email' : 'Username'}
                    </label>
                    {!isLogin && (
                      <span className="text-orange-500 text-xs">Try: demo123, user304, wizard99</span>
                    )}
                  </div>
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={isLogin ? "Enter username or email" : "Choose a username"}
                    required
                    data-testid="input-username"
                    autoComplete="username"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email
                        </label>
                        <span className="text-orange-500 text-xs">Available example: demo@namewizard.io</span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div className="text-xs bg-zinc-800 p-3 rounded border border-orange-900">
                      <p className="text-orange-300 font-medium mb-1">Account Creation Tips:</p>
                      <ul className="text-gray-300 space-y-1 list-disc pl-5">
                        <li>Choose a unique username (already taken: testuser, mrbrown188)</li>
                        <li>Use a strong password with at least 6 characters</li>
                        <li>Use a valid email format (e.g., user@example.com)</li>
                      </ul>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    data-testid="input-password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
                    disabled={loginMutation.isPending || registerMutation.isPending}
                    data-testid="button-submit"
                  >
                    {loginMutation.isPending || registerMutation.isPending ? (
                      'Processing...'
                    ) : isLogin ? (
                      'Login'
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-orange-500 hover:text-orange-400 text-sm"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Login'}
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-zinc-900 to-black rounded-lg p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold mb-4">
                <span className="text-orange-500">Revolutionize</span> Your File Management
              </h1>
              <p className="text-gray-300 mb-6">
                NameWizard.io uses advanced AI to intelligently rename and organize your files, saving you hours of manual work.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-orange-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">AI-Powered Renaming</h3>
                    <p className="text-gray-400 text-sm">
                      Our AI analyzes file content to create meaningful, descriptive filenames
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-orange-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Batch Processing</h3>
                    <p className="text-gray-400 text-sm">
                      Rename thousands of files at once with consistent naming patterns
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-orange-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Multiple File Formats</h3>
                    <p className="text-gray-400 text-sm">
                      Works with documents, images, audio files, and more
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2025 NameWizard.io. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;