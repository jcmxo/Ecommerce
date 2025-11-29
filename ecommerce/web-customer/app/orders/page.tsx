"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { getEcommerceContract, formatEurt } from "@/lib/contracts";

interface Invoice {
  invoiceId: bigint;
  customer: string;
  companyId: bigint;
  items: Array<{
    productId: bigint;
    quantity: bigint;
    price: bigint;
    total: bigint;
  }>;
  totalAmount: bigint;
  status: number; // 0: Pending, 1: Paid, 2: Cancelled
  createdAt: bigint;
  paidAt: bigint;
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

export default function OrdersPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Map<bigint, Company>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWallet = async () => {
      if (!window.ethereum) {
        setError("MetaMask no está instalado. Por favor, instálalo para ver tus pedidos.");
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        await loadInvoices(address);
      } catch (err: any) {
        console.error("Error loading wallet:", err);
        setError("Error al conectar la billetera. Asegúrate de que MetaMask esté conectado.");
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  const loadInvoices = async (address: string) => {
    if (!window.ethereum) return;

    try {
      setLoading(true);
      setError("");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);

      // Obtener IDs de facturas del cliente
      const invoiceIds: bigint[] = await contract.getCustomerInvoices();
      console.log("📋 Facturas encontradas:", invoiceIds.length);

      if (invoiceIds.length === 0) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      // Obtener detalles de cada factura
      const invoicesData: Invoice[] = [];
      const companyIds = new Set<bigint>();

      for (const id of invoiceIds) {
        try {
          const invoice = await contract.getInvoice(id);
          invoicesData.push(invoice);
          companyIds.add(invoice.companyId);
        } catch (err) {
          console.error(`Error cargando factura ${id}:`, err);
        }
      }

      // Ordenar facturas por fecha (más recientes primero)
      invoicesData.sort((a, b) => {
        if (b.createdAt > a.createdAt) return 1;
        if (b.createdAt < a.createdAt) return -1;
        return 0;
      });

      setInvoices(invoicesData);

      // Cargar información de empresas
      const companiesMap = new Map<bigint, Company>();
      for (const companyId of companyIds) {
        try {
          const company = await contract.getCompany(companyId);
          companiesMap.set(companyId, company);
        } catch (err) {
          console.error(`Error cargando empresa ${companyId}:`, err);
        }
      }
      setCompanies(companiesMap);
    } catch (err: any) {
      console.error("Error loading invoices:", err);
      setError("Error al cargar las facturas: " + (err.message || "Error desconocido"));
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

  if (!walletAddress) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass rounded-2xl shadow-soft p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Historial de Pedidos</h1>
            <p className="text-gray-600">Conecta tu billetera MetaMask para ver tus pedidos.</p>
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
                📦 Historial de Pedidos
              </h1>
              <p className="text-lg text-indigo-100">
                Todas tus compras y facturas
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold"
            >
              ← Volver a la Tienda
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="glass rounded-2xl shadow-soft p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Cargando tus pedidos...</p>
          </div>
        ) : error ? (
          <div className="glass rounded-2xl shadow-soft p-6 bg-red-50 border-2 border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="glass rounded-2xl shadow-soft p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600 mb-6">
              Cuando realices una compra, aparecerá aquí.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold"
            >
              Ir a Comprar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {invoices.map((invoice) => {
              const company = companies.get(invoice.companyId);
              return (
                <div
                  key={invoice.invoiceId.toString()}
                  className="glass rounded-2xl shadow-soft p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/order/${invoice.invoiceId.toString()}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          Factura #{invoice.invoiceId.toString()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                      {company && (
                        <p className="text-gray-600 mb-2">
                          <span className="font-semibold">Empresa:</span> {company.name}
                        </p>
                      )}
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Items:</span> {invoice.items.length} producto(s)
                      </p>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Creada:</span> {formatDate(invoice.createdAt)}
                      </p>
                      {invoice.status === 1 && invoice.paidAt !== BigInt(0) && (
                        <p className="text-gray-600">
                          <span className="font-semibold">Pagada:</span> {formatDate(invoice.paidAt)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-600 mb-2">
                        {formatEurt(invoice.totalAmount)} EURT
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/order/${invoice.invoiceId.toString()}`);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                      >
                        Ver Detalles →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

