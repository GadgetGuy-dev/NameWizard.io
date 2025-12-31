import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  BookOpen,
  HelpCircle,
  ChevronUp,
  Settings,
  Award,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingButton() {
  const {
    startOnboarding,
    categories,
    profile,
    isOnboardingActive
  } = useOnboarding();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show the button if onboarding is already active
  if (isOnboardingActive) return null;

  // Calculate how many steps are completed
  const totalSteps = categories.flatMap(c => c.steps).length;
  const completedSteps = categories.flatMap(c => c.steps).filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Menu items */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="mb-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center">
                <div className="bg-orange-600/20 p-1.5 rounded-full mr-2">
                  <Award className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-300">Level {profile.level}</div>
                  <div className="text-xs text-zinc-500">{completedSteps}/{totalSteps} tasks completed</div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              {/* File Basics */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  startOnboarding("file-basics");
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start text-xs h-9 mb-1"
              >
                <BookOpen className="h-3.5 w-3.5 mr-2 text-orange-500" />
                File Management Basics
              </Button>
              
              {/* AI Features */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  startOnboarding("ai-features");
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start text-xs h-9 mb-1"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2 text-orange-500" />
                AI Feature Exploration
              </Button>
              
              {/* Advanced Features */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  startOnboarding("advanced-usage");
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start text-xs h-9"
              >
                <Settings className="h-3.5 w-3.5 mr-2 text-orange-500" />
                Advanced Features
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          size="lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`rounded-full w-14 h-14 bg-gradient-to-br ${
            isMenuOpen ? "from-orange-600 to-orange-700" : "from-orange-500 to-orange-600"
          } text-white shadow-lg border-2 border-orange-400/30`}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <HelpCircle className="h-6 w-6" />
          )}
        </Button>
        
        {!isMenuOpen && completedSteps > 0 && completedSteps < totalSteps && (
          <div className="absolute -top-2 -right-2 bg-zinc-900 text-xs font-bold border-2 border-orange-500 rounded-full h-7 w-7 flex items-center justify-center text-orange-500">
            {completionPercentage}%
          </div>
        )}
        
        {!isMenuOpen && completedSteps === totalSteps && (
          <div className="absolute -top-2 -right-2 bg-zinc-900 text-xs font-bold border-2 border-green-500 rounded-full h-7 w-7 flex items-center justify-center text-green-500">
            100%
          </div>
        )}
      </motion.div>
    </div>
  );
}