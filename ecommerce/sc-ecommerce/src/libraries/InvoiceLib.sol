// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CartLib.sol";
import "./ProductLib.sol";

/**
 * @title InvoiceLib
 * @dev Librería para gestión de facturas
 */
library InvoiceLib {
    enum InvoiceStatus {
        Pending,
        Paid,
        Cancelled
    }

    struct InvoiceItem {
        uint256 productId;
        uint256 quantity;
        uint256 price; // Precio unitario al momento de la factura
        uint256 total;
    }

    struct Invoice {
        uint256 invoiceId;
        address customer;
        uint256 companyId;
        InvoiceItem[] items;
        uint256 totalAmount;
        InvoiceStatus status;
        uint256 createdAt;
        uint256 paidAt;
    }

    struct InvoiceStorage {
        mapping(uint256 => Invoice) invoices;
        mapping(address => uint256[]) customerInvoices;
        mapping(uint256 => uint256[]) companyInvoices;
        uint256 nextInvoiceId;
    }

    error InvoiceNotFound(uint256 invoiceId);
    error InvoiceNotPending(uint256 invoiceId);
    error InvalidInvoiceStatus(uint256 invoiceId);

    /**
     * @dev Obtener el storage de invoices
     */
    function getStorage() internal pure returns (InvoiceStorage storage store) {
        bytes32 position = keccak256("ecommerce.invoices");
        assembly {
            store.slot := position
        }
    }

    /**
     * @dev Crear una nueva factura desde un carrito
     */
    function createInvoice(
        InvoiceStorage storage self,
        address customer,
        uint256 companyId,
        CartLib.CartItem[] memory cartItems,
        ProductLib.ProductStorage storage productStore
    ) internal returns (uint256) {
        uint256 invoiceId = ++self.nextInvoiceId;
        
        Invoice storage invoice = self.invoices[invoiceId];
        invoice.invoiceId = invoiceId;
        invoice.customer = customer;
        invoice.companyId = companyId;
        invoice.status = InvoiceStatus.Pending;
        invoice.createdAt = block.timestamp;

        uint256 totalAmount = 0;

        // Procesar items del carrito
        for (uint256 i = 0; i < cartItems.length; i++) {
            ProductLib.Product memory product = ProductLib.getProduct(
                productStore,
                cartItems[i].productId
            );

            uint256 itemTotal = product.price * cartItems[i].quantity;
            totalAmount += itemTotal;

            invoice.items.push(InvoiceItem({
                productId: cartItems[i].productId,
                quantity: cartItems[i].quantity,
                price: product.price,
                total: itemTotal
            }));
        }

        invoice.totalAmount = totalAmount;

        // Agregar a listas de invoices
        self.customerInvoices[customer].push(invoiceId);
        self.companyInvoices[companyId].push(invoiceId);

        return invoiceId;
    }

    /**
     * @dev Obtener una factura
     */
    function getInvoice(
        InvoiceStorage storage self,
        uint256 invoiceId
    ) internal view returns (Invoice memory) {
        if (self.invoices[invoiceId].invoiceId == 0) {
            revert InvoiceNotFound(invoiceId);
        }
        return self.invoices[invoiceId];
    }

    /**
     * @dev Marcar factura como pagada
     */
    function markAsPaid(
        InvoiceStorage storage self,
        uint256 invoiceId
    ) internal {
        Invoice storage invoice = self.invoices[invoiceId];
        
        if (invoice.invoiceId == 0) {
            revert InvoiceNotFound(invoiceId);
        }

        if (invoice.status != InvoiceStatus.Pending) {
            revert InvoiceNotPending(invoiceId);
        }

        invoice.status = InvoiceStatus.Paid;
        invoice.paidAt = block.timestamp;
    }

    /**
     * @dev Cancelar una factura
     */
    function cancelInvoice(
        InvoiceStorage storage self,
        uint256 invoiceId
    ) internal {
        Invoice storage invoice = self.invoices[invoiceId];
        
        if (invoice.invoiceId == 0) {
            revert InvoiceNotFound(invoiceId);
        }

        if (invoice.status != InvoiceStatus.Pending) {
            revert InvoiceNotPending(invoiceId);
        }

        invoice.status = InvoiceStatus.Cancelled;
    }

    /**
     * @dev Obtener invoices de un cliente
     */
    function getCustomerInvoices(
        InvoiceStorage storage self,
        address customer
    ) internal view returns (uint256[] memory) {
        return self.customerInvoices[customer];
    }

    /**
     * @dev Obtener invoices de una empresa
     */
    function getCompanyInvoices(
        InvoiceStorage storage self,
        uint256 companyId
    ) internal view returns (uint256[] memory) {
        return self.companyInvoices[companyId];
    }
}

