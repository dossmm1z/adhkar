const CACHE = "adhkar-v20";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./fonts.css",
  "./icon-192.png",
  "./icon-512.png",
  "./maskable-512.png",
  "./fonts/amiri-400.woff2",
  "./fonts/amiri-700.woff2",
  "./fonts/amiri-quran.woff2",
  "./fonts/plex-400.woff2",
  "./fonts/plex-500.woff2",
  "./fonts/plex-600.woff2",
  "./fonts/reem-kufi.woff2",
  "./fonts/amiri-punct-400.woff2",
  "./fonts/amiri-punct-700.woff2",
  "./fonts/plex-punct-400.woff2",
  "./fonts/plex-punct-500.woff2",
  "./fonts/plex-punct-600.woff2",
  "./fonts/OFL.txt"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  const update = fetch(e.request).then((res) => {
    if (res && res.ok) {
      const copy = res.clone();
      return caches.open(CACHE).then((c) => c.put(e.request, copy)).then(() => res);
    }
    return res;
  }).catch(() => null);

  e.waitUntil(update.then(() => {}));
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return update.then((res) => res || caches.match("./index.html"));
    })
  );
});
