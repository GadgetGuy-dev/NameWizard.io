import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  /**
   * Size of the loading indicator
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * Optional text to display next to the loading spinner
   */
  text?: string;
  
  /**
   * Whether to center the loading indicator
   */
  centered?: boolean;
  
  /**
   * Show a transparent overlay over content
   */
  overlay?: boolean;
  
  /**
   * Custom CSS class
   */
  className?: string;
}

/**
 * Loading indicator component for showing loading states throughout the application
 */
export function LoadingIndicator({
  size = "md",
  text,
  centered = false,
  overlay = false,
  className = ""
}: LoadingIndicatorProps) {
  // Determine the size of the spinner based on the size prop
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  const spinnerSize = sizeMap[size];
  
  // Build the component's base classes
  const containerClasses = [
    "flex items-center gap-2",
    centered ? "justify-center" : "",
    overlay ? "absolute inset-0 bg-background/80 backdrop-blur-sm z-50" : "",
    className
  ].filter(Boolean).join(" ");
  
  return (
    <div className={containerClasses}>
      <Loader2 className={`${spinnerSize} animate-spin text-primary`} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

/**
 * Full page overlay loading indicator
 */
export function PageLoadingIndicator({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-card-foreground">{text}</p>
      </div>
    </div>
  );
}

/**
 * Content area loading indicator that preserves layout space
 */
export function ContentLoadingIndicator({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center my-8">
      <LoadingIndicator size="md" text={text} centered />
    </div>
  );
}

/**
 * Button loading indicator that replaces button content
 */
export function ButtonLoadingIndicator({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text && <span>{text}</span>}
    </div>
  );
}

/**
 * Skeleton placeholder for content that's still loading
 */
export function SkeletonPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );
}