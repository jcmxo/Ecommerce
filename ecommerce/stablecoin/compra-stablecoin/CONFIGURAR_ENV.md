# Cómo Configurar el Archivo .env

## Archivo .env Creado

El archivo `.env` ya está creado. Ahora necesitas agregar tus claves de Stripe.

## Paso 1: Abrir el archivo .env

Puedes editarlo con cualquier editor de texto:
- VS Code: `code .env`
- Notepad (Windows)
- Nano o Vim (Linux/Mac)

## Paso 2: Reemplazar los Valores

En el archivo `.env`, reemplaza:

### 1. Clave Pública de Stripe

Busca esta línea:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Y reemplázala con tu clave pública real:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
```

### 2. Clave Secreta de Stripe

Busca esta línea:
```env
STRIPE_SECRET_KEY=sk_test_...
```

Y reemplázala con tu clave secreta real:
```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
```

## Paso 3: Ejemplo Completo

Tu archivo `.env` debería verse así (con tus claves reales):

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SYpr1AMqEhwtJn8AbC123...
STRIPE_SECRET_KEY=sk_test_51SYpr1AMqEhwtJn8AbC123...

# Ethereum (configurar después del deploy)
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0x...
```

## Paso 4: Guardar y Reiniciar

1. ✅ Guarda el archivo (Ctrl+S o Cmd+S)
2. ✅ Reinicia el servidor para que tome los nuevos valores

## Verificación

Después de agregar tus claves:

1. Las claves deben empezar con:
   - `pk_test_...` para la clave pública
   - `sk_test_...` para la clave secreta

2. No debe haber espacios alrededor del `=`

3. No uses comillas alrededor de los valores

## Nota sobre Ethereum

Las variables de Ethereum (`EUROTOKEN_CONTRACT_ADDRESS`, etc.) las configurarás después cuando despliegues los contratos. Por ahora, déjalas como están o pon valores de ejemplo.

