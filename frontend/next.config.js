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
          : 'http://localhost:3001/api'
        ),
  },
}

module.exports = nextConfig
