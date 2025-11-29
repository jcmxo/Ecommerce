"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ethers } from "ethers";
import { getEcommerceContract, formatEurt } from "@/lib/contracts";

interface InvoiceItem {
  productId: bigint;
  quantity: bigint;
  price: bigint;
  total: bigint;
}

interface Invoice {
  invoiceId: bigint;
  customer: string;
  companyId: bigint;
  items: InvoiceItem[];
  totalAmount: bigint;
  status: number; // 0: Pending, 1: Paid, 2: Cancelled
  createdAt: bigint;
  paidAt: bigint;
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

interface Company {
  companyId: bigint;
  name: string;
  companyAddress: string;
  taxId: string;
  owner: string;
  isActive: boolean;
  createdAt: bigint;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Map<bigint, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (invoiceId) {
      loadOrder();
    }
  }, [invoiceId]);

  const loadOrder = async () => {
    if (!window.ethereum || !invoiceId) {
      setError("MetaMask no está instalado o falta el ID de factura.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const contract = getEcommerceContract(signer);

      // Obtener la factura
      const invoiceData: Invoice = await contract.getInvoice(BigInt(invoiceId));
      
      // Verificar que la factura pertenece al cliente conectado
      if (invoiceData.customer.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Esta factura no pertenece a tu billetera.");
      }

      setInvoice(invoiceData);

      // Obtener información de la empresa
      const companyData: Company = await contract.getCompany(invoiceData.companyId);
      setCompany(companyData);

      // Obtener información de los productos
      const productsMap = new Map<bigint, Product>();
      for (const item of invoiceData.items) {
        try {
          const product: Product = await contract.getProduct(item.productId);
          productsMap.set(item.productId, product);
        } catch (err) {
          console.error(`Error cargando producto ${item.productId}:`, err);
        }
      }
      setProducts(productsMap);
    } catch (err: any) {
      console.error("Error loading order:", err);
      setError("Error al cargar el pedido: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pendiente";
      case 1:
        return "Pagado";
      case 2:
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 1:
        return "bg-green-100 text-green-800 border-green-300";
      case 2:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass rounded-2xl shadow-soft p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Cargando detalles del pedido...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass rounded-2xl shadow-soft p-6 bg-red-50 border-2 border-red-200">
            <p className="text-red-600 mb-4">{error || "No se pudo cargar el pedido."}</p>
            <button
              onClick={() => router.push("/orders")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ← Volver al Historial
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                📄 Detalle de Pedido
              </h1>
              <p className="text-lg text-indigo-100">
                Factura #{invoice.invoiceId.toString()}
              </p>
            </div>
            <button
              onClick={() => router.push("/orders")}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
            >
              ← Volver al Historial
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado y Resumen */}
            <div className="glass rounded-2xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Resumen</h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {getStatusText(invoice.status)}
                </span>
              </div>

              {company && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Empresa</p>
                  <p className="text-lg font-semibold text-gray-900">{company.name}</p>
                  <p className="text-sm text-gray-600 font-mono">{company.companyAddress}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha de Creación</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
                {invoice.status === 1 && invoice.paidAt !== BigInt(0) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha de Pago</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(invoice.paidAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items del Pedido */}
            <div className="glass rounded-2xl shadow-soft p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Items del Pedido</h2>
              <div className="space-y-4">
                {invoice.items.map((item, index) => {
                  const product = products.get(item.productId);
                  return (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product?.name || `Producto #${item.productId.toString()}`}
                          </h3>
                          {product?.description && (
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Cantidad: {item.quantity.toString()} × {formatEurt(item.price)} EURT
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">
                            {formatEurt(item.total)} EURT
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resumen de Pago */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl shadow-soft p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Total</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    {formatEurt(invoice.totalAmount)} EURT
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-2xl">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-indigo-600">
                      {formatEurt(invoice.totalAmount)} EURT
                    </span>
                  </div>
                </div>
                {invoice.status === 0 && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || "http://localhost:6002"}?invoice=${invoice.invoiceId.toString()}`}
                    className="block w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-bold"
                  >
                    Pagar Ahora
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

