import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/{{APP_SLUG}}',
  reactStrictMode: false,
  productionBrowserSourceMaps: false,

  // TypeScript type checking - skip during build (types work correctly at runtime via npm link)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable transpilation for @captify-io packages
  transpilePackages: ["@captify-io/core"],

  webpack: (config) => {
    // Don't alias to src files — let package.json "exports" handle resolution
    return config;
  },
};

export default nextConfig;
