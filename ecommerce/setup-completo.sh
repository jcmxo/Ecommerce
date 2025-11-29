#!/bin/bash

# Script para configurar todo el proyecto completo

set -e

echo "🚀 Configurando proyecto completo..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Detener procesos anteriores
echo -e "${YELLOW}[1/5]${NC} Deteniendo procesos anteriores..."
pkill -f anvil 2>/dev/null || true
sleep 2

# 2. Iniciar Anvil
echo -e "${YELLOW}[2/5]${NC} Iniciando Anvil (blockchain local)..."
anvil --host 0.0.0.0 --port 8545 > anvil.log 2>&1 &
ANVIL_PID=$!
sleep 5

# Verificar Anvil
if ! curl -s -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; then
    echo "❌ Error: Anvil no está respondiendo"
    exit 1
fi

echo -e "${GREEN}✓${NC} Anvil iniciado (PID: $ANVIL_PID)"
echo ""

# 3. Deploy EuroToken
echo -e "${YELLOW}[3/5]${NC} Desplegando contrato EuroToken..."
cd stablecoin/sc
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

DEPLOY_OUTPUT=$(forge script script/DeployEuroToken.s.sol --rpc-url http://localhost:8545 --broadcast 2>&1)
EUROTOKEN_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -i "EuroToken deployed at:" | tail -1 | awk '{print $NF}')

if [ -z "$EUROTOKEN_ADDRESS" ]; then
    # Intentar obtener de broadcast
    if [ -d "broadcast" ]; then
        EUROTOKEN_ADDRESS=$(find broadcast -name "run-latest.json" -exec cat {} \; 2>/dev/null | grep -o '"contractAddress":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
fi

if [ -z "$EUROTOKEN_ADDRESS" ]; then
    echo "❌ Error: No se pudo obtener la dirección de EuroToken"
    exit 1
fi

echo -e "${GREEN}✓${NC} EuroToken desplegado en: $EUROTOKEN_ADDRESS"
cd ../..
echo ""

# 4. Actualizar .env
echo -e "${YELLOW}[4/5]${NC} Actualizando archivo .env..."
cd stablecoin/compra-stablecoin

# Leer el .env actual y actualizar solo las variables de Ethereum
if [ -f .env ]; then
    # Mantener las claves de Stripe y actualizar Ethereum
    grep -v "EUROTOKEN_CONTRACT_ADDRESS\|WALLET_PRIVATE_KEY\|RPC_URL" .env > .env.tmp || true
    cat >> .env.tmp << EOF

# Ethereum - Configurado automáticamente
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EUROTOKEN_ADDRESS
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
EOF
    mv .env.tmp .env
    echo -e "${GREEN}✓${NC} Archivo .env actualizado"
else
    echo "⚠ Archivo .env no encontrado, creándolo..."
    cat > .env << EOF
# Stripe Keys - Agregar tus claves aquí
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui

# Ethereum - Configurado automáticamente
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EUROTOKEN_ADDRESS
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
EOF
    echo -e "${GREEN}✓${NC} Archivo .env creado"
fi

cd ../..
echo ""

# 5. Resumen
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuración Completada${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📋 Resumen:"
echo "  • Anvil corriendo en: http://localhost:8545"
echo "  • EuroToken desplegado en: $EUROTOKEN_ADDRESS"
echo "  • Archivo .env actualizado"
echo ""
echo "🎯 Próximos pasos:"
echo "  1. Reinicia el servidor Next.js (si está corriendo)"
echo "  2. Abre http://localhost:6001"
echo "  3. Conecta MetaMask a la red local (Chain ID: 31337)"
echo "  4. Prueba comprar tokens con Stripe"
echo ""
echo "💡 Para reiniciar el servidor:"
echo "   cd stablecoin/compra-stablecoin"
echo "   npm run dev"
echo ""

