import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xingu/shared'],
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/api/auth/:path*`,
      },
      {
        source: '/api/games/:path*',
        destination: `${process.env.GAME_SERVICE_URL || 'http://localhost:3002'}/api/games/:path*`,
      },
    ];
  },
};

export default nextConfig;
