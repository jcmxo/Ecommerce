# ✅ Solución: Dirección de Contrato Inválida

## Problema

Ves el error: **"Dirección de contrato inválida: Ox..."**

## Causa

El error aparece porque Next.js no ha cargado las variables de entorno desde el archivo `.env`. En Next.js, las variables de entorno se leen **solo cuando se inicia el servidor**.

## Solución Rápida

### 1. Detén el servidor actual

En la terminal donde está corriendo el servidor (`npm run dev`), presiona:
```
Ctrl + C
```

### 2. Reinicia el servidor

```bash
cd stablecoin/compra-stablecoin
npm run dev
```

### 3. Recarga la página

Una vez que el servidor esté corriendo nuevamente, recarga la página en el navegador (F5).

## Verificación

Después de reiniciar, deberías ver:

- ✅ La página carga sin errores
- ✅ Puedes conectar MetaMask
- ✅ Puedes ver el balance (aunque sea 0.0)
- ✅ Puedes ver el formulario de compra

## Si el problema persiste

### Opción 1: Verificar el archivo .env

Abre `stablecoin/compra-stablecoin/.env` y verifica que tenga:

```bash
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**No debe tener:**
- ❌ Espacios antes o después del `=`
- ❌ Comillas alrededor del valor
- ❌ Saltos de línea en medio

### Opción 2: Limpiar caché de Next.js

```bash
cd stablecoin/compra-stablecoin
rm -rf .next
npm run dev
```

### Opción 3: Reconfigurar todo

Si nada funciona, ejecuta el script de configuración completa:

```bash
cd /mnt/c/Users/jcmxo/ecommerce
bash setup-completo.sh
```

## Nota Importante

**En Next.js, cada vez que cambias variables de entorno en el archivo `.env`, DEBES reiniciar el servidor para que los cambios surtan efecto.**

Las variables de entorno se cargan al inicio del servidor, no durante la ejecución.

---

**Solución: Reinicia el servidor y el error desaparecerá.** ✅

