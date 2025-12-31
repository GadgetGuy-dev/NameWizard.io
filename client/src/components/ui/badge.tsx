import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "border-transparent bg-orange-500 text-white",
      secondary: "border-transparent bg-zinc-700 text-gray-300",
      destructive: "border-transparent bg-red-500/20 text-red-400",
      outline: "border-zinc-700 text-gray-300",
      success: "border-transparent bg-green-500/20 text-green-400",
      warning: "border-transparent bg-amber-500/20 text-amber-400",
      error: "border-transparent bg-red-500/20 text-red-400",
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          variantClasses,
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }