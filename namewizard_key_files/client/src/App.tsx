import React from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { BatchProcessingProvider } from '@/context/BatchProcessingContext';
import { ProtectedRoute } from '@/lib/protected-route';
import { ThemeProvider } from '@/context/ThemeContext';

// Pages
import HomePage from '@/pages/home-page';
import AuthPage from '@/pages/auth-page';
import NotFound from '@/pages/not-found';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BatchProcessingProvider>
            <div className="min-h-screen bg-background">
              <main>
                <Switch>
                  <ProtectedRoute path="/" component={HomePage} />
                  <Route path="/auth" component={AuthPage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Toaster />
            </div>
          </BatchProcessingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;