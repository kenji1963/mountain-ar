const shell = 'mountain-ar-shell-v35';
const index = new URL('index.html', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(shell);
    await cache.add(new Request(index, {cache:'reload'}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.mode === 'navigate' && [index, self.registration.scope].includes(url.origin + url.pathname)){
    event.respondWith((async () => {
      const cache = await caches.open(shell);
      try {
        const response = await fetch(event.request);
        if(response.ok){ await cache.put(index,response.clone()); return response; }
        return (await cache.match(index)) || response;
      } catch(error){ const saved=await cache.match(index); if(saved)return saved; throw error; }
    })());
  } else if(event.request.method === 'GET' && (
    url.href.startsWith('https://cyberjapandata.gsi.go.jp/xyz/std/12/') ||
    url.href.startsWith('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/10/'))){
    event.respondWith((async () => (await caches.match(event.request,{ignoreVary:true})) || fetch(event.request))());
  }
});
