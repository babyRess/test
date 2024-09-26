/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'build',
  basePath: '/game',

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
