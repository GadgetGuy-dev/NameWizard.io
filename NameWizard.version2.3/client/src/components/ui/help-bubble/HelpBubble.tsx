import React, { useState } from "react";
import { MascotAvatar } from "./MascotAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpBubbleProps {
  title: string;
  description: string;
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  context: string;
  className?: string;
  mascotVariant?: "default" | "thinking" | "excited" | "confused";
  expanded?: boolean;
  learnMoreLink?: string;
}

export function HelpBubble({
  title,
  description,
  placement = "bottom-right",
  context,
  className,
  mascotVariant = "default",
  expanded = false,
  learnMoreLink
}: HelpBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showDialog, setShowDialog] = useState(false);

  // Calculate position styles based on placement
  const getPositionStyles = () => {
    switch (placement) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
      default:
        return "bottom-4 right-4";
    }
  };

  return (
    <>
      {/* Fixed help bubble */}
      <div 
        className={cn(
          "fixed z-50 flex items-start transition-all duration-300",
          getPositionStyles(),
          className
        )}
      >
        <div 
          className={cn(
            "flex items-start bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 overflow-hidden",
            isExpanded ? "p-4 max-w-xs" : "p-2"
          )}
        >
          {/* Mascot avatar always visible */}
          <button 
            className="flex-shrink-0 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse help" : "Expand help"}
          >
            <MascotAvatar variant={mascotVariant} className="w-10 h-10" />
          </button>

          {/* Content only visible when expanded */}
          {isExpanded && (
            <div className="ml-3 flex flex-col">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                {description}
              </p>
              <div className="flex justify-end mt-2 space-x-2">
                {learnMoreLink && (
                  <a 
                    href={learnMoreLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Learn more
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setShowDialog(true)}
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  See more
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed help dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <MascotAvatar variant={mascotVariant} className="w-8 h-8" />
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription>
              Context: {context}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>{description}</p>
            {learnMoreLink && (
              <div className="pt-2 border-t">
                <a 
                  href={learnMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 flex items-center"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Learn more about this feature
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}