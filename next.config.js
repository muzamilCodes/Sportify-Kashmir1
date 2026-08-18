/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  // Let Next.js App Router manage RSC navigation. Aggressive front-end
  // caching can show an empty/stale page until the browser is refreshed.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  compress: true,
  experimental: {
    // Keep already-rendered App Router segments reusable during normal
    // navigation without causing a fresh RSC request for every revisit.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  // Keep local development pointed at localhost, but never let a production
  // build silently call the browser's localhost when the env var is missing.
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://sportify-kashmir1.onrender.com'
        : 'http://localhost:4000'),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'sportify-kashmir1.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    // Next.js React Refresh uses eval in development. Keep production strict.
    const scriptSource = process.env.NODE_ENV === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com"
      : "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com";

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), payment=(self "https://checkout.razorpay.com"), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; ${scriptSource}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com https://sportify-kashmir1.onrender.com https://images.unsplash.com; font-src 'self' data:; connect-src 'self' https://sportify-kashmir1.onrender.com https://api.razorpay.com https://nominatim.openstreetmap.org; frame-src https://checkout.razorpay.com https://www.google.com; form-action 'self' https://checkout.razorpay.com; upgrade-insecure-requests`,
          }
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
