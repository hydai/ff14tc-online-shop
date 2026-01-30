import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ff14tc-online-shop",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
