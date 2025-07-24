/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'diamondos.vercel.app'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/socket.io/:path*',
        destination: '/api/socket.io/:path*',
      },
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig