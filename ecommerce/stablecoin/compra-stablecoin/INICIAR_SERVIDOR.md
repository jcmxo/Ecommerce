# Cómo Iniciar el Servidor de Desarrollo

## Error: No se puede conectar a localhost:6001

Este error significa que el servidor de desarrollo no está corriendo. Sigue estos pasos:

## Solución Paso a Paso

### Paso 1: Abre una Terminal

Abre una terminal en el directorio del proyecto.

### Paso 2: Ve al Directorio Correcto

```bash
cd stablecoin/compra-stablecoin
```

### Paso 3: Instala las Dependencias (Si no lo has hecho)

```bash
npm install
```

Esto instalará todas las dependencias necesarias (Next.js, React, Stripe, etc.).

**Tiempo estimado:** 2-5 minutos

### Paso 4: Inicia el Servidor

```bash
npm run dev
```

Deberías ver un mensaje como:
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:6001
  - Ready in X.Xs
```

### Paso 5: Verifica que Funciona

1. Abre tu navegador
2. Ve a: `http://localhost:6001`
3. Deberías ver la página de "Compra EuroToken"

## Si Aún No Funciona

### Verifica que el Puerto 6001 Esté Libre

```bash
# En Windows PowerShell:
netstat -ano | findstr :6001

# Si hay algo corriendo, puedes matar el proceso o usar otro puerto
```

### Verifica Errores en la Terminal

Si ves errores al iniciar, revisa:

1. **Error de dependencias:**
   ```bash
   npm install
   ```

2. **Error de puerto ocupado:**
   - Cierra otras aplicaciones que usen el puerto 6001
   - O cambia el puerto en `package.json`

3. **Error de archivo .env:**
   - Verifica que el archivo `.env` existe
   - Verifica que tiene las claves de Stripe

## Comando Rápido

```bash
cd stablecoin/compra-stablecoin
npm install  # Solo la primera vez
npm run dev
```

## Mantener el Servidor Corriendo

- **No cierres la terminal** mientras el servidor esté corriendo
- El servidor se reiniciará automáticamente cuando hagas cambios en el código
- Para detener el servidor: Presiona `Ctrl+C` en la terminal

## Verificación Rápida

¿El servidor está corriendo?
- ✅ Sí: Deberías ver la página en `http://localhost:6001`
- ❌ No: Sigue los pasos arriba

## Próximos Pasos

Una vez que el servidor esté corriendo:

1. ✅ Abre `http://localhost:6001`
2. ✅ Conecta MetaMask
3. ✅ Prueba comprar tokens con la tarjeta de prueba: `4242 4242 4242 4242`

