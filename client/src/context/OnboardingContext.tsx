import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Define the types for onboarding steps and progress
export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position: "top" | "bottom" | "left" | "right" | "center";
  points: number;
  tips?: string[];
  emoji?: string;
  requiredAction?: string;
  completed?: boolean;
};

export type OnboardingCategory = {
  id: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  completed: boolean;
  totalPoints: number;
  earnedPoints: number;
};

// Define progress tracking and profile level
export type OnboardingProfile = {
  level: number;
  experience: number;
  nextLevelThreshold: number;
  achievements: string[];
  badges: string[];
  completedCategories: string[];
  completedSteps: string[];
};

type OnboardingContextType = {
  activeStep: OnboardingStep | null;
  activeCategory: OnboardingCategory | null;
  categories: OnboardingCategory[];
  profile: OnboardingProfile;
  isOnboardingActive: boolean;
  isFirstTime: boolean;
  stepIndex: number;
  
  // Methods
  startOnboarding: (categoryId?: string) => void;
  stopOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeStep: (stepId: string) => void;
  completeCategory: (categoryId: string) => void;
  resetOnboarding: () => void;
  updateProfile: (updates: Partial<OnboardingProfile>) => void;
  checkActionCompleted: (actionName: string) => boolean;
  recordAction: (actionName: string) => void;
  
  // Analytics and AI suggestions
  suggestedNextSteps: OnboardingStep[];
  refreshSuggestions: () => void;
};

// Create the context with a default value
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Initial onboarding steps
const initialCategories: OnboardingCategory[] = [
  {
    id: "file-basics",
    title: "File Management Basics",
    description: "Learn the essentials of uploading and managing files",
    totalPoints: 150,
    earnedPoints: 0,
    completed: false,
    steps: [
      {
        id: "upload-file",
        title: "Upload Your First File",
        description: "Try uploading a file to get started with NameWizard.io",
        element: ".file-upload-card",
        position: "bottom",
        points: 25,
        emoji: "📤",
        requiredAction: "UPLOAD_FILE",
        tips: [
          "Click the upload area or drag and drop a file",
          "Supported formats include PDFs, images, and documents"
        ],
        completed: false
      },
      {
        id: "rename-file",
        title: "Rename A File",
        description: "Use AI to intelligently rename your file based on its content",
        element: ".rename-settings-card button",
        position: "right",
        points: 50,
        emoji: "✨",
        requiredAction: "RENAME_FILE",
        tips: [
          "Click 'Analyze & Rename' to use AI",
          "The AI will suggest names based on the file content"
        ],
        completed: false
      },
      {
        id: "explore-patterns",
        title: "Explore Naming Patterns",
        description: "Check out different naming patterns to organize your files",
        element: ".naming-pattern-select",
        position: "bottom",
        points: 30,
        emoji: "🔍",
        tips: [
          "Try different patterns to see previews",
          "Content-based patterns use AI to understand your files"
        ],
        completed: false
      },
      {
        id: "view-history",
        title: "View Your File History",
        description: "Check the history of your renamed files",
        element: ".file-history-tab",
        position: "top",
        points: 45,
        emoji: "📜",
        tips: [
          "Track all your file renaming operations",
          "Filter history by date or file type"
        ],
        completed: false
      }
    ]
  },
  {
    id: "ai-features",
    title: "AI Feature Exploration",
    description: "Discover the AI capabilities that make NameWizard.io special",
    totalPoints: 200,
    earnedPoints: 0,
    completed: false,
    steps: [
      {
        id: "content-categorization",
        title: "Try Content Categorization",
        description: "Let AI analyze and categorize your files into appropriate folders",
        element: ".content-categorization-card",
        position: "bottom",
        points: 60,
        emoji: "🤖",
        requiredAction: "USE_CATEGORIZATION",
        tips: [
          "Upload multiple files to see the best results",
          "AI will suggest folders based on content analysis"
        ],
        completed: false
      },
      {
        id: "setup-api-key",
        title: "Set Up an AI API Key",
        description: "Connect your own LLM API key for enhanced features",
        element: ".api-keys-section",
        position: "right",
        points: 75,
        emoji: "🔑",
        tips: [
          "Add your own OpenAI or Claude API key",
          "Customize which AI model to use for different features"
        ],
        completed: false
      },
      {
        id: "create-automation",
        title: "Create an Automation Agent",
        description: "Set up an AI agent to automatically process files",
        element: ".agents-tab",
        position: "top",
        points: 65,
        emoji: "🔄",
        tips: [
          "Agents can rename files in batch",
          "Schedule agents to run at specific times"
        ],
        completed: false
      }
    ]
  },
  {
    id: "advanced-usage",
    title: "Advanced Features",
    description: "Master the powerful advanced features",
    totalPoints: 250,
    earnedPoints: 0,
    completed: false,
    steps: [
      {
        id: "cloud-integration",
        title: "Connect Cloud Storage",
        description: "Link your cloud storage services for seamless access",
        element: ".cloud-connections-section",
        position: "bottom",
        points: 70,
        emoji: "☁️",
        tips: [
          "Connect Google Drive or Dropbox",
          "Access and rename files directly from the cloud"
        ],
        completed: false
      },
      {
        id: "custom-pattern",
        title: "Create a Custom Naming Pattern",
        description: "Design your own naming pattern for specific needs",
        element: ".custom-pattern-input",
        position: "right",
        points: 60,
        emoji: "🎨",
        tips: [
          "Use tokens like [Name], [Date], [Content]",
          "Save your pattern for future use"
        ],
        completed: false
      },
      {
        id: "batch-process",
        title: "Batch Process Files",
        description: "Process multiple files at once with consistent naming",
        element: ".batch-process-button",
        position: "bottom",
        points: 85,
        emoji: "📚",
        tips: [
          "Select multiple files to rename at once",
          "Apply the same pattern to all selected files"
        ],
        completed: false
      },
      {
        id: "folder-structure",
        title: "Set Up Folder Structure",
        description: "Create an organized folder hierarchy for your files",
        element: ".folder-management",
        position: "left",
        points: 35,
        emoji: "📁",
        tips: [
          "Create parent and child folders",
          "Move files between folders easily"
        ],
        completed: false
      }
    ]
  }
];

// Initial profile state
const initialProfile: OnboardingProfile = {
  level: 1,
  experience: 0,
  nextLevelThreshold: 100,
  achievements: [],
  badges: [],
  completedCategories: [],
  completedSteps: []
};

// Provider component that wraps the application
export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<OnboardingCategory[]>(initialCategories);
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const [activeCategory, setActiveCategory] = useState<OnboardingCategory | null>(null);
  const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [suggestedNextSteps, setSuggestedNextSteps] = useState<OnboardingStep[]>([]);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Load saved onboarding state from local storage
  useEffect(() => {
    const savedOnboarding = localStorage.getItem('onboardingState');
    const savedProfile = localStorage.getItem('onboardingProfile');
    const firstTimeUser = localStorage.getItem('firstTimeUser');
    
    if (savedOnboarding) {
      try {
        const parsed = JSON.parse(savedOnboarding);
        setCategories(parsed);
      } catch (error) {
        console.error('Failed to parse onboarding state:', error);
      }
    }
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (error) {
        console.error('Failed to parse profile state:', error);
      }
    }
    
    if (firstTimeUser === 'false') {
      setIsFirstTime(false);
    }
    
    // Start onboarding automatically for first-time users
    if (firstTimeUser !== 'false') {
      setTimeout(() => {
        startOnboarding('file-basics');
      }, 2000);
      localStorage.setItem('firstTimeUser', 'false');
    }
  }, []);
  
  // Save onboarding state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('onboardingState', JSON.stringify(categories));
    localStorage.setItem('onboardingProfile', JSON.stringify(profile));
  }, [categories, profile]);

  // Function to start onboarding process
  const startOnboarding = (categoryId?: string) => {
    let category;
    
    if (categoryId) {
      category = categories.find(c => c.id === categoryId);
    } else {
      // Find the first incomplete category
      category = categories.find(c => !c.completed);
    }
    
    if (category) {
      setActiveCategory(category);
      const firstIncompleteStep = category.steps.find(s => !s.completed);
      
      if (firstIncompleteStep) {
        setActiveStep(firstIncompleteStep);
        setStepIndex(category.steps.findIndex(s => s.id === firstIncompleteStep.id));
      } else {
        setActiveStep(category.steps[0]);
        setStepIndex(0);
      }
      
      setIsOnboardingActive(true);
    }
  };

  // Function to stop onboarding
  const stopOnboarding = () => {
    setIsOnboardingActive(false);
    setActiveStep(null);
    setActiveCategory(null);
    setStepIndex(-1);
  };

  // Move to the next step
  const nextStep = () => {
    if (activeCategory && stepIndex < activeCategory.steps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      setActiveStep(activeCategory.steps[newIndex]);
    } else if (activeCategory) {
      // We've reached the end of this category
      toast({
        title: `${activeCategory.title} Complete!`,
        description: `You've earned ${activeCategory.earnedPoints} points for this section.`,
        variant: "default",
      });
      
      // Find the next incomplete category
      const currentCategoryIndex = categories.findIndex(c => c.id === activeCategory.id);
      const nextCategory = categories.find((c, index) => index > currentCategoryIndex && !c.completed);
      
      if (nextCategory) {
        setActiveCategory(nextCategory);
        setActiveStep(nextCategory.steps[0]);
        setStepIndex(0);
      } else {
        // All categories are complete!
        stopOnboarding();
        toast({
          title: "Onboarding Complete!",
          description: "You've mastered all the basics of NameWizard.io",
          variant: "default",
        });
        
        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // Move to the previous step
  const prevStep = () => {
    if (activeCategory && stepIndex > 0) {
      const newIndex = stepIndex - 1;
      setStepIndex(newIndex);
      setActiveStep(activeCategory.steps[newIndex]);
    }
  };

  // Skip the current step
  const skipStep = () => {
    nextStep();
  };

  // Mark a step as completed
  const completeStep = (stepId: string) => {
    const updatedCategories = categories.map(category => {
      const stepIndex = category.steps.findIndex(step => step.id === stepId);
      
      if (stepIndex !== -1) {
        // Found the step in this category
        const step = category.steps[stepIndex];
        const updatedSteps = [...category.steps];
        
        // Mark the step as completed
        updatedSteps[stepIndex] = {
          ...step,
          completed: true
        };
        
        // Update earned points for the category
        const earnedPoints = category.earnedPoints + step.points;
        
        // Check if all steps in the category are now complete
        const allStepsComplete = updatedSteps.every(s => s.completed);
        
        return {
          ...category,
          steps: updatedSteps,
          earnedPoints: earnedPoints,
          completed: allStepsComplete
        };
      }
      
      return category;
    });
    
    setCategories(updatedCategories);
    
    // Update profile with the completed step
    if (!profile.completedSteps.includes(stepId)) {
      const step = categories.flatMap(c => c.steps).find(s => s.id === stepId);
      
      if (step) {
        // Add XP to profile
        const newExperience = profile.experience + step.points;
        const updatedProfile = { ...profile };
        updatedProfile.experience = newExperience;
        updatedProfile.completedSteps = [...profile.completedSteps, stepId];
        
        // Check for level up
        if (newExperience >= profile.nextLevelThreshold) {
          updatedProfile.level = profile.level + 1;
          updatedProfile.nextLevelThreshold = Math.floor(profile.nextLevelThreshold * 1.5);
          
          // Celebrate level up
          toast({
            title: "Level Up!",
            description: `You've reached level ${updatedProfile.level}!`,
            variant: "default",
          });
          
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        
        setProfile(updatedProfile);
      }
    }
    
    // Move to the next step
    nextStep();
  };

  // Mark a category as completed
  const completeCategory = (categoryId: string) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        // Mark all steps in the category as completed
        const updatedSteps = category.steps.map(step => ({
          ...step,
          completed: true
        }));
        
        // Calculate total points for the category
        const totalPointsEarned = updatedSteps.reduce((sum, step) => sum + step.points, 0);
        
        return {
          ...category,
          steps: updatedSteps,
          earnedPoints: totalPointsEarned,
          completed: true
        };
      }
      
      return category;
    });
    
    setCategories(updatedCategories);
    
    // Update profile with the completed category
    if (!profile.completedCategories.includes(categoryId)) {
      setProfile({
        ...profile,
        completedCategories: [...profile.completedCategories, categoryId]
      });
      
      // Give a badge for completing the category
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        toast({
          title: `${category.title} Mastered!`,
          description: `You've earned the ${category.title} badge!`,
          variant: "default",
        });
      }
    }
  };

  // Reset onboarding progress
  const resetOnboarding = () => {
    setCategories(initialCategories);
    setProfile(initialProfile);
    setActiveStep(null);
    setActiveCategory(null);
    setStepIndex(-1);
    setIsOnboardingActive(false);
    setIsFirstTime(true);
    localStorage.removeItem('onboardingState');
    localStorage.removeItem('onboardingProfile');
    localStorage.removeItem('firstTimeUser');
  };

  // Update profile with partial changes
  const updateProfile = (updates: Partial<OnboardingProfile>) => {
    setProfile({ ...profile, ...updates });
  };

  // Record user actions for tracking completed steps
  const recordAction = (actionName: string) => {
    if (!completedActions.includes(actionName)) {
      setCompletedActions([...completedActions, actionName]);
      
      // Check if this action completes any steps
      const stepToComplete = categories
        .flatMap(c => c.steps)
        .find(s => s.requiredAction === actionName && !s.completed);
      
      if (stepToComplete) {
        completeStep(stepToComplete.id);
      }
    }
  };

  // Check if an action has been completed
  const checkActionCompleted = (actionName: string) => {
    return completedActions.includes(actionName);
  };

  // Refresh AI-suggested next steps
  const refreshSuggestions = async () => {
    try {
      // Find all incomplete steps
      const allIncompleteSteps = categories
        .flatMap(c => c.steps.filter(s => !s.completed))
        .map(step => ({
          id: step.id,
          title: step.title,
          points: step.points
        }));
      
      // In a real implementation, you would call an AI endpoint to get smart suggestions
      // For now, just sort by points (prioritizing higher-point steps)
      const sortedSteps = allIncompleteSteps.sort((a, b) => b.points - a.points);
      
      // Take the top 3 suggestions
      const topSuggestions = sortedSteps.slice(0, 3);
      
      // Map back to full step objects
      const suggestedSteps = topSuggestions.map(suggestion => {
        const fullStep = categories
          .flatMap(c => c.steps)
          .find(s => s.id === suggestion.id);
        return fullStep!;
      });
      
      setSuggestedNextSteps(suggestedSteps);
    } catch (error) {
      console.error('Failed to refresh suggestions:', error);
    }
  };

  // Generate suggestions when profile or categories change
  useEffect(() => {
    refreshSuggestions();
  }, [profile, categories]);

  // The context value that will be provided
  const contextValue: OnboardingContextType = {
    activeStep,
    activeCategory,
    categories,
    profile,
    isOnboardingActive,
    isFirstTime,
    stepIndex,
    startOnboarding,
    stopOnboarding,
    nextStep,
    prevStep,
    skipStep,
    completeStep,
    completeCategory,
    resetOnboarding,
    updateProfile,
    checkActionCompleted,
    recordAction,
    suggestedNextSteps,
    refreshSuggestions
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
};