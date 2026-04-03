/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tffwhfvevgjscrhkdmpl.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',        // covers ALL tbn subdomains
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imghippo.com',
      },
    ],
  },
};

module.exports = nextConfig;