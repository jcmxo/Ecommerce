// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CompanyLib.sol";

/**
 * @title ProductLib
 * @dev Librería para gestión de productos
 */
library ProductLib {
    struct Product {
        uint256 productId;
        uint256 companyId;
        string name;
        string description;
        uint256 price; // Precio en EURT (con 6 decimales)
        uint256 stock;
        string imageHash; // IPFS hash de la imagen
        bool isActive;
    }

    struct ProductStorage {
        mapping(uint256 => Product) products;
        mapping(uint256 => uint256[]) companyProducts; // companyId => productIds[]
        uint256 nextProductId;
    }

    error ProductNotFound(uint256 productId);
    error ProductNotActive(uint256 productId);
    error InsufficientStock(uint256 productId, uint256 requested, uint256 available);
    error InvalidPrice();
    error NotProductOwner(uint256 productId, address caller);

    /**
     * @dev Obtener el storage de products
     */
    function getStorage() internal pure returns (ProductStorage storage store) {
        bytes32 position = keccak256("ecommerce.products");
        assembly {
            store.slot := position
        }
    }

    /**
     * @dev Agregar un nuevo producto
     */
    function addProduct(
        ProductStorage storage self,
        CompanyLib.CompanyStorage storage companyStore,
        uint256 companyId,
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock,
        string memory imageHash,
        address caller
    ) internal returns (uint256) {
        // Verificar que la empresa existe y está activa
        CompanyLib.Company memory company = CompanyLib.getCompany(companyStore, companyId);
        if (!company.isActive) {
            revert CompanyLib.CompanyNotActive(companyId);
        }

        // Verificar que el caller es owner de la empresa
        if (!CompanyLib.isCompanyOwner(companyStore, caller)) {
            revert NotProductOwner(0, caller);
        }

        if (price == 0) {
            revert InvalidPrice();
        }

        uint256 productId = ++self.nextProductId;

        self.products[productId] = Product({
            productId: productId,
            companyId: companyId,
            name: name,
            description: description,
            price: price,
            stock: stock,
            imageHash: imageHash,
            isActive: true
        });

        self.companyProducts[companyId].push(productId);

        return productId;
    }

    /**
     * @dev Obtener un producto
     */
    function getProduct(
        ProductStorage storage self,
        uint256 productId
    ) internal view returns (Product memory) {
        if (self.products[productId].productId == 0) {
            revert ProductNotFound(productId);
        }
        return self.products[productId];
    }

    /**
     * @dev Obtener productos de una empresa
     */
    function getCompanyProducts(
        ProductStorage storage self,
        uint256 companyId
    ) internal view returns (uint256[] memory) {
        return self.companyProducts[companyId];
    }

    /**
     * @dev Actualizar stock de un producto
     */
    function updateStock(
        ProductStorage storage self,
        CompanyLib.CompanyStorage storage companyStore,
        uint256 productId,
        uint256 newStock,
        address caller
    ) internal {
        Product memory product = getProduct(self, productId);
        
        if (!CompanyLib.isCompanyOwner(companyStore, caller)) {
            revert NotProductOwner(productId, caller);
        }

        self.products[productId].stock = newStock;
    }

    /**
     * @dev Reducir stock (para ventas)
     */
    function decreaseStock(
        ProductStorage storage self,
        uint256 productId,
        uint256 quantity
    ) internal {
        Product memory product = getProduct(self, productId);
        
        if (product.stock < quantity) {
            revert InsufficientStock(productId, quantity, product.stock);
        }

        self.products[productId].stock -= quantity;
    }

    /**
     * @dev Verificar stock disponible
     */
    function hasStock(
        ProductStorage storage self,
        uint256 productId,
        uint256 quantity
    ) internal view returns (bool) {
        Product memory product = getProduct(self, productId);
        return product.isActive && product.stock >= quantity;
    }

    /**
     * @dev Desactivar un producto
     */
    function deactivateProduct(
        ProductStorage storage self,
        CompanyLib.CompanyStorage storage companyStore,
        uint256 productId,
        address caller
    ) internal {
        Product memory product = getProduct(self, productId);
        
        if (!CompanyLib.isCompanyOwner(companyStore, caller)) {
            revert NotProductOwner(productId, caller);
        }

        self.products[productId].isActive = false;
    }

    /**
     * @dev Calcular precio total de múltiples productos
     */
    function calculateTotalPrice(
        ProductStorage storage self,
        uint256[] memory productIds,
        uint256[] memory quantities
    ) internal view returns (uint256 total) {
        require(productIds.length == quantities.length, "Arrays length mismatch");

        for (uint256 i = 0; i < productIds.length; i++) {
            Product memory product = getProduct(self, productIds[i]);
            total += product.price * quantities[i];
        }
    }
}

