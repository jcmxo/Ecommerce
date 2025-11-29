# Solución: Carrito Vacío Después de Agregar Productos

## Problema
Los productos se muestran como "agregados exitosamente" pero el carrito está vacío cuando se abre.

## Posibles Causas

### 1. MetaMask no está conectado a Anvil Local
MetaMask debe estar configurado para usar la red local "Anvil Local" en el puerto 8545.

**Solución:**
1. Abre MetaMask
2. Ve a Configuración → Redes
3. Verifica que "Anvil Local" esté configurada con:
   - **RPC URL:** `http://localhost:8545`
   - **Chain ID:** `31337`
   - **Símbolo de moneda:** `ETH`
4. Si no existe, agrega la red manualmente

### 2. Anvil no está corriendo
Anvil debe estar ejecutándose en el puerto 8545.

**Verificación:**
```bash
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Si no responde, inicia Anvil:
```bash
anvil --host 0.0.0.0 --port 8545
```

### 3. Contrato no desplegado correctamente
El contrato Ecommerce podría no estar desplegado o tener una dirección incorrecta.

**Verificación:**
1. Verifica que el archivo `.env` tenga la dirección correcta:
   ```
   NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
   ```
2. Si necesitas redesplegar:
   ```bash
   cd sc-ecommerce
   forge script script/DeployEcommerce.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

### 4. Error RPC de MetaMask
Si ves errores "Internal JSON-RPC error" en la consola, hay un problema de comunicación.

**Solución:**
1. Reinicia MetaMask
2. Verifica que Anvil esté corriendo
3. Verifica que MetaMask esté conectado a "Anvil Local"
4. Intenta desconectar y volver a conectar la wallet

## Pasos para Diagnosticar

1. **Abre la consola del navegador (F12)**
2. **Intenta agregar un producto**
3. **Revisa los mensajes en la consola:**
   - ¿Aparece "Evento CartItemAdded encontrado"?
   - ¿Hay errores RPC?
   - ¿Qué dice el mensaje de verificación del carrito?

4. **Verifica en MetaMask:**
   - ¿La transacción aparece en el historial?
   - ¿Tiene status "Success"?
   - ¿Cuánto gas usó?

## Solución Temporal

Si el problema persiste, puedes:
1. Verificar manualmente el carrito llamando a `getCart()` desde la consola del navegador
2. Verificar que el contrato esté desplegado correctamente
3. Reiniciar Anvil y redesplegar los contratos

