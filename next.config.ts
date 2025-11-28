import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    async rewrites() {
        return [
            {
                source: "/api/clear-refresh-cookie",
                destination: "/api/clear-refresh-cookie", // treat as internal
            },
            {
                source: "/api/:path*",
                destination: "http://localhost:8080/:path*",
            },
        ];
    },
};

export default nextConfig;
