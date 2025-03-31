// ES Module syntax for imports
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the equivalent of __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure images
  images: {
    domains: ['v0.blob.com'],
  },
  
  // TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Example webpack configuration
  webpack: (config) => {
    return config;
  },
};

// ES Module syntax for exports
export default nextConfig;

