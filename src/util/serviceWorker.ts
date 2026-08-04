const SERVICE_WORKER_URL = '/sw.js'

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.register(
    SERVICE_WORKER_URL,
    {
      scope: '/',
    },
  )

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing

    if (!installingWorker) {
      return
    }

    installingWorker.addEventListener('statechange', () => {
      if (
        installingWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        window.location.reload()
      }
    })
  })
}
