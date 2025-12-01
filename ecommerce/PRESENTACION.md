# 🛒 E-Commerce con Blockchain y Stablecoins
## Sistema Completo de Comercio Electrónico Descentralizado

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Aplicaciones del Proyecto](#aplicaciones-del-proyecto)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
6. [Demostración Visual](#demostración-visual)
7. [Conclusiones](#conclusiones)

---

## 🎯 Introducción

### ¿Qué es este proyecto?

Sistema completo de **e-commerce descentralizado** que integra:

- ✅ **Blockchain local** (Anvil) para desarrollo
- ✅ **Smart Contracts** (Solidity) para gestión de comercio
- ✅ **Stablecoin propia** (EuroToken - EURT)
- ✅ **Integración con Stripe** para compra de tokens con tarjeta
- ✅ **Pasarela de pagos** con criptomonedas
- ✅ **Panel de administración** para empresas
- ✅ **Tienda online** para clientes finales

### Objetivos

- Demostrar integración completa entre blockchain y e-commerce tradicional
- Facilitar pagos con stablecoins
- Proporcionar experiencia de usuario fluida
- Garantizar transparencia y seguridad mediante smart contracts

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    E-COMMERCE BLOCKCHAIN                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │  Web    │          │   Web      │        │  Compra   │
   │ Admin   │          │ Customer   │        │ Stablecoin│
   │(6011)   │          │  (6004)   │        │  (6001)   │
   └────┬────┘          └─────┬─────┘        └─────┬─────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Pasarela de Pago │
                    │      (6002)       │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │Ecommerce│          │ EuroToken │        │   Anvil   │
   │Contract │          │  Contract │        │  (8545)   │
   └─────────┘          └───────────┘        └───────────┘
```

### Componentes Principales

1. **Blockchain Local (Anvil)**
   - Puerto: 8545
   - Chain ID: 31337
   - RPC endpoint para MetaMask

2. **Smart Contracts**
   - **EuroToken (EURT)**: Token ERC20 con 6 decimales
   - **Ecommerce**: Gestión de empresas, productos, carritos, facturas y pagos

3. **Aplicaciones Frontend**
   - **Web Admin**: Panel de administración (Puerto 6011)
   - **Web Customer**: Tienda online (Puerto 6004)
   - **Compra Stablecoin**: Compra de tokens con Stripe (Puerto 6001)
   - **Pasarela de Pago**: Procesamiento de pagos (Puerto 6002)

---

## 🚀 Aplicaciones del Proyecto

### 1. Web Admin - Panel de Administración

**URL:** `http://localhost:6011`

**Funcionalidades:**
- ✅ Registro de empresas
- ✅ Gestión de productos
- ✅ Visualización de facturas
- ✅ Gestión de inventario
- ✅ Estadísticas de ventas

**Características:**
- Interfaz intuitiva y moderna
- Conexión con MetaMask
- Gestión completa de catálogo
- Dashboard con métricas

---

### 2. Web Customer - Tienda Online

**URL:** `http://localhost:6004`

**Funcionalidades:**
- ✅ Catálogo de productos
- ✅ Carrito de compras
- ✅ Checkout integrado
- ✅ Historial de pedidos
- ✅ Integración con pasarela de pago

**Características:**
- Diseño responsive
- Búsqueda y filtrado de productos
- Carrito persistente
- Pago con EuroToken

---

### 3. Compra Stablecoin

**URL:** `http://localhost:6001`

**Funcionalidades:**
- ✅ Compra de EuroToken con tarjeta de crédito
- ✅ Integración con Stripe
- ✅ Mint automático de tokens
- ✅ Verificación de saldo

**Características:**
- Proceso de compra simplificado
- Validación en tiempo real
- Confirmación de transacciones
- Historial de compras

---

### 4. Pasarela de Pago

**URL:** `http://localhost:6002`

**Funcionalidades:**
- ✅ Procesamiento de pagos con EuroToken
- ✅ Aprobación de tokens
- ✅ Verificación de saldo
- ✅ Redirección automática
- ✅ Confirmación de pagos

**Características:**
- Interfaz de pago segura
- Validación de transacciones
- Integración con smart contracts
- Notificaciones en tiempo real

---

## 💻 Tecnologías Utilizadas

### Blockchain y Smart Contracts

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Solidity** | ^0.8.20 | Lenguaje de smart contracts |
| **Foundry/Forge** | Latest | Framework de desarrollo |
| **Anvil** | Latest | Blockchain local |
| **Ethers.js** | v6.13.0 | Interacción con blockchain |

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 15.0.0 | Framework React |
| **TypeScript** | 5.3.3 | Tipado estático |
| **Tailwind CSS** | 3.4.1 | Estilos |
| **React** | 18.3.1 | Librería UI |

### Pagos y Integraciones

| Tecnología | Uso |
|------------|-----|
| **Stripe** | Procesamiento de pagos fiat |
| **MetaMask** | Wallet de criptomonedas |
| **ERC20** | Estándar de tokens |

---

## 🔄 Flujo de Trabajo Completo

### Flujo 1: Compra de EuroToken

```
1. Usuario accede a Compra Stablecoin (localhost:6001)
2. Conecta MetaMask
3. Ingresa cantidad de EURT a comprar
4. Procesa pago con tarjeta (Stripe)
5. Smart contract mintea tokens automáticamente
6. Usuario recibe EURT en su wallet
```

### Flujo 2: Compra de Producto

```
1. Usuario navega en Web Customer (localhost:6004)
2. Agrega productos al carrito
3. Procede al checkout
4. Se crea factura en blockchain
5. Redirección a Pasarela de Pago (localhost:6002)
6. Usuario aprueba y paga con EuroToken
7. Confirmación y redirección a Web Customer
```

### Flujo 3: Administración

```
1. Empresa se registra en Web Admin (localhost:6011)
2. Conecta MetaMask (wallet de la empresa)
3. Crea productos en el catálogo
4. Gestiona inventario
5. Visualiza facturas y estadísticas
```

---

## 📸 Demostración Visual

### Video de Presentación

🎥 **Presentación completa del proyecto en video:**

[![Video de Presentación](https://img.youtube.com/vi/H_6zbPxbMcU/0.jpg)](https://youtu.be/H_6zbPxbMcU)

**Ver en YouTube:** [https://youtu.be/H_6zbPxbMcU](https://youtu.be/H_6zbPxbMcU)

---

### Capturas de Pantalla del Sistema

> **Nota:** Las siguientes secciones incluyen las capturas de pantalla extraídas del documento Word. Las imágenes están ubicadas en `presentacion/imagenes/`

#### Imagen 1: Portada / Dashboard Principal
![Imagen 1](presentacion/imagenes/image1.png)

#### Imagen 2: Web Admin - Registro de Empresa
![Imagen 2](presentacion/imagenes/image2.png)

#### Imagen 3: Web Admin - Gestión de Productos
![Imagen 3](presentacion/imagenes/image3.png)

#### Imagen 4: Web Customer - Catálogo de Productos
![Imagen 4](presentacion/imagenes/image4.png)

#### Imagen 5: Web Customer - Carrito de Compras
![Imagen 5](presentacion/imagenes/image5.png)

#### Imagen 6: Pasarela de Pago - Proceso de Pago
![Imagen 6](presentacion/imagenes/image6.png)

#### Imagen 7: Compra Stablecoin - Interfaz de Compra
![Imagen 7](presentacion/imagenes/image7.png)

#### Imagen 8: MetaMask - Confirmación de Transacción
![Imagen 8](presentacion/imagenes/image8.png)

#### Imagen 9: Web Admin - Dashboard de Estadísticas
![Imagen 9](presentacion/imagenes/image9.png)

#### Imagen 10: Web Customer - Detalle de Producto
![Imagen 10](presentacion/imagenes/image10.png)

#### Imagen 11: Pasarela de Pago - Confirmación
![Imagen 11](presentacion/imagenes/image11.png)

#### Imagen 12: Compra Stablecoin - Historial
![Imagen 12](presentacion/imagenes/image12.png)

#### Imagen 13: Web Admin - Facturas
![Imagen 13](presentacion/imagenes/image13.png)

#### Imagen 14: Web Customer - Checkout
![Imagen 14](presentacion/imagenes/image14.png)

#### Imagen 15: Pasarela de Pago - Verificación
![Imagen 15](presentacion/imagenes/image15.png)

#### Imagen 16: Compra Stablecoin - Proceso de Pago
![Imagen 16](presentacion/imagenes/image16.png)

#### Imagen 17: Web Admin - Gestión de Inventario
![Imagen 17](presentacion/imagenes/image17.png)

#### Imagen 18: Web Customer - Búsqueda
![Imagen 18](presentacion/imagenes/image18.png)

#### Imagen 19: Pasarela de Pago - Error Handling
![Imagen 19](presentacion/imagenes/image19.png)

#### Imagen 20: Compra Stablecoin - Saldo
![Imagen 20](presentacion/imagenes/image20.png)

#### Imagen 21-42: Capturas Adicionales
![Imagen 21](presentacion/imagenes/image21.png)
![Imagen 22](presentacion/imagenes/image22.png)
![Imagen 23](presentacion/imagenes/image23.png)
![Imagen 24](presentacion/imagenes/image24.png)
![Imagen 25](presentacion/imagenes/image25.png)
![Imagen 26](presentacion/imagenes/image26.png)
![Imagen 27](presentacion/imagenes/image27.png)
![Imagen 28](presentacion/imagenes/image28.png)
![Imagen 29](presentacion/imagenes/image29.png)
![Imagen 30](presentacion/imagenes/image30.png)
![Imagen 31](presentacion/imagenes/image31.png)
![Imagen 32](presentacion/imagenes/image32.png)
![Imagen 33](presentacion/imagenes/image33.png)
![Imagen 34](presentacion/imagenes/image34.png)
![Imagen 35](presentacion/imagenes/image35.png)
![Imagen 36](presentacion/imagenes/image36.png)
![Imagen 37](presentacion/imagenes/image37.png)
![Imagen 38](presentacion/imagenes/image38.png)
![Imagen 39](presentacion/imagenes/image39.png)
![Imagen 40](presentacion/imagenes/image40.png)
![Imagen 41](presentacion/imagenes/image41.png)
![Imagen 42](presentacion/imagenes/image42.png)

---

## 🎯 Características Destacadas

### Seguridad

- ✅ Smart contracts auditables
- ✅ Transacciones verificables en blockchain
- ✅ Integración segura con Stripe
- ✅ Validación de pagos en tiempo real

### Experiencia de Usuario

- ✅ Interfaz moderna y responsive
- ✅ Proceso de pago simplificado
- ✅ Feedback visual inmediato
- ✅ Manejo de errores robusto

### Escalabilidad

- ✅ Arquitectura modular
- ✅ Contratos reutilizables
- ✅ Sistema de librerías (CompanyLib, ProductLib, etc.)
- ✅ Fácil extensión de funcionalidades

---

## 📊 Estadísticas del Proyecto

### Código

- **Smart Contracts:** 2 (EuroToken + Ecommerce)
- **Aplicaciones Frontend:** 4
- **Líneas de Código:** ~15,000+
- **Tests:** Cobertura completa de contratos

### Funcionalidades

- ✅ Gestión completa de empresas
- ✅ Catálogo de productos ilimitado
- ✅ Sistema de carritos
- ✅ Facturación automática
- ✅ Procesamiento de pagos
- ✅ Integración Stripe
- ✅ Mint de tokens

---

## 🔮 Próximos Pasos

### Mejoras Planificadas

1. **Optimización de Gas**
   - Reducir costos de transacciones
   - Implementar batch operations

2. **Mejoras de UI/UX**
   - Modo oscuro
   - Internacionalización (i18n)
   - Mejores animaciones

3. **Funcionalidades Adicionales**
   - Sistema de reviews
   - Programa de fidelización
   - Descuentos y cupones
   - Notificaciones push

4. **Testing**
   - Tests de integración E2E
   - Tests de carga
   - Auditoría de seguridad

---

## ✅ Conclusiones

### Logros

- ✅ Sistema completo funcional
- ✅ Integración blockchain + e-commerce tradicional
- ✅ Experiencia de usuario fluida
- ✅ Arquitectura escalable
- ✅ Código bien documentado

### Impacto

Este proyecto demuestra cómo la tecnología blockchain puede integrarse de manera transparente en aplicaciones de e-commerce tradicionales, proporcionando:

- **Transparencia:** Todas las transacciones son verificables
- **Seguridad:** Smart contracts garantizan la ejecución correcta
- **Eficiencia:** Pagos instantáneos con stablecoins
- **Flexibilidad:** Sistema modular y extensible

### Tecnologías del Futuro

El e-commerce descentralizado representa el futuro del comercio online, combinando:

- La facilidad de uso de las aplicaciones tradicionales
- La seguridad y transparencia de blockchain
- La flexibilidad de los pagos con criptomonedas

---

## 📞 Información de Contacto

**Proyecto:** E-Commerce con Blockchain y Stablecoins  
**Repositorio:** `/mnt/c/Users/jcmxo/ecommerce`  
**Documentación:** Ver archivos README.md en cada directorio

---

## 🙏 Agradecimientos

- **CodeCrypto.Academy** - Por la formación y apoyo en el desarrollo de este proyecto
- **Foundry** - Framework de desarrollo de smart contracts
- **Next.js** - Framework React de próxima generación
- **Stripe** - Procesamiento de pagos
- **OpenZeppelin** - Contratos seguros y auditados
- **Ethers.js** - Librería de interacción con Ethereum

---

**¡Gracias por su atención!**

---

*Presentación generada automáticamente - Diciembre 2024*

