# Solución: Error 500 Internal Server Error

## Estado Actual

El error 500 persiste después de varias correcciones. Este documento resume todos los cambios aplicados y las posibles causas restantes.

## Correcciones Aplicadas ✅

1. **`lib/contracts.ts`** - Mejorado para manejar el renderizado en servidor:
   - Validación de `typeof window !== 'undefined'` antes de usar APIs del navegador
   - Manejo de errores mejorado al acceder a `process.env`
   - Uso de valores por defecto cuando las variables de entorno no están disponibles

2. **`components/WalletConnect.tsx`** - Corregido el error de TypeScript:
   - Cambiado `window.ethereum?.on()` a `(window.ethereum as any).on?.()`

3. **`tsconfig.json`** - Actualizado para soportar BigInt:
   - `"target": "ES2020"` para soportar literales BigInt

4. **Todos los componentes** - Cambiados `0n` a `BigInt(0)` para compatibilidad

## Posibles Causas del Error 500

### 1. Error de Compilación No Visible

El error 500 podría ser causado por un error de compilación que no aparece en los logs.

**Solución:**
```bash
cd web-admin
rm -rf .next node_modules/.cache
npm run build
```

Si hay errores de compilación, aparecerán aquí.

### 2. Error en el Renderizado Inicial

Next.js podría estar intentando renderizar componentes del lado del servidor que usan APIs del navegador.

**Verificación:**
- Todos los componentes tienen `"use client"` ✅
- Todas las funciones que usan `window` verifican `typeof window !== 'undefined'` ✅

### 3. Problema con Variables de Entorno

Las variables de entorno podrían no estar cargándose correctamente.

**Verificación:**
```bash
cd web-admin
cat .env
```

Deberías ver:
```
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

### 4. Dependencias Faltantes

Algunas dependencias podrían no estar instaladas correctamente.

**Solución:**
```bash
cd web-admin
rm -rf node_modules package-lock.json
npm install
```

### 5. Conflicto de Puertos

El puerto 6003 podría estar ocupado por otro proceso.

**Solución:**
```bash
# En Windows/WSL, usar:
netstat -ano | findstr :6003
# Luego matar el proceso con PID mostrado

# En Linux:
lsof -ti:6003 | xargs kill -9
```

## Pasos para Diagnosticar

### Paso 1: Ver los Logs Reales del Servidor

```bash
cd web-admin
npm run dev 2>&1 | tee server.log
```

Luego abre el navegador y recarga la página. Los errores aparecerán en `server.log`.

### Paso 2: Verificar Errores de TypeScript

```bash
cd web-admin
npx tsc --noEmit
```

Si hay errores de TypeScript, corrígelos primero.

### Paso 3: Verificar Errores de Linter

```bash
cd web-admin
npm run lint
```

### Paso 4: Probar con Build de Producción

```bash
cd web-admin
npm run build
npm start
```

Si el build falla, el error aparecerá aquí.

### Paso 5: Verificar en el Navegador

1. Abre el navegador en `http://localhost:6003`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console" (Consola)
4. Ve a la pestaña "Network" (Red)
5. Busca la petición que falla y verifica:
   - El código de estado (debería ser 500)
   - La respuesta del servidor
   - Los headers de la petición

## Solución Temporal: Simplificar el Código

Si el error persiste, prueba crear una página mínima:

1. **Crea `app/test/page.tsx`:**
```tsx
export default function TestPage() {
  return <div>Test Page Works</div>;
}
```

2. **Visita `http://localhost:6003/test`**

Si esta página funciona, el problema está en `app/page.tsx` o sus componentes.

## Contacto para Más Ayuda

Si después de seguir todos estos pasos el error persiste, necesitamos:

1. Los logs completos del servidor cuando recargas la página
2. El mensaje de error exacto de la consola del navegador
3. La respuesta HTTP completa (status, headers, body) de la petición que falla

Esto nos ayudará a identificar la causa exacta del error 500.

