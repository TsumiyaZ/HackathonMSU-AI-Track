import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/ai/plan": ["./data/**/*"],
    "/api/admin/stats": ["./data/**/*"],
    "/api/admin/hotels": ["./data/**/*"],
    "/api/admin/users": ["./data/**/*"],
    "/api/auth/login": ["./data/**/*"],
    "/api/auth/register": ["./data/**/*"],
    "/api/auth/check-session": ["./data/**/*"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "zustand"],
  },
};

export default nextConfig;
