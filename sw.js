// 桥牌训练营 Service Worker
const CACHE_NAME = 'bridge-training-v4';
const ASSETS = [
  './',
  './bridge-bidding.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 安装时缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('缓存资源中...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 请求时优先使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 有缓存就用缓存，没有就网络请求
      return response || fetch(event.request).then(fetchResponse => {
        // 把新请求的资源也缓存起来
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // 离线且无缓存时的降级处理
      if (event.request.destination === 'document') {
        return caches.match('./bridge-bidding.html');
      }
    })
  );
});
