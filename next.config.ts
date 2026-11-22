import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Home is one long page of About, Projects and Play; their old pages go to their sections.
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: false },
      { source: "/projects", destination: "/#projects", permanent: false },
      { source: "/play", destination: "/#play", permanent: false },
    ];
  },
};

export default nextConfig;
