# Guía para Probar la Integración con dApps

## ✅ Mejoras Aplicadas

1. **Manejo mejorado de errores de balance**: Ahora muestra "N/A" en lugar de errores repetitivos cuando el nodo no está disponible.

## 🧪 Probar la Integración con dApps

### Paso 1: Verificar que el Provider está Disponible

1. Abre cualquier página web (ej: `https://example.com`)
2. Abre la consola del navegador (F12)
3. Ejecuta:
```javascript
console.log(window.codecrypto);
```

Deberías ver un objeto con métodos como `request`, `on`, `removeListener`, etc.

### Paso 2: Probar Conexión de Wallet

En la consola del navegador, ejecuta:

```javascript
// Solicitar cuentas
const accounts = await window.codecrypto.request({ 
  method: 'eth_requestAccounts' 
});
console.log('Cuentas conectadas:', accounts);
```

Deberías ver un popup de la extensión pidiendo permiso para conectar.

### Paso 3: Obtener Chain ID

```javascript
const chainId = await window.codecrypto.request({ 
  method: 'eth_chainId' 
});
console.log('Chain ID:', chainId);
```

### Paso 4: Obtener Balance

```javascript
const balance = await window.codecrypto.request({ 
  method: 'eth_getBalance',
  params: [accounts[0], 'latest']
});
console.log('Balance (wei):', balance);
```

### Paso 5: Escuchar Eventos

```javascript
// Escuchar cambios de cuenta
window.codecrypto.on('accountsChanged', (accounts) => {
  console.log('Cuentas cambiadas:', accounts);
});

// Escuchar cambios de red
window.codecrypto.on('chainChanged', (chainId) => {
  console.log('Red cambiada:', chainId);
});
```

## 🔧 Probar con Hardhat (Opcional)

Si quieres ver balances reales:

1. Inicia Hardhat en otra terminal:
```bash
npx hardhat node
```

2. Recarga el popup de la extensión
3. El balance debería actualizarse automáticamente

## 📝 Notas

- El provider está disponible como `window.codecrypto` (no `window.ethereum`)
- La extensión implementa el estándar EIP-1193
- Los errores de balance ahora muestran "N/A" cuando el nodo no está disponible

