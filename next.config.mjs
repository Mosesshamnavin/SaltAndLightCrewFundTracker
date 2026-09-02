/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable persistent disk pack file caching in dev mode on Windows
      // This permanently eliminates ENOENT pack.gz file lock conflicts and 404 CSS drops during hot-reloading
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
