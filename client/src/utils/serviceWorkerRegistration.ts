import { logger } from './logger';

export type ServiceWorkerStatus = 'unregistered' | 'registered' | 'updated' | 'error';

// Constants
const SW_PATH = '/sw.js';
const SW_SCOPE = '/';

// State
let swRegistration: ServiceWorkerRegistration | null = null;
let swUpdateAvailable = false;
let swStatus: ServiceWorkerStatus = 'unregistered';

/**
 * Register the service worker for offline support
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service workers are not supported in this browser');
    return null;
  }

  try {
    // Register the service worker
    swRegistration = await navigator.serviceWorker.register(SW_PATH, {
      scope: SW_SCOPE,
    });
    
    swStatus = 'registered';
    logger.info('Service worker registered successfully', {
      scope: swRegistration.scope,
    });
    
    // Set up update listeners
    swRegistration.onupdatefound = () => {
      const installingWorker = swRegistration!.installing;
      if (!installingWorker) return;
      
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // At this point, the updated precached content has been fetched,
            // but the previous service worker will still serve the older
            // content until all client tabs are closed.
            logger.info('New content is available and will be used when all tabs for this page are closed');
            swUpdateAvailable = true;
            swStatus = 'updated';
            
            // Dispatch an event that can be used to notify the user
            window.dispatchEvent(new CustomEvent('swUpdate', { detail: swRegistration }));
          } else {
            // At this point, everything has been precached.
            logger.info('Content is cached for offline use');
          }
        }
      };
    };
    
    return swRegistration;
  } catch (error) {
    swStatus = 'error';
    logger.error('Error during service worker registration:', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Check if an update is available for the service worker
 */
export function isUpdateAvailable(): boolean {
  return swUpdateAvailable;
}

/**
 * Get the current service worker status
 */
export function getServiceWorkerStatus(): ServiceWorkerStatus {
  return swStatus;
}

/**
 * Apply a service worker update by skipping the waiting state
 */
export function applyUpdate(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!swRegistration || !swRegistration.waiting) {
      const error = new Error('No service worker update available');
      logger.warn(error.message);
      reject(error);
      return;
    }
    
    // Create a listener for handling the updated service worker taking control
    const refreshListener = () => {
      logger.info('New service worker activated, reloading page');
      swUpdateAvailable = false;
      
      // Remove listeners
      navigator.serviceWorker.removeEventListener('controllerchange', refreshListener);
      
      // Reload the page to ensure new service worker takes full control
      window.location.reload();
      resolve();
    };
    
    // Listen for the controllerchange event
    navigator.serviceWorker.addEventListener('controllerchange', refreshListener);
    
    // Send message to the waiting service worker to skip waiting
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    logger.info('Sent SKIP_WAITING message to service worker');
  });
}

/**
 * Unregister all service workers and clean up
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
      logger.info('Service worker unregistered', {
        scope: registration.scope,
      });
    }
    
    swRegistration = null;
    swUpdateAvailable = false;
    swStatus = 'unregistered';
    
    return true;
  } catch (error) {
    logger.error('Error unregistering service worker:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

// Helper to detect when the service worker has been updated in another tab
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // When focus changes to this tab, check if we need to reload
  window.addEventListener('focus', async () => {
    try {
      // If we have an active registration, check its state
      if (swRegistration) {
        await swRegistration.update();
      } else {
        // Otherwise, get the current registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.scope.includes(window.location.origin)) {
            swRegistration = registration;
            if (registration.waiting) {
              swUpdateAvailable = true;
              swStatus = 'updated';
              window.dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error checking for service worker updates:', error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  applyUpdate,
  isUpdateAvailable,
  getStatus: getServiceWorkerStatus,
};