# ✅ Servidor de Desarrollo Listo

## Estado: Configuración Completada

- ✅ Dependencias instaladas
- ✅ Archivo .env configurado con claves de Stripe
- ✅ Servidor iniciado en segundo plano

## Acceso al Servidor

El servidor debería estar disponible en:
```
http://localhost:6001
```

## Cómo Verificar

1. Abre tu navegador
2. Ve a: `http://localhost:6001`
3. Deberías ver la página de **"Compra EuroToken"**

## Si Aún Ves el Error

### Opción 1: Esperar unos segundos

El servidor puede tardar 10-30 segundos en iniciarse completamente.

### Opción 2: Iniciar Manualmente

Si el servidor no inicia automáticamente, ejecuta en una terminal:

```bash
cd stablecoin/compra-stablecoin
npm run dev
```

### Opción 3: Verificar el Puerto

Si el puerto 6001 está ocupado, verifica qué está usando ese puerto:

```bash
# Windows PowerShell:
netstat -ano | findstr :6001
```

## Próximos Pasos

Una vez que veas la página:

1. ✅ **Conecta MetaMask**
   - Haz clic en "Conectar MetaMask"
   - Acepta la conexión en MetaMask

2. ✅ **Prueba la Compra**
   - Ingresa una cantidad (ej: 100 EUR)
   - Usa la tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura (ej: 12/25)
   - CVC: cualquier 3 dígitos (ej: 123)

## Configuración Actual

- ✅ Claves de Stripe configuradas
- ✅ Dependencias instaladas
- ⏳ Variables de Ethereum (configurar después del deploy)

## Comandos Útiles

### Ver logs del servidor:
El servidor muestra logs en la terminal donde lo iniciaste.

### Detener el servidor:
Presiona `Ctrl+C` en la terminal donde está corriendo.

### Reiniciar el servidor:
```bash
# Detener (Ctrl+C)
# Luego:
npm run dev
```

---

🎉 **¡Todo listo para empezar a desarrollar!**

