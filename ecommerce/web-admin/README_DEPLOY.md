# 🚀 Guía Rápida: Desplegar Contratos y Usar Web Admin

## Problema Común

Si ves errores como `execution reverted` o `require(false)`, significa que los contratos no están desplegados o las direcciones en `.env` son incorrectas.

## Solución Rápida

### Opción 1: Script Automatizado (Recomendado)

```bash
cd /mnt/c/Users/jcmxo/ecommerce
bash restart-all.sh
```

Este script despliega todo automáticamente y actualiza los `.env`.

### Opción 2: Despliegue Manual

1. **Verificar que Anvil está corriendo:**
   ```bash
   ps aux | grep anvil
   ```

2. **Desplegar EuroToken:**
   ```bash
   cd stablecoin/sc
   export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   forge script script/DeployEuroToken.s.sol --rpc-url http://localhost:8545 --broadcast
   ```
   
   Copia la dirección que aparece: `EuroToken deployed at: 0x...`

3. **Desplegar Ecommerce:**
   ```bash
   cd sc-ecommerce
   export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   export EUROTOKEN_ADDRESS=0x...  # La dirección de EuroToken del paso anterior
   forge script script/DeployEcommerce.s.sol --rpc-url http://localhost:8545 --broadcast
   ```
   
   Copia la dirección: `Ecommerce deployed at: 0x...`

4. **Actualizar web-admin/.env:**
   ```bash
   cd web-admin
   # Editar .env y poner las direcciones reales
   ```

5. **Reiniciar Web Admin:**
   - Detén el servidor (Ctrl+C)
   - Inicia: `npm run dev`

## Uso de Web Admin

Una vez desplegados los contratos:

1. Abre http://localhost:6003
2. Conecta MetaMask a la red local (Chain ID: 31337)
3. Haz clic en "Registrar Nueva Empresa"
4. Completa el formulario y envía la transacción
5. ¡Listo! Ya puedes gestionar productos y ver facturas

## Nota

Si la aplicación muestra errores pero funciona (puedes registrar empresas), puedes ignorarlos. El código maneja estos errores automáticamente.

---

**¿Necesitas ayuda? Verifica que los contratos estén desplegados y las direcciones en `.env` sean correctas.**

