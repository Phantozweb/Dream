/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['placeholder.com'],
  },
  env: {
    // Public environment variables that can be used in the browser
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Ensure we're not relying on server-only env vars in client components
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai'],
  },
}

export default nextConfig

