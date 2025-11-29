# Web Admin - Panel de Administración

Panel de administración para empresas del e-commerce blockchain.

## Características

- Gestión de empresas (registro, activación/desactivación)
- Gestión de productos (agregar, editar, actualizar stock)
- Visualización de facturas
- Gestión de clientes
- Estadísticas y métricas

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
RPC_URL=http://localhost:8545
```

## Desarrollo

```bash
npm run dev
# La aplicación estará en http://localhost:6003
```

## Estructura

- `/companies` - Lista de empresas
- `/company/[id]/products` - Productos de una empresa
- `/company/[id]/invoices` - Facturas de una empresa
- `/company/[id]/customers` - Clientes de una empresa

