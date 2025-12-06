# 🔧 Restaurar Cuentas Manualmente

## Problema
El mnemonic está guardado pero las cuentas están vacías (`accounts: Array(0)`).

## Solución Rápida

### Opción 1: Usar el Botón Restore en el Popup

1. **Recarga la extensión:**
   - Ve a `chrome://extensions/`
   - Haz clic en el icono de recarga (↻) de CodeCrypto Wallet

2. **Abre el popup de la extensión:**
   - Haz clic en el icono de la extensión en la barra de herramientas

3. **Haz clic en el botón "🔧 Restore"**
   - Este botón está junto a "Create Wallet"
   - Debería restaurar las 5 cuentas desde el mnemonic guardado

4. **Verifica en los logs:**
   - Deberías ver: "Restoring accounts from saved mnemonic..."
   - Luego: "✅ Restored 5 accounts from mnemonic"

### Opción 2: Restaurar desde la Consola del Service Worker

1. **Abre la consola del Service Worker:**
   - Ve a `chrome://extensions/`
   - Haz clic en "Inspeccionar vistas: service worker" de CodeCrypto Wallet

2. **Ejecuta este código:**
```javascript
// Obtener el mnemonic guardado
chrome.storage.local.get(['mnemonic'], async (result) => {
  if (!result.mnemonic) {
    console.log('No mnemonic found');
    return;
  }
  
  console.log('Mnemonic encontrado:', result.mnemonic);
  
  // Importar ethers (ya está disponible en el background)
  const { ethers } = await import('ethers');
  
  // Derivar 5 cuentas
  const mnemonicObj = ethers.Mnemonic.fromPhrase(result.mnemonic);
  const accounts = [];
  
  for (let i = 0; i < 5; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObj, path);
    accounts.push(wallet.address);
  }
  
  console.log('Cuentas derivadas:', accounts);
  
  // Guardar las cuentas
  chrome.storage.local.get(null, (current) => {
    chrome.storage.local.set({
      ...current,
      accounts: accounts,
      currentAccount: 0
    }, () => {
      console.log('✅ Cuentas guardadas:', accounts);
      console.log('Recarga el popup para ver los cambios');
    });
  });
});
```

3. **Recarga el popup de la extensión** para ver los cambios

### Opción 3: Verificar y Forzar Restauración

En la consola del Service Worker:

```javascript
// Verificar estado actual
chrome.storage.local.get(null, (result) => {
  console.log('Estado actual:', {
    mnemonic: result.mnemonic ? '✅ Presente' : '❌ No encontrado',
    accounts: result.accounts?.length || 0,
    accountsArray: result.accounts
  });
  
  // Si hay mnemonic pero no cuentas, restaurar
  if (result.mnemonic && (!result.accounts || result.accounts.length === 0)) {
    console.log('🔧 Restaurando cuentas...');
    // Ejecutar el código de la Opción 2 aquí
  }
});
```

## Verificación

Después de restaurar, verifica:

```javascript
chrome.storage.local.get(['accounts'], (result) => {
  console.log('Cuentas después de restore:', result.accounts);
  console.log('Número de cuentas:', result.accounts?.length || 0);
});
```

Deberías ver un array con 5 direcciones Ethereum.

