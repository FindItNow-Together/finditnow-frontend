import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //remove rewrites when actual production is setup
  //this is for backend prod + local frontend setup
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://finditnow-together.duckdns.org/api/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost", // The hostname of your image host
        port: "80", // Optional: specify a port if needed
        pathname: "/api/files/**", // Optional: restrict to a specific path
      },
    ],
  },
};

export default nextConfig;
