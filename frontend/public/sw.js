/* Service worker «Вокруг НСК»: офлайн-кэш без установки отдельного приложения. */
const CACHE = 'vokrug-nsk-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

// Кэшируем оболочку и хешированные бандлы из index.html,
// чтобы офлайн работал уже после первого визита.
async function precache() {
  const cache = await caches.open(CACHE)
  await cache.addAll(SHELL)

  try {
    const html = await (await fetch('/index.html', { cache: 'reload' })).text()
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1])
    await Promise.all(assets.map((url) => cache.add(url).catch(() => undefined)))
  } catch {
    /* офлайн-кэш соберётся при следующем визите */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Навигация: сеть, при офлайне — кэшированный shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() =>
          caches
            .match('/index.html', { ignoreVary: true })
            .then((cached) => cached ?? caches.match('/', { ignoreVary: true })),
        ),
    )
    return
  }

  // Статика: сначала кэш, потом сеть (с докладыванием в кэш).
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (response.ok && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
    }),
  )
})
