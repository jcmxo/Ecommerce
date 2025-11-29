/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Asegurar que las variables de entorno se expongan al cliente
  env: {
    NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS,
    NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  },
}

module.exports = nextConfig

