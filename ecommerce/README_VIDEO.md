# 🎥 Guía para Crear el Video Tutorial

## 📋 ¿Qué se creó?

He creado un **guion completo** para grabar un video tutorial del sistema. El guion incluye:

- ✅ **Estructura detallada** de todo el video (sección por sección)
- ✅ **Script de voz** para cada parte
- ✅ **Instrucciones específicas** de qué mostrar en pantalla
- ✅ **Timestamps sugeridos** para cada sección
- ✅ **Checklist** antes de grabar
- ✅ **Diagramas de flujo** para referencia

---

## 📂 Archivos Creados

1. **`GUION_VIDEO_TUTORIAL.md`** - Guion completo del video
2. **`DIAGRAMA_FLUJO_COMPLETO.md`** - Diagramas visuales del sistema

---

## 🎬 Cómo Usar el Guion

### Paso 1: Preparación
1. Abre `GUION_VIDEO_TUTORIAL.md`
2. Lee todo el guion completo
3. Prepara los datos que vas a usar:
   - Nombre de empresa de ejemplo
   - Productos de ejemplo
   - Montos de prueba

### Paso 2: Configuración
1. Inicia Anvil (blockchain local)
2. Inicia todas las aplicaciones:
   - Compra Stablecoin (6001)
   - Pasarela de Pagos (6002)
   - Web Admin (6003)
   - Web Customer (6004)
3. Configura 2 wallets en MetaMask:
   - Wallet 1: Cliente
   - Wallet 2: Empresa
4. Cierra ventanas innecesarias

### Paso 3: Grabar
1. Abre tu herramienta de grabación (OBS Studio, Loom, etc.)
2. Sigue el guion sección por sección
3. Graba cada parte por separado si es más fácil

### Paso 4: Editar
1. Une todas las partes
2. Quita pausas largas
3. Agrega texto explicativo si quieres
4. Agrega música de fondo opcional (suave)

---

## 🛠️ Herramientas Recomendadas

### Para Grabar:
1. **OBS Studio** (Gratis)
   - Descarga: https://obsproject.com/
   - Permite grabar pantalla + audio + webcam
   - Puedes agregar texto y efectos

2. **Loom** (Gratis)
   - Descarga: https://www.loom.com/
   - Muy fácil de usar
   - Grabación rápida
   - Edición básica incluida

3. **ScreenRec** (Gratis)
   - Simple y directo
   - Buena calidad

### Para Editar:
1. **Shotcut** (Gratis)
2. **DaVinci Resolve** (Gratis, muy potente)
3. **Windows Movie Maker** (Si tienes Windows)

---

## 📝 Estructura del Video (Resumen)

```
[00:00 - 01:00] Introducción
[01:00 - 03:00] Compra de EuroTokens
[03:00 - 06:00] Gestión de Empresa
[06:00 - 09:00] Agregar Productos
[09:00 - 13:00] Compra como Cliente
[13:00 - 17:00] Proceso de Pago
[17:00 - 19:00] Historial de Pedidos
[19:00 - 20:00] Ver Facturas como Empresa
[20:00 - 21:00] Resumen y Consejos
```

**Duración total: ~21 minutos**

---

## ✅ Checklist Antes de Grabar

- [ ] Anvil corriendo
- [ ] Todas las aplicaciones iniciadas
- [ ] 2 wallets configuradas en MetaMask
- [ ] Wallet de cliente con balance (comprar EURT primero)
- [ ] Empresa registrada
- [ ] Al menos 1 producto agregado
- [ ] Cerrar ventanas innecesarias
- [ ] Silenciar notificaciones
- [ ] Preparar datos de ejemplo
- [ ] Probar el flujo completo una vez antes de grabar

---

## 💡 Tips para una Buena Grabación

1. **Habla claro y pausado**
   - No te apresures
   - Explica cada paso

2. **Muestra claramente las acciones**
   - Haz clic lento para que se vea
   - Usa el cursor para señalar elementos importantes

3. **Espera las confirmaciones**
   - Espera a que MetaMask responda
   - Espera confirmaciones de blockchain

4. **Usa zoom cuando sea necesario**
   - Para mostrar direcciones de wallet
   - Para mostrar balances
   - Para mostrar detalles de transacciones

5. **Agrega texto explicativo**
   - Puedes agregar texto sobre la pantalla
   - Explica qué está pasando

---

## 🎯 Flujo Completo para Grabar

### Parte A: Setup (Grabar primero)
1. Mostrar Anvil corriendo
2. Mostrar todas las aplicaciones abiertas
3. Explicar la arquitectura general

### Parte B: Compra de Tokens
1. Ir a Compra Stablecoin
2. Conectar MetaMask
3. Explicar el proceso (NO comprar realmente)

### Parte C: Configurar Empresa
1. Ir a Web Admin
2. Conectar con Wallet 2 (Empresa)
3. Registrar empresa
4. Explicar el campo de dirección

### Parte D: Agregar Producto
1. Hacer clic en "Agregar Producto"
2. Llenar formulario
3. Confirmar transacción
4. Ver producto agregado

### Parte E: Compra como Cliente
1. Cambiar a Wallet 1 (Cliente) en MetaMask
2. Ir a Tienda
3. Conectar wallet
4. Ver productos
5. Agregar al carrito
6. Ver carrito
7. Checkout

### Parte F: Pago
1. Mostrar pasarela de pagos
2. Mostrar detalles
3. Explicar los 2 pasos
4. Aprobar tokens (si necesario)
5. Procesar pago
6. Mostrar éxito
7. Mostrar balance antes/después

### Parte G: Historial
1. Ver historial de pedidos
2. Ver detalles de factura
3. Ver facturas como empresa

---

## 📚 Información Adicional

- El guion completo está en `GUION_VIDEO_TUTORIAL.md`
- Los diagramas están en `DIAGRAMA_FLUJO_COMPLETO.md`
- Puedes usar estos archivos como referencia mientras grabas

---

## 🎬 Ejemplo de Script (Primera Parte)

```
"Hola, bienvenido al tutorial del Sistema E-commerce con Blockchain.

Este sistema te permite crear una tienda online donde puedes 
comprar y vender productos usando EuroTokens, un token estable 
basado en blockchain.

Vamos a ver cómo funciona todo el sistema paso a paso.

Primero, necesitas tener la blockchain local corriendo. 
Aquí puedes ver Anvil ejecutándose en el puerto 8545.

También tenemos 4 aplicaciones web:
1. Compra de Stablecoin - donde compras los tokens
2. Pasarela de Pagos - donde procesas los pagos  
3. Web Admin - donde gestionas tu empresa
4. Web Customer - la tienda online

Empecemos..."
```

---

¡Buena suerte con la grabación! 🎥

