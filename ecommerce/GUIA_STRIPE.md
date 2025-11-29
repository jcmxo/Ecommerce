# Guía: Cómo Obtener Credenciales de Stripe

Esta guía te ayudará a obtener las API keys de Stripe necesarias para la aplicación de compra de stablecoins.

## Paso 1: Crear Cuenta en Stripe

1. Ve a [https://stripe.com](https://stripe.com)
2. Haz clic en "Sign up" (Registrarse) en la esquina superior derecha
3. Completa el formulario de registro:
   - Email
   - Contraseña
   - Nombre completo
   - País

### ⚠️ Si tu País no está en la Lista

**Para Desarrollo y Testing:**

Stripe puede no estar disponible en todos los países para producción, pero para **desarrollo y testing** puedes usar:

- **Estados Unidos** (United States) - Recomendado para testing
- **España** (Spain) - También funciona bien
- **México** (Mexico)
- Cualquier país de la lista disponible

**¿Por qué?**
- En modo de prueba (Test Mode), puedes usar cualquier país disponible
- Las tarjetas de prueba funcionan igual sin importar el país seleccionado
- Esto es solo para la cuenta, no afecta el funcionamiento de las pruebas
- Para producción real, más adelante podrías necesitar verificar disponibilidad

**Solución:**
1. Selecciona "Estados Unidos" o "España" en el formulario de registro
2. Completa el resto del formulario normalmente
3. Continúa con el proceso de registro
4. Una vez dentro, podrás usar Stripe en modo de prueba sin problemas

**Para Producción Real:**
- Verifica la disponibilidad de Stripe en Colombia consultando: [https://stripe.com/global](https://stripe.com/global)
- O contacta con el soporte de Stripe si necesitas usar Colombia específicamente

4. Confirma tu email siguiendo el enlace que recibirás

### Modal de Bienvenida - Configuración de Empresa

Después de confirmar tu email, Stripe te mostrará un modal preguntando sobre tu empresa.

**Para desarrollo y pruebas demo, puedes usar:**

**Opción 1: Omitir (Recomendado para pruebas)**
- Haz clic en **"Omitir por ahora"** (Skip for now)
- Esto te permitirá continuar sin completar esta información
- Puedes configurarlo más adelante si es necesario

**Opción 2: Completar con datos de prueba**
Si prefieres completarlo, usa:

- **Nombre de la empresa**: 
  ```
  Mi Tienda Demo
  ```
  O cualquier nombre que desees, por ejemplo:
  ```
  E-Commerce Blockchain Demo
  ```

- **Sitio web de la empresa (opcional)**: 
  ```
  http://localhost:6001
  ```
  O puedes dejarlo vacío ya que es opcional.

**Ejemplo para este proyecto:**
```
Nombre de la empresa: E-Commerce Blockchain Demo
Sitio web: http://localhost:6001
```

Luego haz clic en **"Continuar"** (Continue).

**💡 Recomendación**: Para agilizar el proceso, simplemente haz clic en **"Omitir por ahora"**. Esto no afecta el uso de Stripe para desarrollo y testing.

### Pantalla: "¿Cómo quieres empezar?" (Selección de Funcionalidades)

Si después del modal anterior te aparece esta pantalla, aquí está qué elegir:

**Para este proyecto de e-commerce blockchain:**

✅ **Marca solo:**
- **"Pagos no recurrentes"** (Non-recurring payments) - Ya debería estar marcada por defecto

❌ **No necesitas marcar:**
- Pagos recurrentes
- Facturas
- Plataforma o marketplace
- Cobro de impuestos
- Pagos en persona
- Emisión de tarjetas

**¿Por qué?**
- En este proyecto solo necesitas procesar pagos únicos (compra de tokens)
- No necesitas suscripciones recurrentes
- Es el tipo más simple de integración de pagos

**Luego:**
- Haz clic en **"Continuar"** (Continue)

**Nota**: Si más adelante necesitas agregar otras funcionalidades, siempre puedes hacerlo desde la configuración de tu cuenta. Por ahora, con "Pagos no recurrentes" es suficiente.

## Paso 2: Activar Cuenta de Prueba (Test Mode)

Stripe ofrece dos modos:

- **Test Mode (Modo de Prueba)**: Para desarrollo y testing, usa tarjetas de prueba
- **Live Mode (Modo en Vivo)**: Para transacciones reales

Para desarrollo, usa **Test Mode** (está activado por defecto).

### Verificar que estás en Test Mode

1. Una vez dentro del dashboard (después de omitir o completar el modal de bienvenida), verifica que en la parte superior dice **"Test mode"** o **"Modo de prueba"**
2. Si dice "Live mode", haz clic y cámbialo a "Test mode"

**Importante**: Por defecto, Stripe inicia en Test Mode, así que deberías ver "Test mode" automáticamente. Si no lo ves, busca el toggle en la parte superior derecha del dashboard.

## Paso 3: Obtener las API Keys

1. En el dashboard de Stripe, ve a la sección **"Developers"** (Desarrolladores) en el menú lateral izquierdo
2. Haz clic en **"API keys"** o **"Claves API"**

Verás dos tipos de claves:

### Publishable Key (Clave Pública)
- Se usa en el frontend (Next.js)
- Comienza con `pk_test_...` (en modo prueba) o `pk_live_...` (en modo producción)
- Es segura de exponer públicamente

### Secret Key (Clave Secreta)
- Se usa en el backend (API routes de Next.js)
- Comienza con `sk_test_...` (en modo prueba) o `sk_live_...` (en modo producción)
- **NUNCA** debe exponerse públicamente

## Paso 4: Copiar las Claves

### Clave Pública (Publishable Key)
1. Copia la clave que dice **"Publishable key"**
2. Se verá así: `pk_test_51AbC123...`

### Clave Secreta (Secret Key)
1. Haz clic en **"Reveal test key"** o **"Revelar clave de prueba"** para ver la clave secreta
2. Copia la clave que dice **"Secret key"**
3. Se verá así: `sk_test_51AbC123...`

⚠️ **IMPORTANTE**: Si no puedes ver la clave secreta, haz clic en el ícono del ojo o en "Reveal" para mostrarla.

## Paso 5: Configurar en el Proyecto

### Para la aplicación Compra Stablecoin

1. Ve al directorio de la aplicación:
   ```bash
   cd stablecoin/compra-stablecoin
   ```

2. Crea o edita el archivo `.env`:
   ```bash
   cp env.example .env
   # O simplemente crea .env
   ```

3. Edita el archivo `.env` y agrega tus claves:

   ```env
   # Stripe Keys
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
   STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui

   # Ethereum
   NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
   RPC_URL=http://localhost:8545

   # Wallet privada para hacer mint (solo backend)
   WALLET_PRIVATE_KEY=0x...
   ```

4. **NO** incluyas espacios antes o después del `=`
5. **NO** incluyas comillas alrededor de los valores

### Ejemplo de archivo .env completo:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123dEf456GhI789JkL012MnOpQrStUvWxYz
STRIPE_SECRET_KEY=sk_test_51AbC123dEf456GhI789JkL012MnOpQrStUvWxYz
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Paso 6: Verificar Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   # Detén el servidor (Ctrl+C)
   # Luego inícialo de nuevo
   npm run dev
   ```

2. Verifica que no hay errores de configuración en la consola

## Tarjetas de Prueba de Stripe

Stripe proporciona tarjetas de prueba para testing. Estas funcionan solo en **Test Mode**:

### Tarjeta de Éxito
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/25)
CVC: Cualquier 3 dígitos (ej: 123)
ZIP: Cualquier código postal (ej: 12345)
```

### Otras Tarjetas de Prueba

| Descripción | Número de Tarjeta | Resultado |
|-------------|-------------------|-----------|
| Pago exitoso | `4242 4242 4242 4242` | ✅ Aprobado |
| Pago rechazado | `4000 0000 0000 0002` | ❌ Rechazado |
| Requiere autenticación | `4000 0027 6000 3184` | 🔒 3D Secure |
| Fondos insuficientes | `4000 0000 0000 9995` | ❌ Fondos insuficientes |

### Más Tarjetas de Prueba

Ver todas las tarjetas de prueba en:
[https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)

## Verificar que Todo Funciona

1. Inicia la aplicación:
   ```bash
   cd stablecoin/compra-stablecoin
   npm run dev
   ```

2. Abre http://localhost:6001 en tu navegador

3. Intenta comprar tokens:
   - Conecta MetaMask
   - Ingresa una cantidad (ej: 100 EUR)
   - Usa la tarjeta de prueba: `4242 4242 4242 4242`
   - Completa el pago

4. Verifica que los tokens se acuñaron en tu wallet

## Solución de Problemas

### Error: "Invalid API Key"
- Verifica que copiaste las claves correctamente
- Asegúrate de que no hay espacios antes o después del `=`
- Verifica que estás usando claves de Test Mode (empiezan con `pk_test_` y `sk_test_`)

### Error: "API key not found"
- Verifica que agregaste `NEXT_PUBLIC_` antes de `STRIPE_PUBLISHABLE_KEY`
- Reinicia el servidor de desarrollo después de cambiar el `.env`

### Las tarjetas de prueba no funcionan
- Asegúrate de estar en **Test Mode** en el dashboard de Stripe
- Verifica que las claves sean de test (no de live)

### No veo la clave secreta
- Haz clic en "Reveal test key" o "Revelar clave de prueba"
- Asegúrate de estar en la sección de Test Mode keys

## Activar Modo en Vivo (Producción)

Cuando estés listo para producción:

1. Completa la activación de tu cuenta de Stripe
2. Cambia a **Live Mode** en el dashboard
3. Obtén las claves de Live Mode (empiezan con `pk_live_` y `sk_live_`)
4. Reemplaza las claves de test con las de live
5. Usa tarjetas reales (no de prueba)

## Seguridad

⚠️ **IMPORTANTE**:

1. **NUNCA** subas el archivo `.env` a Git
2. **NUNCA** compartas tu clave secreta (`sk_test_...`)
3. La clave pública (`pk_test_...`) puede estar en el frontend
4. La clave secreta solo debe estar en el backend (API routes)

El proyecto ya tiene `.env` en `.gitignore`, así que está protegido.

## Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [API Keys Documentation](https://stripe.com/docs/keys)
- [Testing Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)

## Soporte

Si tienes problemas:
1. Revisa la documentación de Stripe
2. Verifica los logs en la consola del servidor
3. Revisa los logs del navegador (F12 → Console)

¡Listo! Ya tienes todo configurado para usar Stripe en modo de prueba. 🎉

