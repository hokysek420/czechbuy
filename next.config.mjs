/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'czechbuy.com' }],
        destination: 'https://www.czechbuy.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
