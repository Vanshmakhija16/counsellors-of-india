import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Next's dev server blocks cross-origin requests to its own internal
  // endpoints (HMR websocket, font optimizer, etc.) unless the origin is
  // explicitly allow-listed. Without this, hitting the app via a custom
  // hosts-file domain like counsellorsofamerica.local (instead of
  // localhost) causes those internal requests to 403/fail silently —
  // which is what was making the whole page render blank in dev.
  // Does not affect production (Vercel serves real domains normally).
  allowedDevOrigins: [
    'counsellorsofamerica.local',
    'counsellorsofindia.local',
    'counsellorsofcanada.local',
  ],
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



