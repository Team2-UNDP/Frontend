/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
