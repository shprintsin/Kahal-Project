import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
      // Constrain `:locale` to actual locale values — without this, Next.js
      // matches the pattern against /api/maps (:locale=api) and redirects
      // to /api/data which doesn't exist, silently breaking the entire
      // /api/maps route tree.
      {
        source: '/:locale(he|en)/maps',
        destination: '/:locale/data',
        permanent: true,
      },
      {
        source: '/:locale(he|en)/maps/:slug',
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

export default withNextIntl(nextConfig);
