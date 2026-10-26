import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Static pages cannot carry per-request nonces, so inline scripts (Next.js
// bootstrap and the theme script) require 'unsafe-inline'. Everything else is
// locked to this origin.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/api/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
  async redirects() {
    // The contribution guide became the public design principles page.
    return [{ source: "/docs/contributing", destination: "/docs/design", permanent: true }];
  },
};

// Plugins are referenced by name so the config stays serialisable for Turbopack.
const withMDX = createMDX({
  options: { remarkPlugins: ["remark-gfm"] },
});

export default withMDX(nextConfig);
