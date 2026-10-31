import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The old Master Lab page is now a tab of /comments.
  async redirects() {
    return [
      { source: '/comments-old', destination: '/comments?tab=old', permanent: false },
      // 3D Depth became Arrivals.
      { source: '/3d-depth', destination: '/arrivals', permanent: false },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
