var cacheName = 'restaurants';
var filesToCache = [
    '/',
    '/manifest.json',
    '/css/styles.css',
    '/js/dbhelper.js',
    '/js/imghelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    'http://localhost:1337/restaurants'
];

self.addEventListener('install', e => {
    for (let i = 1; i < 11; ++i) {
        filesToCache.push(`/restaurant.html?id=${i}`);
        filesToCache.push(`/img/${i}.webp`);
        filesToCache.push(`/img/${i}-380_1x.webp`);
        filesToCache.push(`/img/${i}-380_2x.webp`);
        filesToCache.push(`/img/${i}-512_1x.webp`);
        filesToCache.push(`/img/${i}-512_2x.webp`);
    }
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});


self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName).then(cache => 
            cache.match(event.request).then(response => {
                if (response) { // Cache hit - return response
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    const responseToCache = response.clone();

                    cache.put(event.request, responseToCache);

                    return response;
                });
            }).catch(function (error) {
                console.log(error);
            })
        )
    );
});