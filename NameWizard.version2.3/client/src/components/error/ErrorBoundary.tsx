import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child
 * component tree and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 bg-background border border-muted rounded-lg shadow-sm my-4">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center">
            We've encountered an error and are working to fix it.
          </p>
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={this.handleReset}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-4 p-4 bg-muted rounded text-xs overflow-auto max-h-48">
                <p className="font-medium">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Higher-order component to wrap any component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onReset?: () => void
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onReset={onReset}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}