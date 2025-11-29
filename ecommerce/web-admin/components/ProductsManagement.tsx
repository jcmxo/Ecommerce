"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getEcommerceContract, formatEurt, parseEurt } from "@/lib/contracts";

interface ProductsManagementProps {
  companyId: bigint;
  provider: ethers.BrowserProvider | null;
  walletAddress: string;
}

interface Product {
  productId: bigint;
  companyId: bigint;
  name: string;
  description: string;
  price: bigint;
  stock: bigint;
  imageHash: string;
  isActive: boolean;
  createdAt: bigint;
}

export default function ProductsManagement({
  companyId,
  provider,
  walletAddress,
}: ProductsManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageHash: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (provider) {
      loadProducts();
    }
  }, [provider, companyId]);

  const loadProducts = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      const contract = getEcommerceContract(provider);
      const productIds = await contract.getCompanyProducts(companyId);
      
      const productsData = await Promise.all(
        productIds.map(async (id: bigint) => {
          const product = await contract.getProduct(id);
          return product;
        })
      );

      setProducts(productsData);
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setSubmitting(true);
    setError("");

    try {
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);
      
      const priceInUnits = parseEurt(formData.price);
      const stock = BigInt(formData.stock);

      const tx = await contract.addProduct(
        companyId,
        formData.name,
        formData.description,
        priceInUnits,
        stock,
        formData.imageHash || "0x"
      );
      
      await tx.wait();
      
      // Limpiar formulario y recargar productos
      setFormData({ name: "", description: "", price: "", stock: "", imageHash: "" });
      setShowAddForm(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Error al agregar producto");
      console.error("Add product error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (productId: bigint, newStock: string) => {
    if (!provider) return;

    try {
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);
      
      const tx = await contract.updateStock(productId, BigInt(newStock));
      await tx.wait();
      
      loadProducts();
    } catch (err: any) {
      console.error("Error updating stock:", err);
      alert("Error al actualizar stock: " + err.message);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Cargando productos...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Productos</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancelar" : "+ Agregar Producto"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Nuevo Producto</h4>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (EUR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Agregando..." : "Agregar Producto"}
            </button>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay productos registrados</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.productId.toString()} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Precio:</span>
                  <span className="font-semibold">{formatEurt(product.price)} EURT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Stock:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={product.stock.toString()}
                      onBlur={(e) => {
                        if (e.target.value !== product.stock.toString()) {
                          handleUpdateStock(product.productId, e.target.value);
                        }
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

