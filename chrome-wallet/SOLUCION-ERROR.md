# 🔧 Solución al Error: "Method not supported: wallet_setAccounts"

## El Problema

El error indica que el service worker (background.js) no tiene la versión actualizada del código. El método `wallet_setAccounts` existe en el código, pero el service worker en ejecución es una versión antigua.

## Solución Rápida

### Opción 1: Recargar el Service Worker (Recomendado)

1. Ve a `chrome://extensions/`
2. Busca "CodeCrypto Wallet"
3. Haz clic en **"Inspeccionar vistas: service worker"** (o "Inspect views: service worker")
4. En la consola que se abre, haz clic derecho en el botón de recarga (↻) en la parte superior
5. Selecciona **"Hard reload"** o **"Recarga forzada"**
6. O simplemente cierra la consola y vuelve a abrirla

### Opción 2: Recargar la Extensión Completa

1. Ve a `chrome://extensions/`
2. Busca "CodeCrypto Wallet"
3. Haz clic en el icono de **recarga (↻)** junto a la extensión
4. Espera a que se recargue completamente

### Opción 3: Desactivar y Reactivar

1. Ve a `chrome://extensions/`
2. Desactiva el toggle de "CodeCrypto Wallet" (azul → gris)
3. Espera 2 segundos
4. Activa el toggle de nuevo (gris → azul)

## Verificar que Funcionó

Después de recargar:

1. Abre el popup de la extensión
2. Haz clic en "Generate New"
3. Haz clic en "Create Wallet"
4. **NO deberías ver el error** en la consola
5. Deberías ver la wallet creada con las 5 cuentas

## Si el Error Persiste

1. **Cierra todas las pestañas** que tengan la extensión abierta
2. Ve a `chrome://extensions/`
3. Haz clic en **"Quitar"** (Remove) en CodeCrypto Wallet
4. Vuelve a cargar la extensión desde la carpeta `dist/`
5. Prueba de nuevo

## Nota Técnica

Los service workers de Chrome a veces cachean la versión anterior. La recarga forzada asegura que se cargue la versión más reciente del código compilado.

