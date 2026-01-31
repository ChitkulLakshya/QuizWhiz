import type { NextConfig } from 'next';

const isElectronBuild = process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  output: isElectronBuild ? 'export' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: isElectronBuild,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
