import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Transloadit + any HTTPS CDN that might be used
    // for sample workflow media in production.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.transloadit.com', // ** required for subdomain wildcards
      },
      {
        protocol: 'https',
        hostname: '**.tlcdn.com',       // Transloadit's CDN for processed files
      },
      {
        protocol: 'https',
        hostname: 'pub-e8fef8c0e03b44acb340577811800829.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Fallback: allow any HTTPS host for images.
      // This avoids production-only failures when Transloadit
      // serves from a different CDN/domain than expected.
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase body size limit for file uploads (default is 10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // This is the key setting for API routes
    proxyClientMaxBodySize: 52428800, // 50MB in bytes
  },
};

export default nextConfig;