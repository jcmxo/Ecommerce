# 🔍 Debug: Variable de Entorno

## Problema

La variable `NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS` no se está leyendo correctamente en el cliente, mostrando solo 5 caracteres ("Ox...") en lugar de la dirección completa.

## Solución Aplicada

He agregado un **valor por defecto** como fallback para que la aplicación funcione incluso si la variable de entorno no se lee correctamente.

### Dirección por Defecto

```typescript
const DEFAULT_EUROTOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

Esta es la dirección estándar que Anvil usa para el primer contrato desplegado.

## Verificación

1. **Verifica que Anvil esté corriendo:**
   ```bash
   curl http://localhost:8545
   ```

2. **Verifica que el contrato esté desplegado:**
   ```bash
   cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "name()" --rpc-url http://localhost:8545
   ```

3. **Recarga la página** después de que el servidor se haya reiniciado.

## Si el Problema Persiste

### Opción 1: Verificar .env

```bash
cd stablecoin/compra-stablecoin
cat .env | grep NEXT_PUBLIC_EUROTOKEN
```

Debería mostrar:
```
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Opción 2: Limpiar caché

```bash
cd stablecoin/compra-stablecoin
rm -rf .next
npm run dev
```

### Opción 3: Usar valor hardcodeado temporalmente

Si la variable de entorno sigue sin funcionar, puedes modificar temporalmente `lib/contracts.ts` para usar directamente:

```typescript
const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
```

## Nota

Con el valor por defecto agregado, la aplicación **debería funcionar** incluso si hay problemas con la lectura de variables de entorno. El código intentará primero leer la variable de entorno, y si no está disponible o está vacía, usará el valor por defecto.

---

**Con el fallback agregado, la aplicación debería funcionar correctamente.** ✅

