# Instrucciones de Instalación

## Prerrequisitos

- Node.js 18+ y npm
- Chrome o Edge navegador
- Hardhat o otro nodo Ethereum local corriendo en `http://localhost:8545` (opcional para desarrollo)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Compilar el proyecto:
```bash
npm run build
```

3. Agregar iconos:
   - Crea iconos en tamaños 16x16, 48x48, y 128x128 píxeles
   - Nómbralos `icon16.png`, `icon48.png`, `icon128.png`
   - Colócalos en la carpeta `dist/` después del build

4. Cargar extensión en Chrome:
   - Abre Chrome y ve a `chrome://extensions/`
   - Activa el "Modo de desarrollador" (Developer mode)
   - Haz clic en "Cargar extensión sin empaquetar" (Load unpacked)
   - Selecciona la carpeta `dist/`

## Desarrollo

Para desarrollo con watch mode:
```bash
npm run dev
```

Esto compilará automáticamente cuando cambies archivos.

## Uso

1. Abre la extensión haciendo clic en el icono en la barra de herramientas
2. Genera o importa un mnemonic de 12 palabras
3. Crea la wallet - se derivarán 5 cuentas automáticamente
4. La wallet estará disponible como `window.codecrypto` en todas las páginas web

## Testing con dApps

Puedes probar la wallet con cualquier dApp que use el estándar EIP-1193. La wallet se anunciará automáticamente usando EIP-6963.

## Notas

- Por defecto, la wallet se conecta a `http://localhost:8545` (Hardhat)
- El chainId por defecto es `0x7a69` (31337 decimal)
- Todas las operaciones se guardan en `chrome.storage.local`
- Los logs persisten entre resets de la wallet

