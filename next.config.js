/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "images.unsplash.*" },
    ],
  },
  async redirects() {
    return [
      // 旧 Netlify 域名遗留链接统一跳到新首页（降低404）
      {
        source: "/giftfinder/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "giftfinder.netlify.app" }],
        destination: "/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "gifthive.netlify.app" }],
        destination: "/",
        permanent: true,
      },
      // 常见无效路径 -> 首页（降低4xx错误率）
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
      { source: "/apple-touch-icon.png", destination: "/icon.svg", permanent: true },
      { source: "/apple-touch-icon-precomposed.png", destination: "/icon.svg", permanent: true },
      { source: "/api/:path*", destination: "/", permanent: false },
      { source: "/_next/:path*", destination: "/", permanent: false },
      { source: "/cgi-bin/:path*", destination: "/", permanent: false },
      { source: "/wp-admin/:path*", destination: "/", permanent: false },
      { source: "/wp-content/:path*", destination: "/", permanent: false },
      { source: "/phpmyadmin/:path*", destination: "/", permanent: false },
      { source: "/.env", destination: "/", permanent: false },
      { source: "/.git/:path*", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/icon.svg",
        headers: [
          { key: "Content-Type", value: "image/svg+xml" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
