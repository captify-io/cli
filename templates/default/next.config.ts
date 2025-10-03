import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/{{APP_SLUG}}',
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
