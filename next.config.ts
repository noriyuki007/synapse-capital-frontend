import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // APIルート（動的処理）を動作させるため、一時的に無効化しました。

  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
