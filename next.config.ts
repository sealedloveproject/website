import type { NextConfig } from "next";
import packageJson from './package.json';

// Determine the environment
const mediaDomain = process.env.NODE_ENV === 'production' ? 'https://media.sealed.love' : 'https://devmedia.sealed.love';

// Get app version from package.json
const appVersion = packageJson.version;

const nextConfig: NextConfig = {
  // Auth.js configuration
  serverExternalPackages: ['@auth/core'],
  env: {
    AUTH_TRUST_HOST: 'true',
    MEDIA_DOMAIN: mediaDomain,
    APP_VERSION: appVersion,
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

export default nextConfig;
