/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy all /api/* requests to the Express backend.
  // This means the browser always talks to localhost:3000, so cookies work
  // cross-process without needing SameSite=None or HTTPS in development.
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:5001';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
