# 🔍 Diagnóstico: Popup en Blanco

## Pasos para Diagnosticar

### 1. Abrir la Consola del Popup

1. **Haz clic en el icono de la extensión** (CC púrpura) en la barra de herramientas
2. **Haz clic derecho** en el área en blanco del popup
3. Selecciona **"Inspeccionar"** (o presiona **F12**)
4. Se abrirá DevTools para el popup

### 2. Revisar Errores en la Consola

En la pestaña **"Console"**, busca errores en **rojo**. Los errores comunes son:

#### Error: "Failed to load resource"
- **Causa:** Archivo no encontrado (404)
- **Solución:** Verifica que todos los archivos en `assets/` existan

#### Error: "CSP violation" o "Refused to load"
- **Causa:** Content Security Policy bloqueando recursos
- **Solución:** Ya agregamos CSP al manifest, recarga la extensión

#### Error: "Uncaught SyntaxError" o "Unexpected token"
- **Causa:** Error de sintaxis en JavaScript
- **Solución:** Comparte el error completo para corregirlo

#### Error: "Cannot find module" o "Failed to resolve module"
- **Causa:** Importación de módulo fallida
- **Solución:** Verifica las rutas de importación

### 3. Verificar Carga de Archivos (Network Tab)

1. En DevTools, ve a la pestaña **"Network"**
2. **Recarga el popup** (F5 o clic derecho → Recargar)
3. Verifica que todos los archivos se carguen:
   - `main-*.js` → Debe ser 200 (verde)
   - `App-*.js` → Debe ser 200 (verde)
   - `App-*.css` → Debe ser 200 (verde)
4. Si algún archivo muestra **404 (rojo)**, ese es el problema

### 4. Verificar que React se Cargue

En la consola del popup, escribe:
```javascript
console.log('React disponible:', typeof React !== 'undefined');
console.log('Root existe:', !!document.getElementById('root'));
```

## Soluciones Comunes

### Solución 1: Recargar Extensión
1. Ve a `chrome://extensions/`
2. Haz clic en el icono de recarga (↻) de CodeCrypto Wallet
3. Abre el popup de nuevo

### Solución 2: Verificar Rutas
Asegúrate de que en `index.html` las rutas sean relativas:
- ✅ Correcto: `src="./assets/main-*.js"`
- ❌ Incorrecto: `src="/assets/main-*.js"`

### Solución 3: Verificar CSP
El manifest debe tener:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self';"
}
```

## Comandos Útiles en la Consola

```javascript
// Verificar que los archivos se cargaron
performance.getEntriesByType('resource').forEach(r => {
  if (r.name.includes('assets')) {
    console.log(r.name, r.responseStatus === 200 ? '✅' : '❌', r.responseStatus);
  }
});

// Verificar errores de módulos
window.addEventListener('error', (e) => {
  console.error('Error:', e.message, e.filename, e.lineno);
});
```

## ¿Qué Error Ves?

Por favor, comparte:
1. **El error exacto** de la consola (copia y pega)
2. **Qué archivos fallan** en la pestaña Network (si hay 404s)
3. **Cualquier mensaje** en rojo en la consola

Con esa información podré darte la solución exacta.

