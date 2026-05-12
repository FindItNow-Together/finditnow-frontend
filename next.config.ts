import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
        hostname: "localhost",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "finditnow-together.duckdns.org",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "finditnow-discover.duckdns.org",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
