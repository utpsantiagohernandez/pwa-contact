'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_STATIC = 'static-cache';
const CACHE_DINAMIC = 'dynamic-cache';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  'index.html',
  'css/bootstrap.css',
  'css/styles.css',
  'css/all.css',
  'js/app.js',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap',
  'offline.html'
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  evt.waitUntil(
      caches.open(CACHE_STATIC).then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_STATIC) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  self.clients.claim();
});

/* self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  evt.respondWith(
      caches.open(CACHE_STATIC).then((cache) => {
        return cache.match(evt.request)
            .then((response) => {
              console.log("RESP", response);
              return response || fetch(evt.request);
            });
      })
  );
}); */

self.addEventListener('fetch', evt =>{
  evt.respondWith(
    caches.match(evt.request).then(staticRes =>{
      return staticRes || fetch(evt.request).then(dynamicRes =>{
        return caches.open(CACHE_DINAMIC).then(cache =>{
          cache.put(evt.request.url, dynamicRes.clone())
          return dynamicRes
        })
      })
    }).catch(()=>caches.match('offline.html'))
  )
})