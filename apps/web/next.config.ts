import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xingu/shared'],
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    reactCompiler: false,
    ppr: false,
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
