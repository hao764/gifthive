const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
    ],
  },
  // Simple static redirects (next-on-pages@1 only supports static redirects,
  // not async functions with host matching)
  redirects: async () => [
    { source: "/favicon.ico", destination: "/favicon.svg", permanent: true },
    { source: "/apple-touch-icon.png", destination: "/favicon.svg", permanent: true },
    { source: "/apple-touch-icon-precomposed.png", destination: "/favicon.svg", permanent: true },
    { source: "/api/:path*", destination: "/", permanent: false },
    { source: "/wp-admin/:path*", destination: "/", permanent: false },
    { source: "/wp-content/:path*", destination: "/", permanent: false },
    { source: "/phpmyadmin/:path*", destination: "/", permanent: false },
    { source: "/.env", destination: "/", permanent: false },
    { source: "/.git/:path*", destination: "/", permanent: false },
  ],
};

module.exports = withNextIntl(nextConfig);
