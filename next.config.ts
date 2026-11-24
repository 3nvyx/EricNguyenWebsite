import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Home is one long page of About and Projects; their old pages go to their sections. Play is gone,
  // so old links to it land on home.
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: false },
      { source: "/projects", destination: "/#projects", permanent: false },
      { source: "/play/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
