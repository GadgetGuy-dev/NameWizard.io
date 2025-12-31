import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  isUpdateAvailable, 
  applyUpdate, 
  getServiceWorkerStatus 
} from '@/utils/serviceWorkerRegistration';
import { logger } from '@/utils/logger';

interface UpdateAvailableNotificationProps {
  /**
   * Time to wait before showing the notification (milliseconds)
   */
  delayMs?: number;
  
  /**
   * Custom title
   */
  title?: string;
  
  /**
   * Custom description
   */
  description?: string;
  
  /**
   * Custom update button text
   */
  updateButtonText?: string;
  
  /**
   * Position of the notification
   */
  position?: 'top' | 'bottom';
  
  /**
   * Callback when update is applied
   */
  onUpdateApplied?: () => void;
  
  /**
   * Callback when notification is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Whether to auto-dismiss after a certain time
   */
  autoDismiss?: boolean;
  
  /**
   * Auto-dismiss timeout (milliseconds)
   */
  autoDismissTimeout?: number;
  
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Notification component that displays when a service worker update is available
 */
export function UpdateAvailableNotification({
  delayMs = 0,
  title = 'Update Available',
  description = 'A new version of the application is available. Refresh to update.',
  updateButtonText = 'Update Now',
  position = 'bottom',
  onUpdateApplied,
  onDismiss,
  autoDismiss = false,
  autoDismissTimeout = 7000,
  className = '',
}: UpdateAvailableNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    let initialCheckTimer: NodeJS.Timeout;
    let mounted = true;
    
    // Helper function to show notification if an update is available
    const checkForUpdate = () => {
      if (!mounted) return;
      if (isUpdateAvailable()) {
        logger.info('Service worker update available, showing notification');
        setVisible(true);
      }
    };
    
    // Initial check with delay
    initialCheckTimer = setTimeout(() => {
      checkForUpdate();
    }, delayMs);
    
    // Listen for future update events
    const handleUpdateFound = () => {
      logger.info('Service worker update event detected');
      checkForUpdate();
    };
    
    window.addEventListener('swUpdate', handleUpdateFound);
    
    // Auto-dismiss timer
    let dismissTimer: NodeJS.Timeout | null = null;
    if (autoDismiss && visible) {
      dismissTimer = setTimeout(() => {
        if (mounted) {
          setVisible(false);
          onDismiss?.();
        }
      }, autoDismissTimeout);
    }
    
    return () => {
      mounted = false;
      clearTimeout(initialCheckTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
      window.removeEventListener('swUpdate', handleUpdateFound);
    };
  }, [delayMs, autoDismiss, autoDismissTimeout, visible, onDismiss]);
  
  // Handle applying the update
  const handleUpdate = async () => {
    try {
      setUpdating(true);
      logger.info('Applying service worker update');
      await applyUpdate();
      onUpdateApplied?.();
    } catch (error) {
      logger.error('Failed to apply service worker update', error instanceof Error ? error : new Error(String(error)));
      // Force reload as fallback
      window.location.reload();
    }
  };
  
  // Handle dismissing the notification
  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <Alert 
      className={`
        fixed z-50 max-w-md shadow-lg border-primary/20 animate-in slide-in-from-bottom-5 duration-300
        ${position === 'top' ? 'top-4 right-4' : 'bottom-4 right-4'}
        ${className}
      `}
      variant="default"
    >
      <div className="flex items-start">
        <RefreshCw className="h-4 w-4 mt-1 mr-2 text-primary" />
        <div className="flex-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="text-sm mt-1">{description}</AlertDescription>
          
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              disabled={updating}
            >
              Later
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleUpdate}
              disabled={updating}
              className="flex items-center gap-1"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {updateButtonText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}