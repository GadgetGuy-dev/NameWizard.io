import { useHelpBubble } from "@/context/HelpBubbleContext";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { HelpBubble } from "./HelpBubble";

export function ActiveHelpBubble() {
  const { activeHelpContent, helpVisibilityEnabled, toggleHelpVisibility } = useHelpBubble();
  
  return (
    <>
      {/* Global help toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 h-8 w-8 rounded-full"
        onClick={toggleHelpVisibility}
        title={helpVisibilityEnabled ? "Disable help bubbles" : "Enable help bubbles"}
      >
        <HelpCircle className={`h-4 w-4 ${!helpVisibilityEnabled && "text-gray-400"}`} />
      </Button>
      
      {/* Display the active help bubble if available */}
      {activeHelpContent && helpVisibilityEnabled && (
        <HelpBubble
          title={activeHelpContent.title}
          description={activeHelpContent.description}
          context={activeHelpContent.context}
          mascotVariant={activeHelpContent.mascotVariant}
          learnMoreLink={activeHelpContent.learnMoreLink}
          expanded={true}
          placement="bottom-right"
        />
      )}
    </>
  );
}