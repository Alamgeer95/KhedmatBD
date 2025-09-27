/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // experimental.typedRoutes থেকে সরিয়ে
  typedRoutes: true,
}
export default nextConfig
