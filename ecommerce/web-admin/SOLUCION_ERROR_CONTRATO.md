# Solución: Error de Contrato No Desplegado

## Problema

El error `execution reverted (require(false))` aparece porque el contrato Ecommerce no está desplegado en la dirección configurada, o la dirección en el archivo `.env` es incorrecta.

## Solución

### Opción 1: Desplegar los Contratos

1. **Asegúrate de que Anvil está corriendo:**
   ```bash
   # Verificar si Anvil está corriendo
   ps aux | grep anvil
   
   # Si no está corriendo, iniciarlo:
   anvil --host 0.0.0.0 --port 8545
   ```

2. **Desplegar EuroToken:**
   ```bash
   cd stablecoin/sc
   export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   forge script script/DeployEuroToken.s.sol --rpc-url http://localhost:8545 --broadcast
   ```
   
   Anota la dirección del contrato desplegado (aparece en la salida como "EuroToken deployed at: 0x...")

3. **Desplegar Ecommerce (pasando la dirección de EuroToken):**
   ```bash
   cd sc-ecommerce
   export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   export EUROTOKEN_ADDRESS=0x...  # Usa la dirección obtenida en el paso anterior
   forge script script/DeployEcommerce.s.sol --rpc-url http://localhost:8545 --broadcast
   ```
   
   Anota la dirección del contrato Ecommerce desplegado.

4. **Actualizar archivo .env de Web Admin:**
   ```bash
   cd web-admin
   # Editar .env y actualizar con las direcciones correctas:
   NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0x...  # Dirección de Ecommerce
   NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...  # Dirección de EuroToken
   NEXT_PUBLIC_RPC_URL=http://localhost:8545
   ```

5. **Reiniciar Web Admin:**
   - Detén el servidor (Ctrl+C)
   - Inicia nuevamente: `npm run dev`

### Opción 2: Usar el Script de Deploy Automatizado

El proyecto incluye un script que despliega todo automáticamente:

```bash
cd /mnt/c/Users/jcmxo/ecommerce
bash restart-all.sh
```

Este script:
- Inicia Anvil
- Despliega EuroToken
- Despliega Ecommerce
- Actualiza todos los archivos .env
- Inicia todas las aplicaciones

### Verificación

Para verificar que los contratos están desplegados:

```bash
# Verificar EuroToken
cast call 0x... "name()" --rpc-url http://localhost:8545

# Verificar Ecommerce
cast call 0x... "euroToken()" --rpc-url http://localhost:8545
```

## Nota

Las direcciones en los archivos `.env` que creé son valores por defecto. **Debes actualizarlas con las direcciones reales de tus contratos desplegados** para que las aplicaciones funcionen correctamente.

## Próximos Pasos

1. Desplegar los contratos (usando el script o manualmente)
2. Actualizar los archivos `.env` con las direcciones correctas
3. Reiniciar las aplicaciones
4. Probar nuevamente

---

**El error desaparecerá una vez que los contratos estén desplegados correctamente.** ✅

