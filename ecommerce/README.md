# Proyecto E-Commerce con Blockchain y Stablecoins

Sistema completo de e-commerce basado en blockchain que integra:
- ✅ Creación y gestión de una stablecoin (EuroToken)
- ✅ Compra de stablecoins con tarjeta de crédito (Stripe)
- ✅ Pasarela de pagos con criptomonedas
- ✅ Smart contracts para gestión de comercio electrónico
- ✅ Aplicación web de administración para empresas (estructura base)
- ✅ Aplicación web para clientes finales (estructura base)

## Estado del Proyecto

Ver [PROGRESO.md](./PROGRESO.md) para detalles del estado actual.

## Arquitectura del Proyecto

```
ecommerce/
├── stablecoin/
│   ├── sc/                          # ✅ Smart Contract EuroToken
│   ├── compra-stablecoin/           # ✅ App para comprar tokens con Stripe
│   └── pasarela-de-pago/            # ✅ Pasarela de pagos con tokens
├── sc-ecommerce/                    # ✅ Smart Contract E-commerce
├── web-admin/                       # ✅ Panel de administración (estructura base)
├── web-customer/                    # ✅ Tienda online para clientes (estructura base)
└── restart-all.sh                   # ✅ Script de deploy completo
```

✅ = Completado

## Tecnologías Utilizadas

### Blockchain y Smart Contracts
- **Solidity**: Lenguaje para smart contracts
- **Foundry/Forge**: Framework de desarrollo y testing
- **Anvil**: Blockchain local para desarrollo
- **Ethers.js v6**: Librería para interactuar con Ethereum

### Frontend
- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **MetaMask**: Wallet de criptomonedas

### Pagos
- **Stripe**: Procesamiento de pagos fiat
- **ERC20**: Estándar de token para EuroToken

## Instalación

### Requisitos Previos

- Node.js 18+
- Foundry (para smart contracts)
- MetaMask instalado en el navegador

### Instalación de Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Setup del Proyecto

1. **Clonar y entrar al directorio**
   ```bash
   cd ecommerce
   ```

2. **Smart Contract EuroToken**
   ```bash
   cd stablecoin/sc
   forge install OpenZeppelin/openzeppelin-contracts
   forge build
   forge test
   ```

3. **Aplicación Compra Stablecoin**
   ```bash
   cd stablecoin/compra-stablecoin
   npm install
   cp env.example .env
   # Editar .env con tus keys
   npm run dev
   ```

4. **Pasarela de Pagos** (pendiente completar)
   ```bash
   cd stablecoin/pasarela-de-pago
   npm install
   npm run dev
   ```

## Puertos de las Aplicaciones

- Anvil: `http://localhost:8545`
- Compra Stablecoin: `http://localhost:6001`
- Pasarela de Pago: `http://localhost:6002`
- Web Admin: `http://localhost:6003`
- Web Customer: `http://localhost:6004`

## Desarrollo

### Iniciar Blockchain Local

```bash
anvil
```

### Deploy de Contratos

Ver documentación en cada directorio:
- `stablecoin/sc/README.md` - Deploy de EuroToken
- `sc-ecommerce/README.md` - Deploy de Ecommerce (pendiente)

### Variables de Entorno

Cada aplicación necesita sus propias variables. Consulta los README individuales:
- `stablecoin/compra-stablecoin/env.example`
- `stablecoin/pasarela-de-pago/.env.example` (pendiente)

## Estructura por Componente

### 1. EuroToken Smart Contract ✅

**Ubicación:** `stablecoin/sc/`

Token ERC20 con:
- 6 decimales
- Función mint (solo owner)
- Función burn
- Tests completos

**Ver:** [stablecoin/sc/README.md](./stablecoin/sc/README.md)

### 2. Compra Stablecoin ✅

**Ubicación:** `stablecoin/compra-stablecoin/`

Aplicación para comprar EURT con Stripe:
- Conexión MetaMask
- Pago con tarjeta
- Mint automático de tokens

**Ver:** [stablecoin/compra-stablecoin/README.md](./stablecoin/compra-stablecoin/README.md)

### 3. Pasarela de Pagos ✅

**Ubicación:** `stablecoin/pasarela-de-pago/`

Sistema de pagos con EuroToken:
- ✅ Aprobación de tokens
- ✅ Pago a comerciantes
- ✅ Redirección automática
- ✅ Verificación de saldo

**Ver:** [stablecoin/pasarela-de-pago/README.md](./stablecoin/pasarela-de-pago/README.md)

### 4. Smart Contract E-commerce ✅

**Ubicación:** `sc-ecommerce/`

Gestión completa de e-commerce:
- ✅ Empresas (CompanyLib)
- ✅ Productos (ProductLib)
- ✅ Carritos (CartLib)
- ✅ Facturas (InvoiceLib)
- ✅ Pagos (PaymentLib)
- ✅ Contrato principal integrado

**Ver:** [sc-ecommerce/README.md](./sc-ecommerce/README.md)

### 5. Web Admin ✅

**Ubicación:** `web-admin/`

Panel para empresas (estructura base):
- ✅ Estructura Next.js 15 configurada
- 📋 Gestión de productos (pendiente implementación completa)
- 📋 Ver invoices (pendiente implementación completa)
- 📋 Gestión de clientes (pendiente implementación completa)

**Ver:** [web-admin/README.md](./web-admin/README.md)

### 6. Web Customer ✅

**Ubicación:** `web-customer/`

Tienda online (estructura base):
- ✅ Estructura Next.js 15 configurada
- 📋 Catálogo de productos (pendiente implementación completa)
- 📋 Carrito de compras (pendiente implementación completa)
- 📋 Checkout (pendiente implementación completa)

**Ver:** [web-customer/README.md](./web-customer/README.md)

## Testing

```bash
# Tests de contratos
cd stablecoin/sc && forge test
cd sc-ecommerce && forge test

# Tests de integración
# (pendiente de implementar)
```

## Documentación

- [PROGRESO.md](./PROGRESO.md) - Estado actual del proyecto
- Cada directorio tiene su propio README.md

## Próximos Pasos

1. Completar Pasarela de Pagos
2. Implementar Smart Contract E-commerce
3. Crear Web Admin
4. Crear Web Customer
5. Script de deploy automatizado
6. Tests de integración completos

## Contribuir

Este es un proyecto educativo. Sigue la estructura establecida y documenta tus cambios.

## Licencia

MIT

## Recursos

- [Foundry Book](https://book.getfoundry.sh/)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
