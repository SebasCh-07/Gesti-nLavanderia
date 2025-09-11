/**
 * Service Worker para Sistema de Lavandería RFID
 * Maneja cache, notificaciones push y funcionalidad offline
 */

const CACHE_NAME = 'lavanderia-rfid-v1.0.0';
const STATIC_CACHE = 'lavanderia-static-v1.0.0';
const DYNAMIC_CACHE = 'lavanderia-dynamic-v1.0.0';

// Archivos estáticos para cache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/login.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/storage.js',
    '/js/navigation.js',
    '/js/dashboard.js',
    '/js/clients.js',
    '/js/reception.js',
    '/js/control.js',
    '/js/delivery.js',
    '/js/history.js',
    '/js/reports.js',
    '/js/guides.js',
    '/js/rfid-simulator.js',
    '/js/billing.js',
    '/js/notifications.js',
    '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando archivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error en instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: Eliminando cache obsoleto:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activación completada');
                return self.clients.claim();
            })
    );
});

// Interceptación de requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo interceptar requests del mismo origen
    if (url.origin !== location.origin) {
        return;
    }
    
    // Estrategia de cache para diferentes tipos de archivos
    if (request.method === 'GET') {
        if (STATIC_FILES.includes(url.pathname)) {
            // Archivos estáticos: Cache First
            event.respondWith(cacheFirst(request));
        } else if (url.pathname.startsWith('/api/')) {
            // APIs: Network First
            event.respondWith(networkFirst(request));
        } else {
            // Otros archivos: Stale While Revalidate
            event.respondWith(staleWhileRevalidate(request));
        }
    }
});

// Estrategia Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First error:', error);
        return new Response('Recurso no disponible offline', { status: 503 });
    }
}

// Estrategia Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Recurso no disponible offline', { status: 503 });
    }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Si falla la red, devolver cache si existe
        return cachedResponse || new Response('Recurso no disponible offline', { status: 503 });
    });
    
    return cachedResponse || fetchPromise;
}

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
    console.log('📱 Service Worker: Notificación push recibida');
    
    let notificationData = {
        title: 'Sistema de Lavandería RFID',
        body: 'Nueva notificación del sistema',
        icon: '/manifest.json',
        badge: '/manifest.json',
        tag: 'lavanderia-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'Ver',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjZIMThWNEgxNlYySDEyVjJaIiBmaWxsPSIjNGY0ZjRmIi8+CjxwYXRoIGQ9Ik0xMiA2QzEzLjEgNiAxNCA2LjkgMTQgOFYxMEMxNCAxMS4xIDEzLjEgMTIgMTIgMTJIMTBWMTBIMTJWNkgxMFY2SDEyWiIgZmlsbD0iIzRmNGY0ZiIvPgo8L3N2Zz4='
            },
            {
                action: 'dismiss',
                title: 'Descartar',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDYuNDFMMTcuNTkgNUwxMiAxMC41OUw2LjQxIDVMMTkgNi40MVoiIGZpbGw9IiM0ZjRmNGYiLz4KPC9zdmc+'
            }
        ]
    };
    
    // Si hay datos en el push event, usarlos
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Service Worker: Click en notificación');
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Buscar si ya hay una ventana abierta
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Manejo de notificaciones cerradas
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Service Worker: Notificación cerrada');
    
    // Registrar evento de cierre para analytics
    if (event.notification.data?.trackClose) {
        // Aquí se podría enviar un evento de analytics
        console.log('📊 Tracking: Notificación cerrada');
    }
});

// Sincronización en background
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Sincronización en background');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Función de sincronización en background
async function doBackgroundSync() {
    try {
        // Simular sincronización de datos
        console.log('🔄 Sincronizando datos en background...');
        
        // Aquí se podría sincronizar datos pendientes
        // Por ejemplo, enviar datos que no se pudieron enviar por falta de conexión
        
        return Promise.resolve();
    } catch (error) {
        console.error('Error en sincronización background:', error);
        throw error;
    }
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

// Limpieza periódica del cache
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupCache());
    }
});

// Función de limpieza de cache
async function cleanupCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        // Eliminar entradas más antiguas que 7 días
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const responseDate = new Date(dateHeader).getTime();
                    if (responseDate < oneWeekAgo) {
                        await cache.delete(request);
                    }
                }
            }
        }
        
        console.log('🧹 Cache limpiado');
    } catch (error) {
        console.error('Error limpiando cache:', error);
    }
}

// Manejo de errores globales
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker Unhandled Rejection:', event.reason);
});

console.log('🚀 Service Worker cargado correctamente');
