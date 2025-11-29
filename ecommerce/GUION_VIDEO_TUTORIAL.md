# 🎬 Guion de Video Tutorial: Sistema E-commerce Blockchain

## 📋 INFORMACIÓN GENERAL

**Título**: Sistema E-commerce con Blockchain - Tutorial Completo  
**Duración estimada**: 15-20 minutos  
**Objetivo**: Mostrar cómo usar todas las funcionalidades del sistema

---

## 🎥 ESTRUCTURA DEL VIDEO

### **PARTE 1: Introducción (1-2 min)**

**VOZ EN OFF:**
```
"Bienvenido al tutorial del Sistema E-commerce con Blockchain.
Este sistema permite comprar y vender productos usando EuroTokens
en una blockchain local. 

Vamos a ver:
1. Cómo comprar EuroTokens
2. Cómo gestionar una empresa
3. Cómo agregar productos
4. Cómo comprar como cliente
5. Cómo procesar pagos

¡Empecemos!"
```

**ACCIÓN EN PANTALLA:**
- Mostrar todas las aplicaciones abiertas (4 pestañas)
- Mostrar Anvil corriendo
- Zoom a las URLs de cada aplicación

---

### **PARTE 2: Compra de EuroTokens (2-3 min)**

**VOZ EN OFF:**
```
"Primero, necesitas comprar EuroTokens para poder comprar productos.
Vamos a la aplicación de Compra de Stablecoin."
```

**ACCIÓN EN PANTALLA:**
1. Ir a `http://localhost:6001`
2. Mostrar la interfaz
3. Conectar MetaMask
4. Mostrar el formulario de compra
5. Explicar: "Aquí puedes comprar EuroTokens con tarjeta de crédito usando Stripe"
6. NO comprar realmente (solo mostrar el proceso)

**NOTAS:**
- Mencionar que se necesita configuración de Stripe
- Mostrar que los tokens se mintean automáticamente

---

### **PARTE 3: Gestión de Empresa (3-4 min)**

**VOZ EN OFF:**
```
"Ahora vamos a gestionar una empresa usando el Panel de Administración.
Primero, necesitas registrar tu empresa."
```

**ACCIÓN EN PANTALLA:**

1. **Ir a Web Admin** (`http://localhost:6003`)
   - Mostrar la página de inicio
   - Conectar MetaMask con Wallet 2 (Empresa)
   - Mostrar el formulario de registro

2. **Registrar Empresa**
   - Llenar nombre: "Mi Tienda Online"
   - Llenar NIT: "123456789-0"
   - **IMPORTANTE**: Mostrar el campo de "Dirección de Empresa"
   - Explicar: "Puedes usar otra dirección para recibir pagos, o dejar vacío para usar tu wallet actual"
   - Hacer clic en "Registrar Empresa"
   - Confirmar en MetaMask
   - Esperar confirmación

3. **Mostrar Dashboard**
   - Mostrar información de la empresa
   - Explicar los tabs: Productos y Facturas

---

### **PARTE 4: Agregar Productos (2-3 min)**

**VOZ EN OFF:**
```
"Ahora vamos a agregar productos para vender."
```

**ACCIÓN EN PANTALLA:**

1. **Hacer clic en "Agregar Producto"**
   - Mostrar el formulario

2. **Llenar formulario:**
   - Nombre: "Laptop Gaming"
   - Descripción: "Laptop potente para juegos"
   - Precio: "1000.0" EURT
   - Stock: "10"
   - Imagen: Dejar vacío o poner un hash de ejemplo
   - Hacer clic en "Agregar Producto"
   - Confirmar en MetaMask

3. **Mostrar producto agregado**
   - Ver el producto en la lista
   - Explicar cómo editar stock

---

### **PARTE 5: Compra como Cliente (3-4 min)**

**VOZ EN OFF:**
```
"Ahora vamos a comprar productos como cliente.
Necesitamos usar una wallet diferente para esto."
```

**ACCIÓN EN PANTALLA:**

1. **Cambiar a Wallet 1 (Cliente) en MetaMask**
   - Mostrar cómo cambiar de cuenta en MetaMask
   - Explicar por qué usamos 2 wallets diferentes

2. **Ir a Tienda** (`http://localhost:6004`)
   - Conectar MetaMask con Wallet 1
   - Mostrar el catálogo de productos
   - Mostrar el producto que acabamos de agregar

3. **Agregar al carrito**
   - Hacer clic en "Agregar al Carrito"
   - Confirmar en MetaMask
   - Mostrar notificación de éxito
   - Mostrar el contador del carrito (badge con número)

4. **Ver el carrito**
   - Hacer clic en "Ver Carrito"
   - Mostrar productos en el carrito
   - Mostrar total

5. **Checkout**
   - Hacer clic en "Proceder al Pago"
   - Confirmar en MetaMask
   - Explicar: "Esto crea una factura en el contrato"
   - Mostrar redirección a pasarela de pagos

---

### **PARTE 6: Proceso de Pago (3-4 min)**

**VOZ EN OFF:**
```
"Ahora estamos en la pasarela de pagos donde completaremos el pago."
```

**ACCIÓN EN PANTALLA:**

1. **Mostrar Pasarela de Pagos** (`http://localhost:6002`)
   - Mostrar detalles de la factura
   - Mostrar balance de la wallet
   - Explicar los 2 pasos:
     - Paso 1: Aprobar tokens (si es necesario)
     - Paso 2: Procesar pago

2. **Hacer clic en "Pagar €X.XX"**
   - Si es necesario, mostrar aprobación en MetaMask (Paso 1)
   - Mostrar mensaje: "Paso 1 de 2: Aprobando tokens..."
   - Confirmar aprobación
   - Esperar confirmación

3. **Procesar pago**
   - Mostrar mensaje: "Paso 2 de 2: Procesando pago..."
   - Confirmar pago en MetaMask
   - Esperar confirmación

4. **Mostrar éxito**
   - Mostrar mensaje de éxito
   - Mostrar balance antes y después
   - Explicar redirección automática

5. **Ver factura pagada**
   - Mostrar página de detalle de la factura
   - Mostrar estado "Pagada"
   - Explicar que el balance se redujo

---

### **PARTE 7: Ver Historial de Pedidos (1-2 min)**

**VOZ EN OFF:**
```
"Puedes ver todos tus pedidos en el historial."
```

**ACCIÓN EN PANTALLA:**

1. **Ir a Historial** (`http://localhost:6004/orders`)
   - Mostrar resumen estadístico:
     - Total de facturas
     - Facturas pendientes
     - Facturas pagadas
     - Facturas canceladas

2. **Mostrar lista de facturas**
   - Mostrar factura recién creada
   - Mostrar estado, monto, fecha
   - Hacer clic en "Ver Detalles"
   - Mostrar detalles completos

---

### **PARTE 8: Ver Facturas como Empresa (1-2 min)**

**VOZ EN OFF:**
```
"Como empresa, también puedes ver todas las facturas recibidas."
```

**ACCIÓN EN PANTALLA:**

1. **Volver a Web Admin**
   - Cambiar a Wallet 2 (Empresa) en MetaMask
   - Ir a tab "Facturas"

2. **Mostrar facturas**
   - Mostrar la factura que acabamos de pagar
   - Mostrar detalles: cliente, monto, estado
   - Explicar que el balance de la empresa aumentó

---

### **PARTE 9: Resumen y Consejos (1 min)**

**VOZ EN OFF:**
```
"Para resumir:
- Usa 2 wallets diferentes: una para comprar, otra para vender
- Compra EuroTokens primero antes de comprar productos
- Los pagos se procesan en la blockchain
- Todas las transacciones son transparentes y verificables

¡Gracias por ver el tutorial!"
```

---

## 🎬 NOTAS PARA GRABACIÓN

### **Configuración de Pantalla:**
- Resolución: 1920x1080
- Mostrar solo las ventanas relevantes
- Zoom cuando sea necesario para mostrar detalles

### **Tiempos de Espera:**
- Esperar 2-3 segundos después de cada acción
- Mostrar claramente las confirmaciones de MetaMask
- Esperar confirmaciones de blockchain (pueden tardar unos segundos)

### **Efectos Visuales:**
- Usar círculos o flechas para resaltar elementos importantes
- Agregar texto sobre la pantalla para explicar pasos
- Usar zoom para mostrar direcciones de wallet y balances

### **Audio:**
- Hablar claro y pausado
- Explicar cada acción antes de hacerla
- Pausar durante las transacciones de MetaMask

---

## 🛠️ HERRAMIENTAS RECOMENDADAS PARA GRABAR

1. **OBS Studio** (Gratis)
   - Graba pantalla y audio
   - Puedes agregar texto y efectos

2. **Loom** (Gratis)
   - Fácil de usar
   - Grabación rápida

3. **Camtasia** (De pago)
   - Editor de video incluido
   - Fácil de editar

4. **ScreenRec** (Gratis)
   - Simple y directo

---

## ✅ CHECKLIST ANTES DE GRABAR

- [ ] Anvil corriendo (blockchain local)
- [ ] Todas las aplicaciones iniciadas y funcionando
- [ ] 2 wallets configuradas en MetaMask
- [ ] Al menos 1 producto agregado
- [ ] Wallet de cliente con balance suficiente
- [ ] Cerrar ventanas innecesarias
- [ ] Silenciar notificaciones
- [ ] Preparar datos de ejemplo:
  - Nombre de empresa
  - NIT
  - Datos de producto
  - Montos a usar

---

## 📝 TEXTO PARA INTRODUCCIÓN (Mostrar en pantalla)

```
┌─────────────────────────────────────────┐
│  Sistema E-commerce con Blockchain      │
│                                         │
│  Tutorial Completo                      │
│                                         │
│  - Compra de EuroTokens                 │
│  - Gestión de Empresa                   │
│  - Agregar Productos                    │
│  - Comprar como Cliente                 │
│  - Proceso de Pago                      │
│  - Historial de Pedidos                 │
└─────────────────────────────────────────┘
```

---

## 🎯 SECCIONES DEL VIDEO (Timestamps sugeridos)

- [00:00 - 01:00] Introducción
- [01:00 - 03:00] Compra de EuroTokens
- [03:00 - 06:00] Gestión de Empresa
- [06:00 - 09:00] Agregar Productos
- [09:00 - 13:00] Compra como Cliente
- [13:00 - 17:00] Proceso de Pago
- [17:00 - 19:00] Historial de Pedidos
- [19:00 - 20:00] Ver Facturas como Empresa
- [20:00 - 21:00] Resumen y Consejos

---

## 💡 TIPS ADICIONALES

1. **Grabar en partes**: Graba cada sección por separado, luego únelas
2. **Preparar datos**: Ten todos los datos listos antes de grabar
3. **Práctica previa**: Haz una prueba completa antes de grabar
4. **Edición**: Edita para quitar pausas largas y errores
5. **Subtítulos**: Considera agregar subtítulos para mejor comprensión

---

## 📚 DOCUMENTACIÓN ADICIONAL

- Puedes referir al README.md principal
- Incluir screenshots en la documentación
- Crear un diagrama de flujo del proceso completo

