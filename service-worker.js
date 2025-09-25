const cacheName = "banco-de-letras-v1";
const assetsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",        // se você separar CSS
  "./musicas.json"
];

// Instalando Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Ativando SW e limpando caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => key !== cacheName && caches.delete(key))
      );
    })
  );
});

// Fazendo fetch usando cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
