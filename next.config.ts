import type { NextConfig } from "next";

import { validateBuildEnvironment } from "./lib/build-environment";

validateBuildEnvironment();

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: true,
  poweredByHeader: false,
  reactStrictMode: true,
} satisfies NextConfig;

export default nextConfig;
