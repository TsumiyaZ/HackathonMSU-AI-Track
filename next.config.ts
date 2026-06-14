import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/ai/plan": ["./data/**/*"],
      "/api/admin/stats": ["./data/**/*"],
      "/api/admin/hotels": ["./data/**/*"],
      "/api/admin/users": ["./data/**/*"],
      "/api/auth/login": ["./data/**/*"],
      "/api/auth/register": ["./data/**/*"],
      "/api/auth/check-session": ["./data/**/*"],
    },
  },
};

export default nextConfig;
