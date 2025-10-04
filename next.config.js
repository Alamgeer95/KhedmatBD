/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'khedmatbd.864e82a3a4b66186c1b2c8ce90707882.r2.cloudflarestorage.com',
      },
    ],
  },
}
export default nextConfig
