import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Production builds MUST type-check. Dev can skip for speed.
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  // ESLint runs in CI; skip during `next build` to keep Vercel builds fast.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Compiler settings
  compiler: {
    // Remove console.log in production; keep error/warn for observability
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
  },
  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-icons',
      'motion',
      'sonner',
      'date-fns',
    ],
  },
  // Produce a standalone server trace-optimised build when deploying to Vercel
  // (no-op on Vercel, helpful for self-hosting; harmless to keep on)
  output: process.env.NEXT_OUTPUT as 'standalone' | undefined,
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
