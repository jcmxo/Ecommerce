# Web Customer - Tienda Online

Aplicación web para clientes finales para comprar productos con EuroToken.

## Características

- Catálogo de productos de todas las empresas
- Carrito de compras
- Checkout y creación de facturas
- Historial de pedidos
- Integración con pasarela de pagos

## Tecnologías

- Next.js 15
- TypeScript
- Tailwind CSS
- Ethers.js v6
- MetaMask

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con las direcciones de los contratos
npm run dev
```

## Variables de Entorno

```env
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_GATEWAY_URL=http://localhost:6002
RPC_URL=http://localhost:8545
```

## Desarrollo

```bash
npm run dev
# La aplicación estará en http://localhost:6004
```

## Estructura

- `/` - Catálogo de productos
- `/cart` - Carrito de compras
- `/orders` - Historial de pedidos
- `/order/[id]` - Detalle de un pedido

