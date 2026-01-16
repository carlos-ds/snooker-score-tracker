// Service Worker for Snooker Score Tracker
// Cache version - increment when deploying breaking changes
const CACHE_VERSION = 'v1';
const CACHE_NAME = `snooker-${CACHE_VERSION}`;

// This placeholder is replaced by the post-build script with actual asset URLs
const PRECACHE_URLS = __PRECACHE_MANIFEST__;

// Install event: precache all static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Precaching assets:', PRECACHE_URLS);
        
        // Fetch each URL individually to handle redirects properly
        const cachePromises = PRECACHE_URLS.map(async (url) => {
          try {
            // Fetch with redirect: 'follow' to get final response
            const response = await fetch(url, { redirect: 'follow' });
            
            if (!response.ok) {
              console.warn('[SW] Failed to fetch:', url, response.status);
              return;
            }
            
            // Create a fresh Response to strip the redirected flag
            // Browsers reject redirected responses for navigation requests
            const responseBody = await response.blob();
            const cleanResponse = new Response(responseBody, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
            
            await cache.put(url, cleanResponse);
            console.log('[SW] Cached:', url);
          } catch (error) {
            console.warn('[SW] Failed to cache:', url, error);
          }
        });
        
        await Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[SW] All assets precached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// Activate event: clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('snooker-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event: cache-first for assets, index.html fallback for navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // For navigation requests (HTML pages), return cached index.html
  // This enables SPA routing to work offline
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to network if not cached (shouldn't happen after install)
          return fetch(request, { redirect: 'follow' });
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For all other requests: cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, try network with redirect handling
        return fetch(request, { redirect: 'follow' })
          .then((networkResponse) => {
            // Don't cache non-successful, opaque, or redirect responses
            if (!networkResponse || 
                networkResponse.status !== 200 || 
                networkResponse.type === 'opaqueredirect') {
              return networkResponse;
            }

            // Clone the response before caching (response can only be read once)
            const responseToCache = networkResponse.clone();

            // Cache the fetched resource for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          });
      })
  );
});

// Handle messages from the main app (for future update prompts)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
