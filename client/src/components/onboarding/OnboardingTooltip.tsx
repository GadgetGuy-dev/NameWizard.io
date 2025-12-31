import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding, OnboardingStep } from "@/context/OnboardingContext";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Award
} from "lucide-react";

type TooltipPosition = {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  transform?: string;
};

export function OnboardingTooltip() {
  const {
    activeStep,
    activeCategory,
    categories,
    profile,
    isOnboardingActive,
    stepIndex,
    startOnboarding,
    stopOnboarding,
    nextStep,
    prevStep,
    skipStep,
    completeStep,
  } = useOnboarding();

  const [position, setPosition] = useState<TooltipPosition>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [showPoints, setShowPoints] = useState(false);

  // Calculate the position of the tooltip based on the target element
  useEffect(() => {
    if (!activeStep?.element || !isOnboardingActive) return;

    // Find the target element
    const targetElement = document.querySelector(activeStep.element) as HTMLElement;
    if (!targetElement) return;

    // Highlight the element
    setHighlightedElement(targetElement);

    // Create a pulse effect around the element
    targetElement.style.position = targetElement.style.position || "relative";
    targetElement.style.zIndex = "50";
    targetElement.classList.add("onboarding-highlighted");

    // Calculate the position
    const elementRect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320; // Estimated tooltip width
    const tooltipHeight = 240; // Estimated tooltip height
    const spacing = 15; // Space between tooltip and target

    let tooltipPosition: TooltipPosition = {};

    switch (activeStep.position) {
      case "top":
        tooltipPosition = {
          bottom: window.innerHeight - elementRect.top + spacing,
          left: elementRect.left + elementRect.width / 2,
          transform: "translateX(-50%)",
        };
        break;
      case "bottom":
        tooltipPosition = {
          top: elementRect.bottom + spacing,
          left: elementRect.left + elementRect.width / 2,
          transform: "translateX(-50%)",
        };
        break;
      case "left":
        tooltipPosition = {
          top: elementRect.top + elementRect.height / 2,
          right: window.innerWidth - elementRect.left + spacing,
          transform: "translateY(-50%)",
        };
        break;
      case "right":
        tooltipPosition = {
          top: elementRect.top + elementRect.height / 2,
          left: elementRect.right + spacing,
          transform: "translateY(-50%)",
        };
        break;
      case "center":
        tooltipPosition = {
          top: window.innerHeight / 2 - tooltipHeight / 2,
          left: window.innerWidth / 2 - tooltipWidth / 2,
        };
        break;
    }

    // Apply position
    setPosition(tooltipPosition);

    // Clean up
    return () => {
      if (targetElement) {
        targetElement.classList.remove("onboarding-highlighted");
        targetElement.style.zIndex = "";
      }
      setHighlightedElement(null);
    };
  }, [activeStep, isOnboardingActive]);

  // Handle completion of the step
  const handleComplete = () => {
    if (activeStep) {
      setShowPoints(true);
      setTimeout(() => {
        setShowPoints(false);
        completeStep(activeStep.id);
      }, 1500);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!activeCategory) return 0;
    const completedSteps = activeCategory.steps.filter((step) => step.completed).length;
    return (completedSteps / activeCategory.steps.length) * 100;
  };

  // If there's no active step or onboarding is not active, don't render anything
  if (!activeStep || !isOnboardingActive) return null;

  return (
    <>
      {/* Overlay to darken the rest of the UI */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Highlight effect for the target element */}
      {highlightedElement && (
        <div
          className="fixed z-45 pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 6,
            left: highlightedElement.getBoundingClientRect().left - 6,
            width: highlightedElement.getBoundingClientRect().width + 12,
            height: highlightedElement.getBoundingClientRect().height + 12,
            borderRadius: "8px",
            boxShadow: "0 0 0 4px rgba(249, 115, 22, 0.5), 0 0 0 8px rgba(249, 115, 22, 0.2)",
          }}
        />
      )}

      {/* Points popup animation */}
      <AnimatePresence>
        {showPoints && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.2 }}
            className="fixed z-50 bg-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg"
            style={{
              top: highlightedElement
                ? highlightedElement.getBoundingClientRect().top - 40
                : "50%",
              left: highlightedElement
                ? highlightedElement.getBoundingClientRect().left +
                  highlightedElement.getBoundingClientRect().width / 2
                : "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            +{activeStep.points} XP
            <Sparkles className="inline-block ml-1 h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed z-50 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-80 p-4"
        style={{
          ...position,
        }}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="bg-orange-600/20 p-1.5 rounded-md mr-2">
              {activeStep.emoji ? (
                <span className="text-lg">{activeStep.emoji}</span>
              ) : (
                <Sparkles className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <h3 className="font-semibold text-gray-200">{activeStep.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full"
            onClick={stopOnboarding}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>
              Step {stepIndex + 1} of {activeCategory?.steps.length}
            </span>
            <span className="flex items-center">
              <Award className="h-3 w-3 mr-1" />
              {activeStep.points} points
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-1.5" />
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm text-zinc-400 mb-3">{activeStep.description}</p>

          {/* Tips section */}
          {activeStep.tips && activeStep.tips.length > 0 && (
            <div className="bg-zinc-800/50 rounded p-2 mb-3">
              <h4 className="text-xs font-medium text-zinc-300 mb-1">Tips:</h4>
              <ul className="text-xs text-zinc-400 space-y-1">
                {activeStep.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-3 w-3 mr-1 mt-0.5 text-orange-500 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Game elements */}
          <div className="bg-gradient-to-r from-orange-950/30 to-zinc-800/30 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-600/20 p-1 rounded-full mr-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <span className="text-xs font-medium text-zinc-300">
                  Level {profile.level} • {profile.experience}/{profile.nextLevelThreshold} XP
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                {activeCategory?.earnedPoints}/{activeCategory?.totalPoints} points
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between">
          <div>
            {stepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="text-xs h-8 mr-2"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={skipStep}
              className="text-xs h-8 text-zinc-400"
            >
              Skip
            </Button>
          </div>
          <Button
            onClick={handleComplete}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
          >
            {activeStep.requiredAction ? "I Did It" : "Got It"}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </motion.div>
    </>
  );
}