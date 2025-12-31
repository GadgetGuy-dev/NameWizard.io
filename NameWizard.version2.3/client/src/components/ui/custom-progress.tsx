import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

const CustomProgress = React.forwardRef<HTMLDivElement, CustomProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-zinc-800",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-all", indicatorClassName || "bg-primary")}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    );
  }
);

CustomProgress.displayName = "CustomProgress";

export { CustomProgress };