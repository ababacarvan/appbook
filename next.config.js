/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      '*.supabase.co',
      '*.vercel.app'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // serverActions est maintenant activé par défaut, on peut le retirer
  // Ou on peut le garder avec la nouvelle syntaxe si nécessaire
  experimental: {
    // serverActions: true, // Commenté ou supprimé
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
}

module.exports = nextConfig