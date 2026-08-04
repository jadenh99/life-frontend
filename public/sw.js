const CACHE_NAME = 'life-organiser-cache-v3'
const APP_SHELL_URLS = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  let requestUrl
  try {
    requestUrl = new URL(request.url)
  } catch {
    return
  }

  const isCacheableRequest =
    requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:'

  if (!isCacheableRequest) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => {
            try {
              void cache.put(request, copy)
            } catch {
              // Ignore unsupported or invalid cache writes for this request.
            }
          })
        }

        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/')),
      ),
  )
})
