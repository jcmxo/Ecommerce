# Solución de Errores RPC y Carrito Vacío

## Problema: Error "Internal JSON-RPC error"

Este error indica que MetaMask no puede comunicarse correctamente con Anvil (la blockchain local).

## Soluciones

### 1. Verificar que Anvil está corriendo

Ejecuta en una terminal:
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Si no responde, inicia Anvil:
```bash
cd sc-ecommerce
anvil --host 0.0.0.0 --port 8545
```

### 2. Verificar configuración de MetaMask

**Pasos:**
1. Abre MetaMask
2. Ve a Configuración → Redes
3. Verifica que "Anvil Local" esté configurada con:
   - **Nombre de red:** Anvil Local
   - **Nueva URL de RPC:** `http://localhost:8545`
   - **ID de cadena:** `31337`
   - **Símbolo de moneda:** `ETH`

4. Si no existe la red, agrégala:
   - Click en "Agregar red"
   - O usa "Agregar red manualmente"
   - Completa los campos anteriores

### 3. Reconectar MetaMask

Si ya tienes la red configurada pero sigue fallando:

1. **Desconecta y vuelve a conectar:**
   - En el sitio web, desconecta la wallet
   - En MetaMask, ve a Configuración → Avanzado
   - Click en "Restablecer cuenta"
   - Vuelve a conectar la wallet

2. **Cambia de red y vuelve:**
   - En MetaMask, cambia a otra red (ej: Ethereum Mainnet)
   - Espera unos segundos
   - Cambia de vuelta a "Anvil Local"

3. **Reinicia MetaMask:**
   - Cierra completamente MetaMask
   - Ábrelo de nuevo
   - Vuelve a conectar la wallet

### 4. Verificar que el contrato está desplegado

```bash
cd sc-ecommerce
forge script script/DeployEcommerce.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 5. Verificar variables de entorno

Asegúrate de que el archivo `.env` en `web-customer/` tiene:

```env
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

Y reinicia el servidor de desarrollo:
```bash
cd web-customer
rm -rf .next
npm run dev
```

## Mejoras Implementadas

El código ahora:

1. **Verifica la conexión RPC antes de enviar transacciones**
   - Si hay un error RPC, muestra un mensaje claro

2. **Verifica que el producto está en el carrito después de agregarlo**
   - Hace hasta 3 intentos con delays incrementales
   - Maneja correctamente el error `CartNotFound`

3. **Muestra mensajes de error más específicos**
   - Identifica errores RPC
   - Identifica errores de contrato
   - Sugiere soluciones específicas

4. **Maneja mejor el caso cuando el carrito no existe**
   - Si el carrito no existe después de agregar un producto, indica que la transacción no se ejecutó correctamente

## Cómo verificar que todo funciona

1. Abre la consola del navegador (F12)
2. Intenta agregar un producto
3. Deberías ver:
   - "✅ Conexión RPC exitosa"
   - "✅ Transacción enviada"
   - "✅ Transacción confirmada"
   - "✅ Evento CartItemAdded encontrado" (o "✅ Producto verificado en el carrito")
4. Abre el carrito y verifica que el producto está ahí

## Si el problema persiste

1. Verifica los logs de Anvil para ver si hay errores
2. Verifica que MetaMask esté usando la cuenta correcta
3. Intenta con una nueva cuenta de Anvil
4. Reinicia todo (Anvil, MetaMask, servidor de desarrollo)

