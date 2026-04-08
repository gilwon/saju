import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "jhpzjehvpulcvmsuuilm.supabase.co",
      },
    ],
  },
  // Security Headers
  async headers() {
    return [
      // 위젯 iframe용: X-Frame-Options 제외 (외부 사이트 임베딩 허용)
      {
        source: "/widget/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // 나머지 경로: 보안 헤더
      {
        source: "/((?!widget).*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://*.paddle.com https://*.profitwell.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paddle.com",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://*.paddle.com https://*.profitwell.com",
              "font-src 'self' https://fonts.gstatic.com https://*.paddle.com",
              "connect-src 'self' https://*.supabase.co https://accounts.google.com https://generativelanguage.googleapis.com wss://*.supabase.co https://*.paddle.com https://*.profitwell.com",
              "frame-src 'self' https://accounts.google.com https://*.paddle.com https://buy.paddle.com",
              "frame-ancestors 'self' https://*.paddle.com https://buy.paddle.com",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
