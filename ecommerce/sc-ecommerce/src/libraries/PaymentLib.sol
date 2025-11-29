// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./InvoiceLib.sol";
import "./ProductLib.sol";
import "./CompanyLib.sol";

/**
 * @title PaymentLib
 * @dev Librería para procesamiento de pagos
 */
library PaymentLib {
    using SafeERC20 for IERC20;

    error PaymentFailed();
    error InsufficientAllowance(uint256 required, uint256 available);
    error InvoiceAlreadyPaid(uint256 invoiceId);
    error InvalidPaymentAmount(uint256 expected, uint256 received);

    /**
     * @dev Procesar pago de una factura
     */
    function processPayment(
        InvoiceLib.InvoiceStorage storage invoiceStore,
        ProductLib.ProductStorage storage productStore,
        CompanyLib.CompanyStorage storage companyStore,
        IERC20 token,
        uint256 invoiceId,
        address payer
    ) internal {
        InvoiceLib.Invoice memory invoice = InvoiceLib.getInvoice(invoiceStore, invoiceId);

        // Verificar que la factura está pendiente
        if (invoice.status != InvoiceLib.InvoiceStatus.Pending) {
            revert InvoiceAlreadyPaid(invoiceId);
        }

        // Verificar que el payer es el cliente
        require(invoice.customer == payer, "Not invoice customer");

        // Obtener información de la empresa
        CompanyLib.Company memory company = CompanyLib.getCompany(
            companyStore,
            invoice.companyId
        );

        // Verificar allowance
        uint256 allowance = token.allowance(payer, address(this));
        if (allowance < invoice.totalAmount) {
            revert InsufficientAllowance(invoice.totalAmount, allowance);
        }

        // Verificar balance
        uint256 balance = token.balanceOf(payer);
        if (balance < invoice.totalAmount) {
            revert PaymentFailed();
        }

        // Transferir tokens del cliente a la empresa
        token.safeTransferFrom(payer, company.companyAddress, invoice.totalAmount);

        // Reducir stock de productos
        for (uint256 i = 0; i < invoice.items.length; i++) {
            ProductLib.decreaseStock(
                productStore,
                invoice.items[i].productId,
                invoice.items[i].quantity
            );
        }

        // Marcar factura como pagada
        InvoiceLib.markAsPaid(invoiceStore, invoiceId);
    }
}

