self.addEventListener('install', (event) => {
  console.log('SW: Install event fired!')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('SW: Activate event fired!')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  console.log('SW: Fetch event for', event.request.url)
  event.respondWith(fetch(event.request))
})
