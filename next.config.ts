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
      {
        protocol: 'https',
        hostname: 'white-changing-swordfish-666.mypinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
  },
};

export default nextConfig;
