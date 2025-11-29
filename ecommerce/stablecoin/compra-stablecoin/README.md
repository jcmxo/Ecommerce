# Compra Stablecoin - Aplicación de Compra de EuroToken

Aplicación Next.js que permite a usuarios comprar EuroTokens (EURT) usando tarjeta de crédito a través de Stripe.

## Características

- ✅ Conexión con MetaMask
- ✅ Compra de tokens con tarjeta de crédito (Stripe)
- ✅ Mint automático de tokens después del pago
- ✅ Visualización de balance en tiempo real
- ✅ Validación de montos (mínimo €10, máximo €10,000)

## Tecnologías

- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Stripe**: Procesamiento de pagos
- **Ethers.js v6**: Interacción con blockchain
- **MetaMask**: Wallet de criptomonedas

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus valores
```

## Variables de Entorno

```env
# Stripe Keys (obtén en https://dashboard.stripe.com/test/apikeys)
# Ver guía completa: ../../GUIA_STRIPE.md
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Ethereum
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x... # Dirección del contrato EuroToken desplegado
RPC_URL=http://localhost:8545 # URL de Anvil o red Ethereum

# Wallet privada para hacer mint (solo backend)
WALLET_PRIVATE_KEY=0x... # Private key de la wallet que es owner del contrato EuroToken
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará en http://localhost:6001
```

## Flujo de Compra

1. Usuario conecta MetaMask
2. Ingresa cantidad de tokens a comprar (€10 - €10,000)
3. Completa información de tarjeta de crédito
4. Stripe procesa el pago
5. Backend hace mint de tokens a la wallet del usuario
6. Usuario ve los tokens en su billetera

## Endpoints API

### POST /api/create-payment-intent

Crea una intención de pago en Stripe.

**Body:**
```json
{
  "amount": 100,
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "clientSecret": "...",
  "paymentIntentId": "..."
}
```

### POST /api/mint-tokens

Hace mint de tokens después de un pago exitoso.

**Body:**
```json
{
  "paymentIntentId": "...",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "amount": 100
}
```

## Seguridad

- ✅ Validación de pagos en Stripe antes de mint
- ✅ Verificación de wallet address
- ✅ Prevención de doble mint (marcado en metadata)
- ✅ Variables de entorno para keys sensibles
- ✅ Validación de montos en frontend y backend

## Testing con Stripe

Usa las tarjetas de prueba de Stripe:
- **Éxito**: `4242 4242 4242 4242`
- **Rechazo**: `4000 0000 0000 0002`
- Cualquier fecha futura y CVC de 3 dígitos

📖 **Ver guía completa para obtener credenciales de Stripe**: [../../GUIA_STRIPE.md](../../GUIA_STRIPE.md)

## Licencia

MIT

