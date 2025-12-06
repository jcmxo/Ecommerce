# 🔧 Código para Restaurar Cuentas (Service Worker)

## ⚠️ Problema
`import()` no funciona en Service Workers. Usa este código que llama al método RPC existente:

## ✅ Código Correcto (Copia y Pega)

```javascript
// Obtener mnemonic y derivar cuentas usando el método RPC
chrome.storage.local.get(['mnemonic'], (result) => {
  if (!result.mnemonic) {
    console.log('❌ No mnemonic found');
    return;
  }
  
  console.log('✅ Mnemonic encontrado');
  
  // Enviar mensaje al background para derivar cuentas
  chrome.runtime.sendMessage({
    id: Date.now(),
    method: 'wallet_deriveAccounts',
    params: [result.mnemonic, 5],
    jsonrpc: '2.0'
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
      return;
    }
    
    if (response.error) {
      console.error('Error:', response.error);
      return;
    }
    
    const accounts = response.result;
    console.log('✅ Cuentas derivadas:', accounts);
    
    // Guardar las cuentas
    chrome.storage.local.get(null, (current) => {
      chrome.storage.local.set({
        ...current,
        accounts: accounts,
        currentAccount: 0
      }, () => {
        console.log('✅ Cuentas guardadas exitosamente!');
        console.log('Total de cuentas:', accounts.length);
        console.log('Ahora recarga el popup de la extensión');
      });
    });
  });
});
```

## 📝 Pasos

1. **Escribe "allow pasting"** en la consola y presiona Enter
2. **Pega el código completo** de arriba
3. **Presiona Enter** para ejecutar
4. Deberías ver:
   - "✅ Mnemonic encontrado"
   - "✅ Cuentas derivadas: [array con 5 direcciones]"
   - "✅ Cuentas guardadas exitosamente!"
5. **Recarga el popup** de la extensión

## 🔍 Verificar

Después de ejecutar, verifica:

```javascript
chrome.storage.local.get(['accounts'], (result) => {
  console.log('Cuentas guardadas:', result.accounts);
  console.log('Total:', result.accounts?.length || 0);
});
```

