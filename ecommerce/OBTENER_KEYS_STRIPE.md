# Guía Paso a Paso: Obtener las API Keys de Stripe

## Paso 1: Cerrar el Pop-up (Si está abierto)

Si ves un pop-up de **"Guía de configuración"** en la parte derecha:

1. ✅ Haz clic en la **X** (cruz) en la esquina superior derecha del pop-up
2. O simplemente ignóralo - puedes cerrarlo más tarde

**No necesitas completar la guía de configuración ahora.** Solo necesitas las API keys.

## Paso 2: Buscar la Sección "Claves Standard" (Standard Keys)

En la página de API Keys, busca la sección que dice:

**"Claves Standard"** (Standard Keys)

Está más abajo en la página, debajo de "Claves restringidas".

## Paso 3: Obtener la Clave Pública (Publishable Key)

En la sección "Claves Standard", verás algo como:

```
Clave publicable (Publishable key)
pk_test_51AbC123... [botón para copiar]
```

**Acción:**
1. Busca el texto que dice **"Clave publicable"** o **"Publishable key"**
2. Verás una clave que comienza con `pk_test_`
3. Haz clic en el botón de **copiar** (ícono de copiar) al lado de la clave
4. **Guarda esta clave** - la necesitarás para el archivo `.env`

**Ejemplo de cómo se ve:**
```
Clave publicable: pk_test_51SYpr1A... [📋 Copiar]
```

## Paso 4: Obtener la Clave Secreta (Secret Key)

En la misma sección "Claves Standard", verás:

```
Clave secreta (Secret key)
•••••••••••••••• [Revelar clave de prueba]
```

**Acción:**
1. Busca el texto que dice **"Clave secreta"** o **"Secret key"**
2. Verás puntos o asteriscos ocultando la clave
3. Haz clic en el botón que dice **"Revelar clave de prueba"** o **"Reveal test key"**
4. Aparecerá la clave completa que comienza con `sk_test_`
5. Haz clic en el botón de **copiar** al lado de la clave
6. **Guarda esta clave** - la necesitarás para el archivo `.env`

**Ejemplo de cómo se ve:**
```
Clave secreta: •••••••••••••••• [👁️ Revelar clave de prueba]
```

Después de hacer clic en "Revelar":
```
Clave secreta: sk_test_51SYpr1A... [📋 Copiar]
```

## Paso 5: Verificar que Tienes Ambas Claves

Deberías tener:

✅ **Clave pública:** `pk_test_51...` (comienza con `pk_test_`)
✅ **Clave secreta:** `sk_test_51...` (comienza con `sk_test_`)

## Paso 6: Configurar en el Proyecto

Ahora configura estas claves en tu proyecto:

### 1. Navega al directorio del proyecto

```bash
cd stablecoin/compra-stablecoin
```

### 2. Crea o edita el archivo `.env`

```bash
# Si existe env.example, cópialo
cp env.example .env

# O crea el archivo directamente
touch .env
```

### 3. Edita el archivo `.env` y agrega:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui

# Ethereum (a configurar después)
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0x...
```

**Importante:**
- Reemplaza `pk_test_tu_clave_publica_aqui` con tu clave pública real
- Reemplaza `sk_test_tu_clave_secreta_aqui` con tu clave secreta real
- No dejes espacios alrededor del `=`
- No uses comillas

### 4. Ejemplo de archivo `.env` completo:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SYpr1AMqEhwtJn8AbC123dEf456GhI789JkL012MnOpQrStUvWxYz
STRIPE_SECRET_KEY=sk_test_51SYpr1AMqEhwtJn8AbC123dEf456GhI789JkL012MnOpQrStUvWxYz
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Solución de Problemas

### No veo la sección "Claves Standard"

**Solución:**
- Desplázate hacia abajo en la página
- Puede estar después de otras secciones
- Busca específicamente el texto "Claves Standard"

### No puedo ver la clave secreta

**Solución:**
1. Busca el botón que dice "Revelar clave de prueba" o "Reveal test key"
2. Haz clic en ese botón
3. La clave aparecerá
4. También puede ser un ícono de ojo 👁️ - haz clic en él

### La clave no se copia

**Solución:**
1. Selecciona manualmente la clave con el mouse
2. Presiona `Ctrl+C` (o `Cmd+C` en Mac)
3. Pégalo en un editor de texto primero
4. Luego cópialo al archivo `.env`

### Veo un mensaje de error

**Solución:**
- Asegúrate de estar en **"Test mode"** (debería decir "Entorno de prueba" en la parte superior)
- Si estás en "Live mode", cambia a "Test mode"
- Las claves de test comienzan con `pk_test_` y `sk_test_`

## Verificación Final

Después de configurar el `.env`:

1. ✅ Verifica que las claves empiecen con `pk_test_` y `sk_test_`
2. ✅ Verifica que no haya espacios antes o después del `=`
3. ✅ Verifica que no hay comillas alrededor de los valores
4. ✅ Guarda el archivo `.env`

## Próximos Pasos

Una vez que tengas las keys configuradas:

1. ✅ Instala las dependencias (si no lo has hecho):
   ```bash
   npm install
   ```

2. ✅ Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. ✅ Verifica que no hay errores en la consola

4. ✅ Abre http://localhost:6001 en tu navegador

## Recordatorios Importantes

⚠️ **NUNCA**:
- Compartas tu clave secreta (`sk_test_...`)
- Subas el archivo `.env` a Git
- Exponas la clave secreta en el frontend

✅ **SÍ puedes**:
- Usar la clave pública (`pk_test_...`) en el frontend
- Compartir la clave pública (es segura)

---

## Resumen Rápido

```
1. Cierra el pop-up de guía
2. Busca "Claves Standard"
3. Copia la clave pública (pk_test_...)
4. Haz clic en "Revelar clave de prueba"
5. Copia la clave secreta (sk_test_...)
6. Pega ambas en el archivo .env
7. ¡Listo! 🎉
```

¿Necesitas ayuda con algún paso específico? 

