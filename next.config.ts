import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8080/api/auth/:path*",
      },
      {
        source: "/api/user/:path*",
        destination: "http://localhost:8081/api/user/:path*",
      },
      {
        source: "/api/shop/:path*",
        destination: "http://localhost:8083/api/shop/:path*",
      },
      {
        source: "/api/order/:path*",
        destination: "http://localhost:8084/api/order/:path*",
      },
      {
        source: "/api/delivery/:path*",
        destination: "http://localhost:8086/api/delivery/:path*",
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
