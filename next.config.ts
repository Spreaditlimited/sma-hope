import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 2 },
  outputFileTracingIncludes: {"/*": ["./certificates/mysql-ca.pem"]},
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      ...['/account/:path*','/admin/:path*','/report-a-concern/:path*','/clinician-network/:path*'].map(source=>({source,headers:[{key:'Referrer-Policy',value:'no-referrer'},{key:'Cache-Control',value:'private, no-store'}]})),
    ];
  },
};
export default nextConfig;
