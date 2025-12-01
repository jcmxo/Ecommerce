# 🌐 Direcciones y Puertos de las Aplicaciones

## 🎥 Video de Presentación

[![Video de Presentación](https://img.youtube.com/vi/H_6zbPxbMcU/0.jpg)](https://youtu.be/H_6zbPxbMcU)

**Ver presentación completa:** [https://youtu.be/H_6zbPxbMcU](https://youtu.be/H_6zbPxbMcU)

---

## 📋 Resumen de Aplicaciones

| # | Nombre de la Aplicación | URL | Puerto | Descripción |
|---|------------------------|-----|--------|-------------|
| 1 | **Anvil (Blockchain Local)** | `http://localhost:8545` | 8545 | Blockchain local para desarrollo |
| 2 | **Compra Stablecoin** | `http://localhost:6001` | 6001 | App para comprar EuroToken con Stripe |
| 3 | **Pasarela de Pago** | `http://localhost:6002` | 6002 | Pasarela de pagos con EuroToken |
| 4 | **Web Admin** | `http://localhost:6011` | 6011 | Panel de administración para empresas |
| 5 | **Web Customer** | `http://localhost:6004` | 6004 | Tienda online para clientes |

---

## 🔗 Enlaces Directos

### 1. Anvil (Blockchain Local)
- **URL:** `http://localhost:8545`
- **Puerto:** 8545
- **Descripción:** Blockchain local de desarrollo (Foundry/Anvil)
- **Uso:** RPC endpoint para MetaMask y contratos

### 2. Compra Stablecoin
- **URL:** `http://localhost:6001`
- **Puerto:** 6001
- **Nombre:** `compra-stablecoin`
- **Descripción:** Aplicación para comprar EuroToken (EURT) con tarjeta de crédito usando Stripe
- **Funcionalidad:**
  - Conexión con MetaMask
  - Pago con tarjeta de crédito (Stripe)
  - Mint automático de tokens EURT

### 3. Pasarela de Pago
- **URL:** `http://localhost:6002`
- **Puerto:** 6002
- **Nombre:** `pasarela-de-pago`
- **Descripción:** Sistema de pagos con EuroToken
- **Funcionalidad:**
  - Aprobación de tokens
  - Pago a comerciantes
  - Redirección automática
  - Verificación de saldo

### 4. Web Admin
- **URL:** `http://localhost:6011`
- **Puerto:** 6011
- **Nombre:** `web-admin`
- **Descripción:** Panel de administración para empresas
- **Funcionalidad:**
  - Registro y gestión de empresas
  - Gestión de productos
  - Visualización de facturas
  - Gestión de clientes

### 5. Web Customer
- **URL:** `http://localhost:6004`
- **Puerto:** 6004
- **Nombre:** `web-customer`
- **Descripción:** Tienda online para clientes finales
- **Funcionalidad:**
  - Catálogo de productos
  - Carrito de compras
  - Checkout e integración con pasarela de pago

---

## 🚀 Inicio Rápido

Para iniciar todas las aplicaciones:

```bash
cd /mnt/c/Users/jcmxo/ecommerce
./restart-all.sh
```

---

## 📝 Notas Importantes

### Configuración de MetaMask

Para usar las aplicaciones con MetaMask, configura la red local:

- **Network Name:** Anvil Local
- **RPC URL:** `http://localhost:8545`
- **Chain ID:** `31337`
- **Currency Symbol:** `ETH`

### Contratos Desplegados

Los contratos se despliegan automáticamente al ejecutar `restart-all.sh`:

- **EuroToken:** Se despliega en cada reinicio
- **Ecommerce:** Se despliega en cada reinicio

Las direcciones de los contratos se actualizan automáticamente en los archivos `.env` de cada aplicación.

---

## 🔍 Verificar Estado

Para verificar qué aplicaciones están corriendo:

```bash
# Ver procesos
ps aux | grep -E "anvil|next dev"

# Verificar puertos
netstat -tuln | grep -E ":(6001|6002|6004|6011|8545)"
```

---

## 📚 Documentación Adicional

- **README.md** - Documentación general del proyecto
- **PROGRESO.md** - Estado actual del proyecto
- **CONFIGURAR_STRIPE_RAPIDO.md** - Guía de configuración de Stripe
- **GUIA_STRIPE.md** - Guía completa de Stripe

---

**Última actualización:** Configuración actual del proyecto

