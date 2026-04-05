import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Proxy API requests during development to avoid CORS preflight failures.
  // This rewrites browser requests starting with /api to the backend URL
  // configured in NEXT_PUBLIC_API_URL.
  async rewrites() {
    const destination = process.env.NEXT_PUBLIC_API_URL || "https://hackauth0backend.onrender.com";
    return [
      {
        source: "/api/:path*",
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
