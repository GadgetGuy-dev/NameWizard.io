import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of our help content
interface HelpContent {
  id: string;
  title: string;
  description: string;
  context: string;
  mascotVariant?: "default" | "thinking" | "excited" | "confused";
  learnMoreLink?: string;
}

// Default help content organized by section 
const defaultHelpContent: Record<string, HelpContent> = {
  // File Upload Section
  "file-upload": {
    id: "file-upload",
    title: "Upload Your Files",
    description: "Drag and drop files or click to select them from your computer. NameWizard.io supports various file types including documents, images, and spreadsheets.",
    context: "File Upload Area",
    mascotVariant: "excited",
    learnMoreLink: "#file-upload-help"
  },
  
  // API Keys Section
  "api-keys": {
    id: "api-keys",
    title: "Managing API Keys",
    description: "Connect your AI service accounts by adding API keys. These keys allow NameWizard to use advanced AI features for analyzing your files.",
    context: "API Key Management",
    mascotVariant: "thinking",
    learnMoreLink: "#api-keys-help"
  },
  
  // Cloud Connections Section
  "cloud-connections": {
    id: "cloud-connections",
    title: "Cloud Storage Integration",
    description: "Link your cloud storage accounts like Google Drive or Dropbox to process files directly from the cloud.",
    context: "Cloud Connection",
    mascotVariant: "default",
    learnMoreLink: "#cloud-connections-help"
  },
  
  // Content Categorization
  "content-categorization": {
    id: "content-categorization",
    title: "Content Categorization",
    description: "NameWizard.io can analyze your files and automatically organize them into appropriate categories based on their content.",
    context: "Content Categorization",
    mascotVariant: "thinking",
    learnMoreLink: "#categorization-help"
  },
  
  // Agent Management
  "agent-management": {
    id: "agent-management",
    title: "Automated Agents",
    description: "Set up intelligent agents to automatically process, rename, and organize your files using AI.",
    context: "Agent Management",
    mascotVariant: "excited",
    learnMoreLink: "#agents-help"
  },
  
  // Batch Processing
  "batch-processing": {
    id: "batch-processing",
    title: "Batch Processing",
    description: "Process multiple files at once to save time. Apply the same naming patterns across your entire selection.",
    context: "Batch Operations",
    mascotVariant: "default",
    learnMoreLink: "#batch-help"
  },
  
  // File History
  "file-history": {
    id: "file-history",
    title: "File History Tracking",
    description: "Keep track of all your processed files and their changes over time for better organization and reference.",
    context: "File History",
    mascotVariant: "default",
    learnMoreLink: "#history-help"
  }
};

// Define the shape of our context
interface HelpBubbleContextType {
  activeHelpContent: HelpContent | null;
  showHelp: (id: string) => void;
  hideHelp: () => void;
  helpVisibilityEnabled: boolean;
  toggleHelpVisibility: () => void;
  allHelpContent: Record<string, HelpContent>;
  updateHelpContent: (id: string, updates: Partial<HelpContent>) => void;
}

// Create the context with default values
const HelpBubbleContext = createContext<HelpBubbleContextType>({
  activeHelpContent: null,
  showHelp: () => {},
  hideHelp: () => {},
  helpVisibilityEnabled: true,
  toggleHelpVisibility: () => {},
  allHelpContent: defaultHelpContent,
  updateHelpContent: () => {}
});

// Provider component
export function HelpBubbleProvider({ children }: { children: ReactNode }) {
  const [activeHelpContent, setActiveHelpContent] = useState<HelpContent | null>(null);
  const [helpVisibilityEnabled, setHelpVisibilityEnabled] = useState(true);
  const [helpContent, setHelpContent] = useState(defaultHelpContent);

  const showHelp = (id: string) => {
    if (helpVisibilityEnabled && helpContent[id]) {
      setActiveHelpContent(helpContent[id]);
    }
  };

  const hideHelp = () => {
    setActiveHelpContent(null);
  };

  const toggleHelpVisibility = () => {
    setHelpVisibilityEnabled(!helpVisibilityEnabled);
    if (helpVisibilityEnabled) {
      // If we're disabling help, also hide any active help
      setActiveHelpContent(null);
    }
  };

  const updateHelpContent = (id: string, updates: Partial<HelpContent>) => {
    setHelpContent(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates
      }
    }));

    // If this content is currently active, update it
    if (activeHelpContent?.id === id) {
      setActiveHelpContent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <HelpBubbleContext.Provider
      value={{
        activeHelpContent,
        showHelp,
        hideHelp,
        helpVisibilityEnabled,
        toggleHelpVisibility,
        allHelpContent: helpContent,
        updateHelpContent
      }}
    >
      {children}
    </HelpBubbleContext.Provider>
  );
}

// Custom hook for using the help bubble context
export function useHelpBubble() {
  const context = useContext(HelpBubbleContext);
  if (context === undefined) {
    throw new Error("useHelpBubble must be used within a HelpBubbleProvider");
  }
  return context;
}