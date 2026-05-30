// frontend/public/sw.js — Service Worker

const CACHE_NAME = 'agent-api-v1'
const API_CACHE = 'agent-api-data-v1'

// Ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// ── Installation ──────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activation ────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Interception des requêtes ─────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ne pas intercepter les requêtes POST (chat, login, etc.)
  if (request.method !== 'GET') return

  // Mettre en cache les requêtes API GET (conversations, me)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request))
    return
  }

  // Pour les assets statiques : cache first
  event.respondWith(cacheFirstWithNetwork(request))
})

// Network first : essaie le réseau, fallback sur le cache
async function networkFirstWithCache(request) {
  const cache = await caches.open(API_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ error: 'Hors-ligne — données non disponibles' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Cache first : sert depuis le cache, fallback réseau
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Hors-ligne', { status: 503 })
  }
}
