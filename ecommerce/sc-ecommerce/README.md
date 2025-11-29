# Smart Contract E-commerce

Contrato principal para gestión completa de e-commerce en blockchain.

## Arquitectura

El contrato utiliza una arquitectura modular con librerías separadas:

```
Ecommerce.sol (Contrato principal)
├── CompanyLib.sol        # Gestión de empresas
├── ProductLib.sol        # Gestión de productos
├── CartLib.sol          # Carrito de compras
├── InvoiceLib.sol       # Facturas
└── PaymentLib.sol       # Procesamiento de pagos
```

## Características

- ✅ Registro y gestión de empresas
- ✅ Gestión de productos con stock
- ✅ Carrito de compras por cliente
- ✅ Sistema de facturas
- ✅ Procesamiento de pagos con EuroToken
- ✅ Control de acceso y permisos
- ✅ Reducción automática de stock

## Estructuras de Datos

### Company
```solidity
struct Company {
    uint256 companyId;
    string name;
    address companyAddress;  // Wallet donde recibe pagos
    string taxId;
    bool isActive;
}
```

### Product
```solidity
struct Product {
    uint256 productId;
    uint256 companyId;
    string name;
    string description;
    uint256 price; // En EURT (6 decimales)
    uint256 stock;
    string imageHash; // IPFS hash
    bool isActive;
}
```

### Invoice
```solidity
struct Invoice {
    uint256 invoiceId;
    address customer;
    uint256 companyId;
    InvoiceItem[] items;
    uint256 totalAmount;
    InvoiceStatus status; // Pending, Paid, Cancelled
    uint256 createdAt;
    uint256 paidAt;
}
```

## Funciones Principales

### Gestión de Empresas
- `registerCompany()` - Registrar nueva empresa
- `getCompany()` - Obtener información de empresa
- `getCompanyIdByAddress()` - Obtener ID por dirección

### Gestión de Productos
- `addProduct()` - Agregar producto
- `getProduct()` - Obtener producto
- `getCompanyProducts()` - Listar productos de empresa
- `updateStock()` - Actualizar stock

### Carrito de Compras
- `addToCart()` - Agregar producto al carrito
- `getCart()` - Obtener carrito
- `clearCart()` - Limpiar carrito

### Facturas y Pagos
- `createInvoice()` - Crear factura desde carrito
- `getInvoice()` - Obtener factura
- `getCustomerInvoices()` - Listar facturas de cliente
- `getCompanyInvoices()` - Listar facturas de empresa
- `processPayment()` - Procesar pago de factura

## Instalación

```bash
# Instalar dependencias
forge install OpenZeppelin/openzeppelin-contracts

# Compilar
forge build

# Tests
forge test
```

## Deploy

```bash
# Configurar variables de entorno
export PRIVATE_KEY=0x...
export EUROTOKEN_ADDRESS=0x...  # Dirección del contrato EuroToken

# Deploy
forge script script/DeployEcommerce.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vvvv
```

## Flujo Completo

1. **Empresa se registra** → `registerCompany()`
2. **Empresa agrega productos** → `addProduct()`
3. **Cliente agrega productos al carrito** → `addToCart()`
4. **Cliente crea factura** → `createInvoice()`
5. **Cliente paga factura** → `processPayment()`
   - Aprobar tokens al contrato Ecommerce
   - Llamar `processPayment()`
   - Tokens se transfieren a la empresa
   - Stock se reduce automáticamente

## Eventos

- `CompanyRegistered` - Nueva empresa registrada
- `ProductAdded` - Nuevo producto agregado
- `ProductUpdated` - Producto actualizado
- `CartItemAdded` - Item agregado al carrito
- `InvoiceCreated` - Nueva factura creada
- `PaymentProcessed` - Pago procesado

## Seguridad

- ✅ Control de acceso con permisos
- ✅ Validación de inputs
- ✅ Uso de SafeERC20 para transferencias
- ✅ Prevención de reentrancy
- ✅ Verificación de stock antes de venta

## Conversión de Precios

El token usa 6 decimales. Para convertir:

- 1 EUR = 1,000,000 unidades (10^6)
- 10.50 EUR = 10,500,000 unidades

Ejemplo en Solidity:
```solidity
uint256 priceInEur = 10; // 10 EUR
uint256 priceInTokens = priceInEur * 10**6; // 10,000,000 unidades
```

## Testing

```bash
# Ejecutar tests
forge test

# Tests con logs detallados
forge test -vvv

# Tests de una función específica
forge test --match-test testCreateInvoice
```

## Interactuar con el Contrato

### Registrar empresa
```bash
cast send CONTRACT_ADDRESS "registerCompany(string,address,string)" \
    "Mi Tienda" \
    0x... \
    "TAX123" \
    --private-key PRIVATE_KEY \
    --rpc-url http://localhost:8545
```

### Agregar producto
```bash
cast send CONTRACT_ADDRESS "addProduct(uint256,string,string,uint256,uint256,string)" \
    COMPANY_ID \
    "Producto A" \
    "Descripción" \
    10000000 \
    100 \
    "QmHash..." \
    --private-key PRIVATE_KEY \
    --rpc-url http://localhost:8545
```

### Procesar pago
```bash
cast send CONTRACT_ADDRESS "processPayment(uint256)" \
    INVOICE_ID \
    --private-key PRIVATE_KEY \
    --rpc-url http://localhost:8545
```

## Licencia

MIT

