import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xingu/shared'],

  // Docker standalone output
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: false,
  },

  experimental: {
    ppr: false,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/api/auth/:path*`,
      },
      {
        source: '/api/templates/:path*',
        destination: `${process.env.TEMPLATE_SERVICE_URL || 'http://localhost:3002'}/api/templates/:path*`,
      },
      {
        source: '/api/games/:path*',
        destination: `${process.env.GAME_SERVICE_URL || 'http://localhost:3003'}/api/games/:path*`,
      },
      {
        source: '/api/rooms/:path*',
        destination: `${process.env.ROOM_SERVICE_URL || 'http://localhost:3004'}/api/rooms/:path*`,
      },
      {
        source: '/api/results/:path*',
        destination: `${process.env.RESULT_SERVICE_URL || 'http://localhost:3006'}/api/results/:path*`,
      },
      {
        source: '/api/ws/:path*',
        destination: `${process.env.WS_SERVICE_URL || 'http://localhost:3005'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
