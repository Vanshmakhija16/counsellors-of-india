import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  async headers() {
    return [
      {
        // Prevent Vercel edge from caching therapist profile pages
        // so direct URL hits always reach the origin and find the DB record.
        source: '/:username',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig



