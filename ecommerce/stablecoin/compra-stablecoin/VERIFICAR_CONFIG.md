# ✅ Verificar Configuración

## Problema: Dirección de Contrato Inválida

Si ves el error "Dirección de contrato inválida", sigue estos pasos:

## 1. Verificar el archivo .env

Abre el archivo `.env` en `stablecoin/compra-stablecoin/` y verifica que tenga:

```bash
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Importante:**
- ✅ Debe empezar con `0x` (cero y x minúscula)
- ✅ Debe tener exactamente 42 caracteres
- ✅ No debe tener espacios antes o después
- ✅ No debe estar entre comillas

## 2. Verificar que Anvil esté corriendo

```bash
curl http://localhost:8545
```

Debería responder con JSON. Si no responde, inicia Anvil:

```bash
anvil
```

## 3. Verificar que el contrato esté desplegado

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "name()" --rpc-url http://localhost:8545
```

Debería devolver el nombre del token.

## 4. Reiniciar el servidor de desarrollo

**MUY IMPORTANTE:** En Next.js, las variables de entorno se leen cuando se inicia el servidor. 

1. Detén el servidor actual (Ctrl+C en la terminal donde corre)
2. Inicia nuevamente:
   ```bash
   cd stablecoin/compra-stablecoin
   npm run dev
   ```

## 5. Limpiar caché (si es necesario)

Si después de reiniciar sigue sin funcionar:

```bash
cd stablecoin/compra-stablecoin
rm -rf .next
npm run dev
```

## Verificación Rápida

Ejecuta estos comandos para verificar todo:

```bash
# Verificar .env
cd stablecoin/compra-stablecoin
grep NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS .env

# Debería mostrar:
# NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Verificar Anvil
curl -s -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | grep -q "result" && echo "✅ Anvil está corriendo" || echo "❌ Anvil NO está corriendo"
```

## Solución Rápida

Si nada funciona, ejecuta:

```bash
cd /mnt/c/Users/jcmxo/ecommerce
bash setup-completo.sh
```

Este script configurará todo automáticamente.

