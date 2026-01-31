/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "avatars.githubusercontent.com"]
  },
  // Enable standalone output for Docker production builds
  output: "standalone",
  // Rewrite /skill.md to /skill-md to work around Next.js folder naming
  async rewrites() {
    return [
      {
        source: '/skill.md',
        destination: '/skill-md',
      },
    ];
  },
};

module.exports = nextConfig;
