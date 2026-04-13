import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
    ],
  },
  // Temporarily disabled due to dev-time instability with Turbopack.
  // Re-enable after upgrading/downgrading Next.js to a stable combination.
  // experimental: {
  //   optimizePackageImports: ['lucide-react', 'framer-motion'],
  // },
};

export default nextConfig;
