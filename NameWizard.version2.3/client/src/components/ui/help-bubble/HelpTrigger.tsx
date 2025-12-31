import { useEffect, useState } from "react";
import { useHelpBubble } from "@/context/HelpBubbleContext";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpTriggerProps {
  helpId: string;
  autoShow?: boolean;
  children: React.ReactNode;
}

export function HelpTrigger({ helpId, autoShow = false, children }: HelpTriggerProps) {
  const { showHelp, hideHelp, helpVisibilityEnabled } = useHelpBubble();
  const [isHelpActive, setIsHelpActive] = useState(false);

  // Handle toggling the help for this section
  const toggleHelp = () => {
    if (helpVisibilityEnabled) {
      if (isHelpActive) {
        hideHelp();
        setIsHelpActive(false);
      } else {
        showHelp(helpId);
        setIsHelpActive(true);
      }
    }
  };

  // Reset help state when global help visibility changes
  useEffect(() => {
    if (!helpVisibilityEnabled) {
      setIsHelpActive(false);
    }
  }, [helpVisibilityEnabled]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-40 h-7 w-7 rounded-full bg-background/80"
        onClick={toggleHelp}
        title={isHelpActive ? "Hide help" : "Show help"}
      >
        <HelpCircle className={`h-4 w-4 ${isHelpActive ? "text-orange-500" : "text-gray-400"}`} />
      </Button>
      {children}
    </div>
  );
}