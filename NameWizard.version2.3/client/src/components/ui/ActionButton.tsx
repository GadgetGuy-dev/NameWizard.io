import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export interface ActionButtonProps extends ButtonProps {
  /**
   * Text to display in the button
   */
  children: React.ReactNode;
  
  /**
   * Icon to display before the text
   */
  icon?: React.ReactElement;
  
  /**
   * Icon to display after the text
   */
  trailingIcon?: React.ReactElement;
  
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Text to display while loading
   */
  loadingText?: string;
  
  /**
   * Whether to show a confirmation dialog before executing the action
   */
  withConfirmation?: boolean;
  
  /**
   * Confirmation text to display
   */
  confirmationText?: string;
  
  /**
   * Tooltip text to display on hover
   */
  tooltipText?: string;
  
  /**
   * Optional counter badge to display
   */
  counter?: number;
  
  /**
   * Whether to animate the icon (like pulse or spin)
   */
  animateIcon?: 'spin' | 'pulse' | 'bounce' | 'none';
  
  /**
   * Custom loading indicator component to replace the default one
   */
  customLoadingIndicator?: React.ReactNode;
}

/**
 * Enhanced action button with loading state, confirmation, tooltip, and other features
 */
export function ActionButton({
  children,
  icon,
  trailingIcon,
  isLoading = false,
  loadingText,
  withConfirmation = false,
  confirmationText = 'Are you sure you want to perform this action?',
  tooltipText,
  counter,
  animateIcon = 'none',
  customLoadingIndicator,
  onClick,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  // Handle confirmation logic
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;
    
    if (withConfirmation) {
      const confirmed = window.confirm(confirmationText);
      if (!confirmed) return;
    }
    
    onClick?.(e);
  };
  
  // Apply icon animation class based on the animation type
  const getAnimationClass = () => {
    switch (animateIcon) {
      case 'spin':
        return 'animate-spin';
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      default:
        return '';
    }
  };
  
  // Construct the button content based on state
  const buttonContent = (
    <>
      {isLoading ? (
        <>
          {customLoadingIndicator || <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loadingText || children}
        </>
      ) : (
        <div className="flex items-center">
          {icon && (
            <span className={cn("mr-2", getAnimationClass())}>
              {React.cloneElement(icon, { className: cn("h-4 w-4", icon.props.className) })}
            </span>
          )}
          
          <span>{children}</span>
          
          {counter !== undefined && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium">
              {counter}
            </span>
          )}
          
          {trailingIcon && (
            <span className={cn("ml-2", getAnimationClass())}>
              {React.cloneElement(trailingIcon, { className: cn("h-4 w-4", trailingIcon.props.className) })}
            </span>
          )}
        </div>
      )}
    </>
  );
  
  // If tooltip is provided, wrap button in tooltip component
  if (tooltipText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn("", className)}
              onClick={handleClick}
              disabled={isLoading || disabled}
              {...props}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Otherwise, render button directly
  return (
    <Button
      className={cn("", className)}
      onClick={handleClick}
      disabled={isLoading || disabled}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}