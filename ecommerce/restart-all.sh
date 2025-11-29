#!/bin/bash

# Script de deploy completo del proyecto E-commerce con Blockchain
# Este script automatiza el despliegue de todos los componentes

set -e

echo "🚀 Iniciando deploy del proyecto E-commerce..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Detener procesos anteriores
print_info "Deteniendo procesos anteriores..."
pkill -f "anvil" || true
pkill -f "next dev" || true
sleep 2

# 2. Iniciar Anvil (blockchain local)
print_info "Iniciando Anvil (blockchain local)..."
anvil --host 0.0.0.0 --port 8545 > anvil.log 2>&1 &
ANVIL_PID=$!
sleep 3

# Verificar que Anvil está corriendo
if ! kill -0 $ANVIL_PID 2>/dev/null; then
    print_error "Error al iniciar Anvil"
    exit 1
fi

print_info "Anvil iniciado (PID: $ANVIL_PID)"

# Obtener la primera cuenta de Anvil (deployer)
DEPLOYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DEPLOYER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

print_info "Deployer address: $DEPLOYER_ADDRESS"

# 3. Deploy EuroToken
print_info "Deployando EuroToken..."
cd stablecoin/sc
export PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY

EUROTOKEN_ADDRESS=$(forge script script/DeployEuroToken.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vvv 2>&1 | grep "EuroToken deployed at:" | awk '{print $NF}' | head -1)

if [ -z "$EUROTOKEN_ADDRESS" ]; then
    print_error "Error al obtener dirección de EuroToken"
    exit 1
fi

print_info "EuroToken desplegado en: $EUROTOKEN_ADDRESS"
cd ../..

# 4. Deploy Ecommerce
print_info "Deployando contrato Ecommerce..."
cd sc-ecommerce
export PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY

ECOMMERCE_ADDRESS=$(forge script script/DeployEcommerce.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vvv 2>&1 | grep "Ecommerce deployed at:" | awk '{print $NF}' | head -1)

if [ -z "$ECOMMERCE_ADDRESS" ]; then
    print_error "Error al obtener dirección de Ecommerce"
    exit 1
fi

print_info "Ecommerce desplegado en: $ECOMMERCE_ADDRESS"
cd ..

# 5. Actualizar variables de entorno
print_info "Actualizando variables de entorno..."

# Compra Stablecoin
cat > stablecoin/compra-stablecoin/.env << EOF
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EUROTOKEN_ADDRESS
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
EOF

# Pasarela de Pagos
cat > stablecoin/pasarela-de-pago/.env << EOF
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EUROTOKEN_ADDRESS
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=$ECOMMERCE_ADDRESS
NEXT_PUBLIC_RPC_URL=http://localhost:8545
EOF

# Web Admin
cat > web-admin/.env << EOF
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=$ECOMMERCE_ADDRESS
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EUROTOKEN_ADDRESS
NEXT_PUBLIC_RPC_URL=http://localhost:8545
EOF

# Web Customer
cat > web-customer/.env << EOF
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=$ECOMMERCE_ADDRESS
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EUROTOKEN_ADDRESS
NEXT_PUBLIC_PAYMENT_GATEWAY_URL=http://localhost:6002
NEXT_PUBLIC_RPC_URL=http://localhost:8545
EOF

# 6. Iniciar aplicaciones Next.js
print_info "Iniciando aplicaciones Next.js..."

# Compra Stablecoin
cd stablecoin/compra-stablecoin
npm install > /dev/null 2>&1 || print_warning "Error instalando dependencias de compra-stablecoin"
npm run dev > ../../compra-stablecoin.log 2>&1 &
COMPRA_PID=$!
cd ../..

# Pasarela de Pagos
cd stablecoin/pasarela-de-pago
npm install > /dev/null 2>&1 || print_warning "Error instalando dependencias de pasarela-de-pago"
npm run dev > ../../pasarela-de-pago.log 2>&1 &
PASARELA_PID=$!
cd ../..

# Web Admin
cd web-admin
npm install > /dev/null 2>&1 || print_warning "Error instalando dependencias de web-admin"
npm run dev > ../web-admin.log 2>&1 &
ADMIN_PID=$!
cd ..

# Web Customer
cd web-customer
npm install > /dev/null 2>&1 || print_warning "Error instalando dependencias de web-customer"
npm run dev > ../web-customer.log 2>&1 &
CUSTOMER_PID=$!
cd ..

sleep 5

# 7. Resumen
echo ""
print_info "=========================================="
print_info "Deploy completado exitosamente!"
print_info "=========================================="
echo ""
print_info "Contratos desplegados:"
echo "  EuroToken: $EUROTOKEN_ADDRESS"
echo "  Ecommerce: $ECOMMERCE_ADDRESS"
echo ""
print_info "Aplicaciones corriendo:"
echo "  Anvil (Blockchain): http://localhost:8545 (PID: $ANVIL_PID)"
echo "  Compra Stablecoin: http://localhost:6001 (PID: $COMPRA_PID)"
echo "  Pasarela de Pago: http://localhost:6002 (PID: $PASARELA_PID)"
echo "  Web Admin: http://localhost:6003 (PID: $ADMIN_PID)"
echo "  Web Customer: http://localhost:6004 (PID: $CUSTOMER_PID)"
echo ""
print_warning "Nota: Las aplicaciones pueden tardar unos segundos en iniciarse completamente"
echo ""
print_info "Para detener todo, ejecuta: ./stop-all.sh"
echo ""

# Guardar PIDs para poder detenerlos después
cat > .pids << EOF
ANVIL_PID=$ANVIL_PID
COMPRA_PID=$COMPRA_PID
PASARELA_PID=$PASARELA_PID
ADMIN_PID=$ADMIN_PID
CUSTOMER_PID=$CUSTOMER_PID
EOF

print_info "PIDs guardados en .pids"

