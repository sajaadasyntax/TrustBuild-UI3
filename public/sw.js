// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)

  if (!event.data) {
    console.log('Push notification has no data')
    return
  }

  let notification
  try {
    notification = event.data.json()
  } catch (e) {
    notification = {
      title: 'New Notification',
      body: event.data.text(),
    }
  }

  const title = notification.title || 'TrustBuild'
  const options = {
    body: notification.body || notification.message || 'You have a new notification',
    icon: notification.icon || '/icon-192.png',
    badge: notification.badge || '/badge-72.png',
    image: notification.image,
    data: notification.data || {},
    actions: notification.actions || [],
    tag: notification.tag || 'trustbuild-notification',
    requireInteraction: notification.requireInteraction || false,
    silent: notification.silent || false,
    vibrate: notification.vibrate || [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with this URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
})

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event)

  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        console.log('Push subscription renewed:', subscription)
        // You might want to send this new subscription to your backend
        return fetch('/api/notifications/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: arrayBufferToBase64(subscription.getKey('auth')),
              },
            },
          }),
        })
      })
  )
})

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

