/**
 * Service Worker for NameWizard.io
 * Enables offline functionality and progressive web app features
 */

// Cache name - change version to force update
const CACHE_NAME = 'namewizard-cache-v1';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.svg'
];

// API routes that should NOT be cached
const API_ROUTES = [
  '/api/'
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Installation completed');
        return (self as any).skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Service Worker: Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation completed');
        return (self as any).clients.claim();
      })
  );
});

// Determine if a request should be cached
const shouldCache = (url: string): boolean => {
  // Don't cache API requests
  return !API_ROUTES.some(route => url.includes(route));
};

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Handle different caching strategies based on the resource type
  if (shouldCache(url.pathname)) {
    // Use cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return from cache if found
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Clone the response before using it
              const responseToCache = networkResponse.clone();
              
              // Cache the fetched resource if it's a valid response
              if (responseToCache.status === 200) {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return networkResponse;
            })
            .catch(error => {
              console.error('Service Worker: Fetch failed:', error);
              
              // For HTML requests, return the offline page
              if (event.request.headers.get('Accept')?.includes('text/html')) {
                return caches.match('/offline.html');
              }
              
              // Otherwise, propagate the error
              throw error;
            });
        })
    );
  } else {
    // Use network-first strategy for API requests
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Service Worker: API fetch failed:', error);
          
          // Check cache for previous responses
          return caches.match(event.request);
        })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
});