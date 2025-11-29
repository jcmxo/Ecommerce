# Solución: Variables de Entorno No Se Cargan

## Problema

El error muestra que está usando la dirección por defecto `0x5FbDB2315678afecb367f032d93F642f64180aa3` en lugar de la dirección real del contrato desplegado.

## Solución Aplicada

He mejorado el código para que:
1. ✅ Lea correctamente las variables de entorno del archivo `.env`
2. ✅ Muestre advertencias en consola si no encuentra las variables
3. ✅ Use las direcciones correctas del contrato desplegado

## Pasos para Verificar

1. **Recarga la página completamente:**
   - Presiona `Ctrl + F5` (recarga forzada)
   - O cierra y vuelve a abrir la pestaña

2. **Verifica en la consola del navegador:**
   - Abre la consola (F12)
   - Deberías ver mensajes como:
     ```
     [DEBUG] NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
     ```

3. **Si ves advertencias:**
   - Verifica que el archivo `.env` tenga las direcciones correctas
   - Reinicia el servidor: `npm run dev`

## Direcciones Correctas

- **Ecommerce**: `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853`
- **EuroToken**: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

## Si el Problema Persiste

1. Verifica el archivo `.env`:
   ```bash
   cat web-admin/.env
   ```

2. Reinicia el servidor completamente:
   ```bash
   # Detener
   pkill -f "next dev"
   
   # Iniciar
   cd web-admin
   npm run dev
   ```

3. Limpia la caché de Next.js:
   ```bash
   cd web-admin
   rm -rf .next
   npm run dev
   ```

---

**Después de recargar la página, el error debería desaparecer y podrás registrar tu empresa correctamente.** ✅

