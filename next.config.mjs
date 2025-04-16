import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['v0.blob.com'],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-hstore'],
  },

  webpack: (config) => {
    return config;
  },
};

export default nextConfig;