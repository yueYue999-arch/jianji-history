const CACHE='jianji-history-3.0.0';
const ROOT=new URL('./',self.location.href).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([ROOT,new URL('icon.svg',ROOT).href])));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys())if(key.startsWith('jianji-history-')&&key!==CACHE)await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET' || event.request.mode!=='navigate' || new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(ROOT);
    let timeout;
    const online=fetch(event.request).then(response=>{
      if(response.ok)event.waitUntil(cache.put(ROOT,response.clone()));
      return response;
    });
    try {
      if(!cached)return await online;
      return await Promise.race([online,new Promise(resolve=>{timeout=setTimeout(()=>resolve(cached),3000);})]);
    }catch {
      return cached||new Response('首次访问需要网络，请联网后重新打开。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }finally{clearTimeout(timeout);}
  })());
});
