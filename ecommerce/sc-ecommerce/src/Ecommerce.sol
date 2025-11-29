// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IEuroToken.sol";
import "./libraries/CompanyLib.sol";
import "./libraries/ProductLib.sol";
import "./libraries/CartLib.sol";
import "./libraries/InvoiceLib.sol";
import "./libraries/PaymentLib.sol";

/**
 * @title Ecommerce
 * @dev Contrato principal para gestión de e-commerce en blockchain
 */
contract Ecommerce {
    using SafeERC20 for IEuroToken;

    // Storage de librerías
    CompanyLib.CompanyStorage private companyStore;
    ProductLib.ProductStorage private productStore;
    CartLib.CartStorage private cartStore;
    InvoiceLib.InvoiceStorage private invoiceStore;

    // Token usado para pagos
    IEuroToken public immutable euroToken;

    // Eventos
    event CompanyRegistered(
        uint256 indexed companyId,
        string name,
        address indexed companyAddress,
        address indexed owner
    );

    event ProductAdded(
        uint256 indexed productId,
        uint256 indexed companyId,
        string name,
        uint256 price,
        uint256 stock
    );

    event ProductUpdated(
        uint256 indexed productId,
        uint256 stock
    );

    event CartItemAdded(
        address indexed customer,
        uint256 indexed productId,
        uint256 quantity
    );

    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed customer,
        uint256 indexed companyId,
        uint256 totalAmount
    );

    event PaymentProcessed(
        uint256 indexed invoiceId,
        address indexed customer,
        uint256 indexed companyId,
        uint256 amount
    );

    error CompanyNotActive(uint256 companyId);
    error ProductNotFound(uint256 productId);
    error InsufficientStock(uint256 productId, uint256 requested, uint256 available);
    error EmptyCart(address customer);
    error InvoiceNotFound(uint256 invoiceId);

    constructor(address _euroTokenAddress) {
        require(_euroTokenAddress != address(0), "Invalid token address");
        euroToken = IEuroToken(_euroTokenAddress);
    }

    /**
     * @dev Registrar una nueva empresa
     */
    function registerCompany(
        string memory name,
        address companyAddress,
        string memory taxId
    ) external returns (uint256) {
        uint256 companyId = CompanyLib.registerCompany(
            companyStore,
            name,
            companyAddress,
            taxId,
            msg.sender
        );

        emit CompanyRegistered(companyId, name, companyAddress, msg.sender);
        return companyId;
    }

    /**
     * @dev Obtener información de una empresa
     */
    function getCompany(uint256 companyId) external view returns (CompanyLib.Company memory) {
        return CompanyLib.getCompany(companyStore, companyId);
    }

    /**
     * @dev Obtener ID de empresa por dirección
     */
    function getCompanyIdByAddress(address companyAddress) external view returns (uint256) {
        return CompanyLib.getCompanyIdByAddress(companyStore, companyAddress);
    }

    /**
     * @dev Agregar un producto
     */
    function addProduct(
        uint256 companyId,
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock,
        string memory imageHash
    ) external returns (uint256) {
        uint256 productId = ProductLib.addProduct(
            productStore,
            companyStore,
            companyId,
            name,
            description,
            price,
            stock,
            imageHash,
            msg.sender
        );

        emit ProductAdded(productId, companyId, name, price, stock);
        return productId;
    }

    /**
     * @dev Obtener un producto
     */
    function getProduct(uint256 productId) external view returns (ProductLib.Product memory) {
        return ProductLib.getProduct(productStore, productId);
    }

    /**
     * @dev Obtener productos de una empresa
     */
    function getCompanyProducts(uint256 companyId) external view returns (uint256[] memory) {
        return ProductLib.getCompanyProducts(productStore, companyId);
    }

    /**
     * @dev Actualizar stock de un producto
     */
    function updateStock(
        uint256 productId,
        uint256 newStock
    ) external {
        ProductLib.updateStock(
            productStore,
            companyStore,
            productId,
            newStock,
            msg.sender
        );

        emit ProductUpdated(productId, newStock);
    }

    /**
     * @dev Agregar producto al carrito
     */
    function addToCart(
        uint256 productId,
        uint256 quantity
    ) external {
        // Verificar que el producto existe y tiene stock
        ProductLib.Product memory product = ProductLib.getProduct(productStore, productId);
        
        if (!product.isActive) {
            revert ProductNotFound(productId);
        }

        if (!ProductLib.hasStock(productStore, productId, quantity)) {
            revert InsufficientStock(productId, quantity, product.stock);
        }

        CartLib.addToCart(cartStore, msg.sender, productId, quantity);

        emit CartItemAdded(msg.sender, productId, quantity);
    }

    /**
     * @dev Obtener carrito
     */
    function getCart() external view returns (CartLib.Cart memory) {
        return CartLib.getCart(cartStore, msg.sender);
    }

    /**
     * @dev Limpiar carrito
     */
    function clearCart() external {
        CartLib.clearCart(cartStore, msg.sender);
    }

    /**
     * @dev Crear invoice desde el carrito
     */
    function createInvoice() external returns (uint256) {
        CartLib.Cart memory cart = CartLib.getCart(cartStore, msg.sender);

        if (cart.items.length == 0) {
            revert EmptyCart(msg.sender);
        }

        // Obtener companyId del primer producto
        ProductLib.Product memory firstProduct = ProductLib.getProduct(
            productStore,
            cart.items[0].productId
        );
        uint256 companyId = firstProduct.companyId;

        // Verificar que todos los productos son de la misma empresa
        for (uint256 i = 0; i < cart.items.length; i++) {
            ProductLib.Product memory product = ProductLib.getProduct(
                productStore,
                cart.items[i].productId
            );

            if (product.companyId != companyId) {
                revert("All products must be from the same company");
            }

            if (!ProductLib.hasStock(productStore, cart.items[i].productId, cart.items[i].quantity)) {
                revert InsufficientStock(
                    cart.items[i].productId,
                    cart.items[i].quantity,
                    product.stock
                );
            }
        }

        // Verificar que la empresa está activa
        if (!CompanyLib.isCompanyActive(companyStore, companyId)) {
            revert CompanyNotActive(companyId);
        }

        // Crear invoice
        uint256 invoiceId = InvoiceLib.createInvoice(
            invoiceStore,
            msg.sender,
            companyId,
            cart.items,
            productStore
        );

        // Limpiar carrito
        CartLib.clearCart(cartStore, msg.sender);

        emit InvoiceCreated(invoiceId, msg.sender, companyId, 
            InvoiceLib.getInvoice(invoiceStore, invoiceId).totalAmount);

        return invoiceId;
    }

    /**
     * @dev Obtener una factura
     */
    function getInvoice(uint256 invoiceId) external view returns (InvoiceLib.Invoice memory) {
        return InvoiceLib.getInvoice(invoiceStore, invoiceId);
    }

    /**
     * @dev Obtener invoices de un cliente
     */
    function getCustomerInvoices() external view returns (uint256[] memory) {
        return InvoiceLib.getCustomerInvoices(invoiceStore, msg.sender);
    }

    /**
     * @dev Obtener invoices de una empresa
     */
    function getCompanyInvoices(uint256 companyId) external view returns (uint256[] memory) {
        // Verificar que el caller es owner de la empresa
        if (!CompanyLib.isCompanyOwner(companyStore, msg.sender)) {
            revert("Not company owner");
        }

        uint256 callerCompanyId = CompanyLib.getCompanyIdByAddress(companyStore, msg.sender);
        if (callerCompanyId != companyId) {
            revert("Company ID mismatch");
        }

        return InvoiceLib.getCompanyInvoices(invoiceStore, companyId);
    }

    /**
     * @dev Procesar pago de una factura
     */
    function processPayment(uint256 invoiceId) external {
        PaymentLib.processPayment(
            invoiceStore,
            productStore,
            companyStore,
            euroToken,
            invoiceId,
            msg.sender
        );

        InvoiceLib.Invoice memory invoice = InvoiceLib.getInvoice(invoiceStore, invoiceId);
        emit PaymentProcessed(invoiceId, invoice.customer, invoice.companyId, invoice.totalAmount);
    }
}

