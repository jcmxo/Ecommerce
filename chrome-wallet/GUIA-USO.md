# 📖 Guía de Uso - CodeCrypto Wallet

## 🚀 Primeros Pasos

### 1. Abrir la Wallet

- **Opción A:** Haz clic en el icono de la extensión (púrpura con "CC") en la barra de herramientas de Chrome
- **Opción B:** Haz clic derecho en el icono → "Opciones" o "Administrar extensión"

### 2. Crear o Importar una Wallet

#### Crear Wallet Nueva:
1. En el popup de la extensión, verás un campo de texto
2. Haz clic en **"Generate New"** para generar un mnemonic de 12 palabras automáticamente
3. **¡IMPORTANTE!** Guarda estas palabras en un lugar seguro (son tu clave de recuperación)
4. Haz clic en **"Create Wallet"**
5. Se crearán automáticamente 5 cuentas derivadas

#### Importar Wallet Existente:
1. Pega tu mnemonic de 12 palabras en el campo de texto
2. Haz clic en **"Create Wallet"**
3. Se restaurarán las cuentas asociadas a ese mnemonic

### 3. Interfaz Principal

Una vez creada la wallet, verás:

- **Balance:** Muestra tu balance en ETH (se actualiza cada 5 segundos)
- **Address:** Tu dirección Ethereum actual
- **Chain ID:** La red actual (por defecto: 0x7a69 - Hardhat local)
- **Lista de Cuentas:** Las 5 cuentas derivadas (haz clic para cambiar)
- **Logs:** Historial de operaciones y eventos

## 💼 Funcionalidades

### Cambiar de Cuenta
- Haz clic en cualquier cuenta de la lista
- La cuenta seleccionada se marca en azul
- El balance se actualiza automáticamente

### Ver Mnemonic
- Haz clic en **"Show Mnemonic"** para ver tu frase de recuperación
- Haz clic en **"Hide Mnemonic"** para ocultarla
- ⚠️ **Nunca compartas tu mnemonic con nadie**

### Reset Wallet
- Haz clic en **"Reset Wallet"** para borrar todos los datos
- ⚠️ Esto eliminará todo y tendrás que crear una nueva wallet

### Logs
- Los logs muestran todas las operaciones:
  - 🔵 Azul: Llamadas RPC
  - 🟢 Verde: Eventos
  - 🔴 Rojo: Errores
  - 🟠 Naranja: Operaciones (transacciones, firmas)

## 🌐 Usar con dApps (Aplicaciones Descentralizadas)

### 1. Conectar Wallet a una dApp

La wallet está disponible como `window.codecrypto` en todas las páginas web.

**Ejemplo en consola del navegador (F12):**

```javascript
// Solicitar conexión
const accounts = await window.codecrypto.request({ 
  method: 'eth_requestAccounts' 
});
console.log('Cuentas conectadas:', accounts);

// Obtener balance
const balance = await window.codecrypto.request({
  method: 'eth_getBalance',
  params: [accounts[0], 'latest']
});
console.log('Balance:', balance);

// Obtener Chain ID
const chainId = await window.codecrypto.request({
  method: 'eth_chainId'
});
console.log('Chain ID:', chainId);
```

### 2. Enviar Transacciones

Cuando una dApp solicite una transacción:

1. Aparecerá una ventana de confirmación automáticamente
2. Revisa los detalles:
   - **To:** Dirección destino
   - **Value:** Cantidad en ETH
   - **Data:** Datos adicionales (si aplica)
3. Haz clic en **"Approve"** para confirmar o **"Reject"** para cancelar
4. La transacción se firmará y enviará automáticamente

### 3. Firmar Mensajes EIP-712

Para firmar datos estructurados (como en OpenSea, Uniswap, etc.):

1. La dApp solicitará la firma
2. Aparecerá una ventana mostrando los datos a firmar
3. Revisa cuidadosamente qué estás firmando
4. Aprueba o rechaza según corresponda

## 🔧 Configuración

### Red por Defecto

- **RPC URL:** `http://localhost:8545`
- **Chain ID:** `0x7a69` (31337 decimal - Hardhat)

### Cambiar de Red

Actualmente la wallet está configurada para Hardhat local. Para cambiar:

1. Necesitarías modificar el código o agregar una interfaz de gestión de redes
2. Por ahora, está optimizada para desarrollo local

## 🧪 Probar con Hardhat

Si tienes Hardhat corriendo:

```bash
# En otra terminal
npx hardhat node
```

Luego en la wallet:
1. Crea o importa una wallet
2. El balance debería aparecer (si tienes ETH en esa cuenta)
3. Puedes probar transacciones desde cualquier dApp

## 📱 Características Avanzadas

### EIP-6963 (Multi-Wallet Discovery)

La wallet se anuncia automáticamente usando EIP-6963, lo que permite que las dApps detecten múltiples wallets instaladas.

### Sincronización entre Pestañas

- Si cambias de cuenta en una pestaña, todas las pestañas se actualizan
- Si cambias de red, todas las pestañas se notifican
- Los eventos `accountsChanged` y `chainChanged` se propagan automáticamente

### Persistencia

- Tu wallet se guarda automáticamente en `chrome.storage.local`
- Al cerrar y reabrir Chrome, tu wallet se carga automáticamente
- La cuenta activa y la red se restauran

## ⚠️ Notas de Seguridad

1. **Mnemonic:** Nunca compartas tu frase de recuperación
2. **Desarrollo:** Esta wallet está diseñada para desarrollo, no para producción
3. **Almacenamiento:** El mnemonic se guarda en `chrome.storage.local` (solo para desarrollo)
4. **Red Local:** Por defecto conecta a localhost (Hardhat)

## 🐛 Solución de Problemas

### El balance no se actualiza
- Verifica que tengas Hardhat corriendo en `localhost:8545`
- Revisa la consola del navegador (F12) para errores
- Verifica que la cuenta tenga fondos

### El provider no aparece en páginas web
- Recarga la página después de instalar la extensión
- Verifica la consola del navegador (F12)
- Asegúrate de que la extensión esté activa (toggle azul en chrome://extensions/)

### Las transacciones no se envían
- Verifica que Hardhat esté corriendo
- Revisa que tengas suficiente balance
- Verifica los logs en la extensión para ver errores

## 📚 Recursos Adicionales

- **Hardhat:** https://hardhat.org/
- **Ethers.js:** https://docs.ethers.org/
- **EIP-1193:** https://eips.ethereum.org/EIPS/eip-1193
- **EIP-712:** https://eips.ethereum.org/EIPS/eip-712

---

¡Disfruta usando CodeCrypto Wallet! 🚀

