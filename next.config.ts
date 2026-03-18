import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Cloudflare Pages は 'out' ディレクトリを配信するため必要です

  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
