/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
};

// The hidden /grad section responds with Cache-Control: no-store, but
// next-pwa's default runtime caching (NetworkFirst for pages and /api/*)
// would persist those responses in CacheStorage anyway. Prepend NetworkOnly
// routes so the service worker never stores them — Workbox picks the first
// matching route.
const defaultRuntimeCaching = require("next-pwa/cache");
const runtimeCaching = [
  {
    urlPattern: ({ url, sameOrigin }) =>
      sameOrigin &&
      (url.pathname.startsWith("/grad") || url.pathname.startsWith("/api/grad")),
    handler: "NetworkOnly",
  },
  ...defaultRuntimeCaching,
];

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

module.exports = withPWA(nextConfig);
