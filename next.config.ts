import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "animalcorner.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "tsdtxolyogjpmbtogfmr.supabase.co", // 👈 add your Supabase project domain
      },
    ],
  },
};

export default nextConfig;
