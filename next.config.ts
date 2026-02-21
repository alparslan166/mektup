import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/mektup",
  assetPrefix: "/mektup/",
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
};

export default nextConfig;
