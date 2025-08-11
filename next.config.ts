import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import packageJson from './package.json';

// Determine the environment
const mediaDomain = process.env.NODE_ENV === 'production' ? 'https://media.sealed.love' : 'https://devmedia.sealed.love';

// Get app version from package.json
const appVersion = packageJson.version;

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Auth.js configuration
  serverExternalPackages: ['@auth/core'],
  env: {
    AUTH_TRUST_HOST: 'true',
    MEDIA_DOMAIN: mediaDomain,
    APP_VERSION: appVersion,
  },
  // Security headers configuration
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          // HSTS - Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content-Security-Policy - Prevent XSS, clickjacking, etc.
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https:; object-src 'none';",
          },
          // X-Content-Type-Options - Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-Frame-Options - Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Referrer-Policy - Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy - Limit features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // X-XSS-Protection - Additional XSS protection for older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'src'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'samplelib.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'devmedia.sealed.love'
      },
      {
        protocol: 'https',
        hostname: 'media.sealed.love'
      },
      {
        protocol: 'https',
        hostname: 'dev.sealed.love'
      }
    ]
  },
  // Configure allowed origins for dev server
  allowedDevOrigins: ['dev.sealed.love']
};

export default withNextIntl(nextConfig);
