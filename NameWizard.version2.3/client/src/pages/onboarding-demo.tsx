import { useEffect } from "react";
import { OnboardingDashboard } from "@/components/onboarding/OnboardingDashboard";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Book, Sparkles, Trophy } from "lucide-react";

export default function OnboardingDemo() {
  const { startOnboarding, recordAction, refreshSuggestions } = useOnboarding();
  const { toast } = useToast();

  // Refresh suggestions on page load
  useEffect(() => {
    refreshSuggestions();
  }, [refreshSuggestions]);

  // Simulate completing an action
  const simulateAction = (actionName: string, description: string) => {
    recordAction(actionName);
    
    toast({
      title: "Action Completed",
      description: description,
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">Onboarding Experience</h1>
      
      {/* Dashboard section */}
      <OnboardingDashboard />
      
      {/* Demo Actions */}
      <div className="bg-black border border-zinc-800 rounded-lg p-5 mb-6">
        <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-orange-500" />
          Demo Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-200 mb-2 flex items-center">
              <Book className="h-4 w-4 mr-2 text-orange-500" />
              File Management
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Try out basic file management actions.</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAction("UPLOAD_FILE", "You've uploaded a file!")}
                className="w-full justify-start"
              >
                Upload a File
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAction("RENAME_FILE", "You've renamed a file with AI!")}
                className="w-full justify-start"
              >
                Rename a File
              </Button>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-200 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
              AI Features
            </h3>
            <p className="text-sm text-zinc-400 mb-4">Explore AI-powered features.</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAction("USE_CATEGORIZATION", "Files categorized with AI!")}
                className="w-full justify-start"
              >
                Categorize Files
              </Button>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-200 mb-2">Start Tours</h3>
            <p className="text-sm text-zinc-400 mb-4">Start guided tours of different features.</p>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startOnboarding("file-basics")}
                className="w-full justify-start"
              >
                File Basics Tour
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startOnboarding("ai-features")}
                className="w-full justify-start"
              >
                AI Features Tour
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startOnboarding("advanced-usage")}
                className="w-full justify-start"
              >
                Advanced Features Tour
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-zinc-500 mt-8">
        <p>
          The onboarding system helps users learn your application through guided tours,
          gamification, and contextual help.
        </p>
        <p className="mt-2">
          Users earn points, level up, and receive badges for completing different parts of the
          application.
        </p>
      </div>
    </div>
  );
}