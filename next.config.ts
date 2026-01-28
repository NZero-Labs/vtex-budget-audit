import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático para GitHub Pages
  output: 'export',
  // Desabilitar otimização de imagem (não suportado em export estático)
  images: {
    unoptimized: true,
  },
  // Base path para GitHub Pages (ajuste se necessário)
  // basePath: '/vtex-budget-audit',
  // Trailing slash para compatibilidade
  trailingSlash: true,
};

export default nextConfig;
