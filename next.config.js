/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your other configurations here (if any)
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tffwhfvevgjscrhkdmpl.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
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
      // You can add more hostnames here as needed
    ],
  },
};

module.exports = nextConfig;