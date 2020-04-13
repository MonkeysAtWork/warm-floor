const CACHE = 'pwabuilder-offline';
const offlineFallbackPage = 'index.html';

self.addEventListener('install', function (event) {
  console.log('[PWA Builder] Install Event processing');
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log('[PWA Builder] Cached offline page during install');
      return cache.add(offlineFallbackPage);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        console.log('[PWA Builder] add page to offline cache: ' + response.url);
        event.waitUntil(updateCache(event.request, response.clone()));
        return response;
      })
      .catch(function (error) {
        console.log('[PWA Builder] Network request Failed. Serving content from cache: ' + error);
        return fromCache(event.request);
      })
  );
});

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject('no-match');
      }
      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}
