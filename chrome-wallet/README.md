# Chrome Wallet - Ethereum Wallet Extension

Una extensión de Chrome que funciona como una wallet Ethereum, implementando los estándares Web3 más importantes.

## Características

- ✅ Mnemonic BIP-39 (12 palabras)
- ✅ Provider EIP-1193 (window.codecrypto)
- ✅ Firma de transacciones (eth_sendTransaction)
- ✅ Firma EIP-712 (eth_signTypedData_v4)
- ✅ EIP-1559 Gas (maxFeePerGas, maxPriorityFeePerGas)
- ✅ EIP-6963 (Multi-wallet discovery)
- ✅ React + TypeScript
- ✅ Chrome Extension Manifest V3

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Luego carga la carpeta `dist/` como extensión no empaquetada en Chrome.

## Estructura

- `src/background.ts` - Service worker con lógica de firma
- `src/content-script.ts` - Content script
- `src/inject.ts` - Script inyectado (window.codecrypto)
- `src/manifest.ts` - Generador de manifest.json
- `src/App.tsx` - Popup principal
- `src/Notification.tsx` - Confirmación de transacciones
- `src/Connect.tsx` - Selección de cuenta

