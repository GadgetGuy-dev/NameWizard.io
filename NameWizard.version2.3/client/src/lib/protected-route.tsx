import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Route, Redirect } from 'wouter';

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  requiredRole?: 'user' | 'admin' | 'god_admin';
};

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole = 'user',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Check for required role
        const hasRequiredRole = () => {
          if (requiredRole === 'user') return true;
          if (requiredRole === 'admin') return user.role === 'admin' || user.role === 'god_admin';
          if (requiredRole === 'god_admin') return user.role === 'god_admin';
          return false;
        };

        if (!hasRequiredRole()) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
              <ShieldAlert className="h-16 w-16 text-orange-500 mb-6" />
              <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
              <p className="text-muted-foreground max-w-md mb-8">
                You need {requiredRole === 'admin' ? 'administrator' : 'god administrator'} privileges to access this section.
              </p>
              <a href="/" className="text-orange-500 hover:text-orange-400 underline">
                Return to Home
              </a>
            </div>
          );
        }

        return <Component />;
      }}
    </Route>
  );
}

export function AdminRoute({
  path,
  component: Component,
}: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return <ProtectedRoute path={path} component={Component} requiredRole="admin" />;
}

export function GodAdminRoute({
  path,
  component: Component,
}: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return <ProtectedRoute path={path} component={Component} requiredRole="god_admin" />;
}