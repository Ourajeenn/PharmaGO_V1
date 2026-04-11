// Service Worker for PharmaGo Express
const CACHE_NAME = 'pharmago-v1';
const RUNTIME_CACHE = 'pharmago-runtime';
const STATIC_CACHE = 'pharmago-static';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== STATIC_CACHE;
                    })
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // API requests - network first
    if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache on network error
                    return caches.match(request);
                })
        );
        return;
    }

    // Static assets - cache first
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            });
        })
    );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        console.log('[SW] Background sync: orders');
        event.waitUntil(syncOrders());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'PharmaGo Express';
    const options = {
        body: data.body || 'Nouvelle notification',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: data.actions || [
            { action: 'open', title: 'Ouvrir', icon: '/icon-96x96.png' },
            { action: 'close', title: 'Fermer', icon: '/icon-96x96.png' }
        ],
        tag: data.tag || 'general',
        requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        const urlToOpen = event.notification.data.url || '/';

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((windowClients) => {
                    // Check if there's already a window open
                    for (let client of windowClients) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Open new window
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Background sync function
async function syncOrders() {
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        const requests = await cache.keys();

        const orderRequests = requests.filter(req =>
            req.url.includes('/api/orders') && req.method === 'POST'
        );

        for (const request of orderRequests) {
            try {
                await fetch(request.clone());
                await cache.delete(request);
            } catch (error) {
                console.error('[SW] Failed to sync order:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-pharmacy-status') {
        event.waitUntil(updatePharmacyStatus());
    }
});

async function updatePharmacyStatus() {
    try {
        const response = await fetch('/api/pharmacies/status');
        const data = await response.json();

        // Update cache with fresh data
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put('/api/pharmacies/status', new Response(JSON.stringify(data)));
    } catch (error) {
        console.error('[SW] Failed to update pharmacy status:', error);
    }
}
