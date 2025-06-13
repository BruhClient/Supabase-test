import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["efjiyivfyewtusvuxmel.supabase.co"],
  },
};

export default nextConfig;
