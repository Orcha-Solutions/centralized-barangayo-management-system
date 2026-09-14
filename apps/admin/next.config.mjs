/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cbms/ui", "@cbms/api-client"],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
