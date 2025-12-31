import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding, OnboardingCategory } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronDown,
  Award,
  Star,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  Lightbulb
} from "lucide-react";

type CategoryCardProps = {
  category: OnboardingCategory;
  onClick: () => void;
  isActive: boolean;
};

function CategoryCard({ category, onClick, isActive }: CategoryCardProps) {
  const completedSteps = category.steps.filter((step) => step.completed).length;
  const progress = (completedSteps / category.steps.length) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-zinc-900 border ${
        isActive ? "border-orange-500" : "border-zinc-800"
      } rounded-lg p-4 cursor-pointer transition-all`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start">
          <div className="bg-orange-600/20 p-2 rounded-md mr-3 mt-1">
            {category.id === "file-basics" ? (
              <BookOpen className="h-5 w-5 text-orange-500" />
            ) : category.id === "ai-features" ? (
              <Sparkles className="h-5 w-5 text-orange-500" />
            ) : (
              <Star className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">{category.title}</h3>
            <p className="text-sm text-zinc-500 mt-1">{category.description}</p>
          </div>
        </div>
        <ChevronRight className={`h-5 w-5 text-zinc-500 transition-all ${isActive ? "rotate-90" : ""}`} />
      </div>

      <div className="ml-10">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>
            {completedSteps} of {category.steps.length} steps completed
          </span>
          <span className="flex items-center">
            <Award className="h-3 w-3 mr-1" />
            {category.earnedPoints}/{category.totalPoints} points
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />

        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {category.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center text-xs py-1 px-2 rounded hover:bg-zinc-800/50"
              >
                {step.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <div className="h-3.5 w-3.5 border border-zinc-700 rounded-full mr-2 flex-shrink-0" />
                )}
                <span className={step.completed ? "text-zinc-300" : "text-zinc-500"}>
                  {step.title}
                </span>
                <span className="ml-auto flex items-center text-zinc-500">
                  <Trophy className="h-3 w-3 mr-1" />
                  {step.points}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function OnboardingDashboard() {
  const {
    categories,
    profile,
    startOnboarding,
    resetOnboarding,
    suggestedNextSteps
  } = useOnboarding();
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Total progress across all categories
  const totalSteps = categories.flatMap(c => c.steps).length;
  const completedSteps = categories.flatMap(c => c.steps).filter(s => s.completed).length;
  const totalProgress = (completedSteps / totalSteps) * 100;

  // Toggle expanded category
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <div className="bg-black border border-zinc-800 rounded-lg p-5 mb-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-gray-200 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
          Your Learning Progress
        </h2>
        
        <div className="flex">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 border-zinc-700 text-zinc-400"
            onClick={() => setShowConfirmReset(true)}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset Progress
          </Button>
        </div>
      </div>

      {/* User Level Information */}
      <div className="bg-gradient-to-r from-orange-950/20 to-zinc-900 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-orange-600/30 p-2.5 rounded-full">
                <Trophy className="h-6 w-6 text-orange-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-xs font-bold border border-orange-500 rounded-full h-5 w-5 flex items-center justify-center text-orange-500">
                {profile.level}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-zinc-300">Level {profile.level} File Master</div>
              <div className="text-xs text-zinc-500">
                {profile.experience} / {profile.nextLevelThreshold} XP to next level
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-zinc-300">{completedSteps}/{totalSteps} Tasks</div>
            <div className="text-xs text-zinc-500">{Math.round(totalProgress)}% complete</div>
          </div>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>

      {/* Suggested Next Steps */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center">
          <Lightbulb className="h-4 w-4 mr-1.5 text-orange-500" />
          Suggested Next Steps
        </h3>
        
        <div className="space-y-2">
          {suggestedNextSteps.length > 0 ? (
            suggestedNextSteps.map((step) => (
              <motion.div
                key={step.id}
                whileHover={{ scale: 1.01, x: 3 }}
                className="bg-zinc-900 border border-zinc-800 rounded-md p-3 flex items-center"
              >
                <div className="bg-orange-600/20 p-1.5 rounded-md mr-3">
                  {step.emoji ? (
                    <span className="text-lg">{step.emoji}</span>
                  ) : (
                    <Sparkles className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-zinc-300">{step.title}</h4>
                  <p className="text-xs text-zinc-500">{step.description}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    // Find the category this step belongs to
                    const category = categories.find(c => 
                      c.steps.some(s => s.id === step.id)
                    );
                    if (category) {
                      startOnboarding(category.id);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-7"
                >
                  Start
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-3 text-zinc-500 text-sm">
              No new steps to suggest. You're doing great!
            </div>
          )}
        </div>
      </div>

      {/* Learning Paths */}
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Learning Paths</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => toggleCategory(category.id)}
              isActive={expandedCategory === category.id}
            />
          ))}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Reset Progress?</h3>
              <p className="text-sm text-zinc-400 mb-4">
                This will reset all your onboarding progress, levels, and achievements. This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmReset(false)}
                  className="text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    resetOnboarding();
                    setShowConfirmReset(false);
                  }}
                >
                  Reset Everything
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}