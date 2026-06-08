import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "patchwiki.biligame.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
