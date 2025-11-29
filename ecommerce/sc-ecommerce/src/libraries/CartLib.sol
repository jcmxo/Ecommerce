// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title CartLib
 * @dev Librería para gestión de carritos de compra
 */
library CartLib {
    struct CartItem {
        uint256 productId;
        uint256 quantity;
    }

    struct Cart {
        address customer;
        CartItem[] items;
        bool exists;
    }

    struct CartStorage {
        mapping(address => Cart) carts;
    }

    error CartNotFound(address customer);
    error EmptyCart(address customer);

    /**
     * @dev Obtener el storage de carts
     */
    function getStorage() internal pure returns (CartStorage storage store) {
        bytes32 position = keccak256("ecommerce.carts");
        assembly {
            store.slot := position
        }
    }

    /**
     * @dev Obtener o crear carrito de un cliente
     */
    function getOrCreateCart(
        CartStorage storage self,
        address customer
    ) internal returns (Cart storage) {
        if (!self.carts[customer].exists) {
            self.carts[customer].exists = true;
            self.carts[customer].customer = customer;
        }
        return self.carts[customer];
    }

    /**
     * @dev Obtener carrito de un cliente
     */
    function getCart(
        CartStorage storage self,
        address customer
    ) internal view returns (Cart memory) {
        if (!self.carts[customer].exists) {
            revert CartNotFound(customer);
        }
        return self.carts[customer];
    }

    /**
     * @dev Agregar producto al carrito
     */
    function addToCart(
        CartStorage storage self,
        address customer,
        uint256 productId,
        uint256 quantity
    ) internal {
        Cart storage cart = getOrCreateCart(self, customer);
        
        // Verificar si el producto ya está en el carrito
        bool found = false;
        for (uint256 i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {
                cart.items[i].quantity += quantity;
                found = true;
                break;
            }
        }

        if (!found) {
            cart.items.push(CartItem({
                productId: productId,
                quantity: quantity
            }));
        }
    }

    /**
     * @dev Actualizar cantidad de un producto en el carrito
     */
    function updateCartItem(
        CartStorage storage self,
        address customer,
        uint256 productId,
        uint256 quantity
    ) internal {
        Cart storage cart = getOrCreateCart(self, customer);
        
        for (uint256 i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {
                if (quantity == 0) {
                    // Remover item
                    cart.items[i] = cart.items[cart.items.length - 1];
                    cart.items.pop();
                } else {
                    cart.items[i].quantity = quantity;
                }
                return;
            }
        }

        // Si no se encontró y quantity > 0, agregar
        if (quantity > 0) {
            cart.items.push(CartItem({
                productId: productId,
                quantity: quantity
            }));
        }
    }

    /**
     * @dev Remover producto del carrito
     */
    function removeFromCart(
        CartStorage storage self,
        address customer,
        uint256 productId
    ) internal {
        Cart storage cart = getOrCreateCart(self, customer);
        
        for (uint256 i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {
                cart.items[i] = cart.items[cart.items.length - 1];
                cart.items.pop();
                return;
            }
        }
    }

    /**
     * @dev Limpiar carrito
     */
    function clearCart(
        CartStorage storage self,
        address customer
    ) internal {
        Cart storage cart = getOrCreateCart(self, customer);
        delete cart.items;
    }

    /**
     * @dev Verificar si el carrito está vacío
     */
    function isEmpty(
        CartStorage storage self,
        address customer
    ) internal view returns (bool) {
        if (!self.carts[customer].exists) {
            return true;
        }
        return self.carts[customer].items.length == 0;
    }
}

