/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! ADVERTÊNCIA !!
    // Perigosamente permite que erros de tipo não quebrem o build de produção.
    // Isso é útil para fazer o deploy, mas os erros devem ser corrigidos.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
