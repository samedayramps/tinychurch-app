import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true // Shows cache hits/misses and full URLs
    }
  }
};

export default nextConfig;
