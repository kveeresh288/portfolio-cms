/** @type {import('next').NextConfig} */
const nextConfig = {
  // API is now handled by Next.js Route Handlers (src/app/api/*)
  // No proxy rewrite needed — removing it was the fix for admin not working

  typescript: {
    // Type-checking runs locally; skip it during Vercel build to avoid OOM
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
