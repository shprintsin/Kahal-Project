import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 384, 600, 1200],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
      {
        source: '/admin/datastudio/:path*',
        destination: '/admin/maps2/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale/maps',
        destination: '/:locale/data',
        permanent: true,
      },
      {
        source: '/:locale/maps/:slug',
        destination: '/:locale/data/:slug',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  outputFileTracingIncludes: {
    '/docs': ['./content/docs/**/*'],
    '/docs/[...slug]': ['./content/docs/**/*'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
