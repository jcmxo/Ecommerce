# 🔍 Debug: Popup en Blanco

## Problema
El popup se abre pero muestra una pantalla en blanco.

## Pasos para Diagnosticar

### 1. Abrir la Consola del Popup

1. **Haz clic derecho en el popup** (en el área en blanco)
2. Selecciona **"Inspeccionar"** (o presiona F12 si el popup está enfocado)
3. Se abrirá DevTools para el popup

### 2. Revisar Errores en la Consola

En la consola, busca errores en **rojo**. Los errores comunes son:

- **"Failed to load resource"** → Archivo no encontrado
- **"CSP violation"** → Problema de Content Security Policy
- **"Uncaught SyntaxError"** → Error de JavaScript
- **"Cannot find module"** → Módulo no encontrado

### 3. Verificar que los Archivos se Carguen

En la pestaña **"Network"** de DevTools:
- Recarga el popup (F5)
- Verifica que todos los archivos se carguen con código 200 (verde)
- Si algún archivo muestra 404 (rojo), ese es el problema

### 4. Verificar Rutas

Los archivos deberían cargarse desde:
- `chrome-extension://[ID]/assets/main-*.js`
- `chrome-extension://[ID]/assets/App-*.js`
- `chrome-extension://[ID]/assets/App-*.css`

## Soluciones Comunes

### Si ves "Failed to load resource"
- Verifica que los archivos existan en `dist/assets/`
- Verifica que las rutas en `index.html` sean relativas (`assets/...`)

### Si ves "CSP violation"
- El manifest necesita `content_security_policy` (ya agregado)
- Recarga la extensión después del cambio

### Si ves errores de módulos
- Verifica que `background.js` esté funcionando
- Revisa la consola del Service Worker también

## Comandos Útiles en la Consola

```javascript
// Verificar que React esté cargado
console.log(typeof React);

// Verificar que el root existe
console.log(document.getElementById('root'));

// Ver errores de carga
performance.getEntriesByType('resource').forEach(r => {
  if (r.name.includes('assets')) {
    console.log(r.name, r.responseStatus);
  }
});
```

