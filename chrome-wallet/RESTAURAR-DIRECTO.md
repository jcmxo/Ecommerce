# 🔧 Restaurar Cuentas - Código Directo para Service Worker

## ⚠️ Problema
`chrome.runtime.sendMessage` no funciona desde el Service Worker a sí mismo.

## ✅ Solución: Código Directo (Sin sendMessage)

Este código accede directamente a las funciones del background:

```javascript
// Obtener mnemonic
chrome.storage.local.get(['mnemonic'], async (result) => {
  if (!result.mnemonic) {
    console.log('❌ No mnemonic found');
    return;
  }
  
  console.log('✅ Mnemonic encontrado:', result.mnemonic);
  
  // Importar ethers directamente (ya está disponible en el contexto del Service Worker)
  // Pero como import() no funciona, usamos el código directamente
  
  // Código para derivar cuentas (copiado del background.js)
  const { ethers } = await import('./assets/hdwallet-dDksINkW.js');
  const { J: JsonRpcProvider, M: Mnemonic, H: HDNodeWallet } = ethers;
  
  const mnemonicObj = Mnemonic.fromPhrase(result.mnemonic);
  const accounts = [];
  
  for (let i = 0; i < 5; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);
    accounts.push(wallet.address);
  }
  
  console.log('✅ Cuentas derivadas:', accounts);
  
  // Guardar las cuentas
  chrome.storage.local.get(null, (current) => {
    chrome.storage.local.set({
      ...current,
      accounts: accounts,
      currentAccount: 0
    }, () => {
      console.log('✅ Cuentas guardadas exitosamente!');
      console.log('Total:', accounts.length);
      console.log('Recarga el popup ahora');
    });
  });
});
```

## 🎯 Solución Más Simple (Recomendada)

Si el código de arriba no funciona, usa este que accede directamente al módulo:

```javascript
chrome.storage.local.get(['mnemonic'], async (result) => {
  if (!result.mnemonic) {
    console.log('❌ No mnemonic');
    return;
  }
  
  try {
    // Acceder al módulo ethers que ya está cargado
    const ethersModule = await import(chrome.runtime.getURL('assets/hdwallet-dDksINkW.js'));
    const { M: Mnemonic, H: HDNodeWallet } = ethersModule;
    
    const mnemonicObj = Mnemonic.fromPhrase(result.mnemonic);
    const accounts = [];
    
    for (let i = 0; i < 5; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const wallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);
      accounts.push(wallet.address);
    }
    
    console.log('✅ Cuentas:', accounts);
    
    chrome.storage.local.set({
      accounts: accounts,
      currentAccount: 0
    }, () => {
      console.log('✅ Guardado! Recarga popup');
    });
  } catch (error) {
    console.error('Error:', error);
  }
});
```

