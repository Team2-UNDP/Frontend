/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['192.168.1.3'], // Add your local IP address here
  },

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/login",
      },
    ];
  },
};

export default nextConfig;