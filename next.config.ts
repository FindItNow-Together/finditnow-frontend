import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // async rewrites() {
    //     return [
    //         {
    //             source: "/api/clear-cookie",
    //             destination: "/api/clear-cookie", // treat as internal
    //         },
    //         {
    //             source: "/api/:path*",
    //             destination: "http://localhost:8080/:path*",
    //         },
    //     ];
    // },

    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost', // The hostname of your image host
                port: '80', // Optional: specify a port if needed
                pathname: '/api/files/**', // Optional: restrict to a specific path
            },
        ],
    }
};

export default nextConfig;
