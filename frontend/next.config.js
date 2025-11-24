/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
      || (process.env.NODE_ENV === 'production'
        ? 'https://remax-be-production.up.railway.app/api'
        : 'http://localhost:3003/api'
      ),
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/roles',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/roles`
          : (process.env.NODE_ENV === 'production'
            ? 'https://remax-be-production.up.railway.app/api/roles'
            : 'http://localhost:3003/api/roles'),
      },
      {
        source: '/api/permissions',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/permissions`
          : (process.env.NODE_ENV === 'production'
            ? 'https://remax-be-production.up.railway.app/api/permissions'
            : 'http://localhost:3003/api/permissions'),
      },
      // File management endpoints
      {
        source: '/api/files/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/files/:path*`
          : (process.env.NODE_ENV === 'production'
            ? 'https://remax-be-production.up.railway.app/api/files/:path*'
            : 'http://localhost:3003/api/files/:path*'),
      },
      // Catch-all for other API routes
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/:path*`
          : (process.env.NODE_ENV === 'production'
            ? 'https://remax-be-production.up.railway.app/api/:path*'
            : 'http://localhost:3003/api/:path*'),
      },
    ];
  },
}

module.exports = nextConfig
