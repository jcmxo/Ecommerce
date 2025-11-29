#!/bin/bash

# Script para configurar el archivo .env con las claves de Stripe

cat > .env << 'EOF'
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SYprEAsv8aUk1j9o4oMUDqoApvBEoDLrzcKsXnV32ppl3M1l2ic3aUA1rorP2S9oobJqhljW2mbGamGTTNEBTM100AR2iCfO0
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui

# Ethereum (configurar después del deploy)
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
RPC_URL=http://localhost:8545

# Wallet privada para hacer mint (solo backend)
WALLET_PRIVATE_KEY=0x...
EOF

echo "✓ Archivo .env configurado correctamente"
echo ""
echo "Claves configuradas:"
echo "  - Clave pública: pk_test_51SYprEA..."
echo "  - Clave secreta: sk_test_51SYprEA..."
echo ""
echo "Puedes verificar el archivo ejecutando: cat .env"

