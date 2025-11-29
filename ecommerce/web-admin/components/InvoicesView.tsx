"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getEcommerceContract, formatEurt } from "@/lib/contracts";

interface InvoicesViewProps {
  companyId: bigint;
  provider: ethers.BrowserProvider | null;
  walletAddress: string;
}

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
  status: number; // 0 = Pending, 1 = Paid, 2 = Cancelled
  createdAt: bigint;
  paidAt: bigint;
}

export default function InvoicesView({
  companyId,
  provider,
  walletAddress,
}: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (provider) {
      loadInvoices();
    }
  }, [provider, companyId]);

  const loadInvoices = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      setError("");
      const contract = getEcommerceContract(provider);
      
      // Verificar que la wallet conectada sea el propietario de la empresa
      const company = await contract.getCompany(companyId);
      if (company.owner.toLowerCase() !== walletAddress.toLowerCase()) {
        setError("owner_mismatch");
        return;
      }
      
      const invoiceIds = await contract.getCompanyInvoices(companyId);
      
      const invoicesData = await Promise.all(
        invoiceIds.map(async (id: bigint) => {
          const invoice = await contract.getInvoice(id);
          return invoice;
        })
      );

      setInvoices(invoicesData);
    } catch (err: any) {
      console.error("Error loading invoices:", err);
      
      // Detectar errores específicos
      if (err.reason?.includes("Not company owner") || err.message?.includes("Not company owner")) {
        setError("owner_mismatch");
      } else if (err.code === "CALL_EXCEPTION") {
        setError("contract_error");
      } else {
        setError("unknown");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
      case 1:
        return { label: "Pagada", color: "bg-green-100 text-green-800" };
      case 2:
        return { label: "Cancelada", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Desconocido", color: "bg-gray-100 text-gray-800" };
    }
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("es-ES");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium">Cargando facturas...</p>
      </div>
    );
  }

  if (error) {
    let errorMessage = "";
    let errorIcon = null;
    
    if (error === "owner_mismatch") {
      errorMessage = "La billetera conectada no es el propietario de esta empresa. Por favor, conecta la billetera que registró la empresa.";
      errorIcon = (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else if (error === "contract_error") {
      errorMessage = "Error al comunicarse con el contrato. Verifica que el contrato esté desplegado correctamente.";
      errorIcon = (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      errorMessage = "Error al cargar las facturas. Por favor, intenta nuevamente.";
      errorIcon = (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl p-6 shadow-md animate-fade-in">
        <div className="flex items-start gap-4">
          {errorIcon}
          <div className="flex-1">
            <h4 className="font-bold text-amber-900 mb-2">No se pueden cargar las facturas</h4>
            <p className="text-sm text-amber-800 leading-relaxed">{errorMessage}</p>
            {error === "owner_mismatch" && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700">
                  <strong>💡 Tip:</strong> La empresa fue registrada con una billetera diferente. 
                  Asegúrate de usar la misma billetera que usaste para registrar la empresa.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Facturas
        </h3>
      </div>
      
      {invoices.length === 0 ? (
        <div className="glass rounded-2xl shadow-soft p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No hay facturas registradas</p>
          <p className="text-gray-400 text-sm mt-2">Las facturas aparecerán aquí cuando los clientes realicen compras</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const status = getStatusLabel(invoice.status);
            return (
              <div key={invoice.invoiceId.toString()} className="glass rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-xl text-gray-900">Factura #{invoice.invoiceId.toString()}</h4>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${status.color} border-2 ${
                        invoice.status === 1 ? 'border-green-300' : 
                        invoice.status === 2 ? 'border-red-300' : 'border-yellow-300'
                      }`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Cliente: <span className="font-mono font-semibold">{invoice.customer.slice(0, 10)}...{invoice.customer.slice(-8)}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Creada: <span className="font-semibold">{formatDate(invoice.createdAt)}</span></span>
                      </div>
                      {invoice.status === 1 && (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Pagada: <span className="font-semibold">{formatDate(invoice.paidAt)}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Items
                  </h5>
                  <div className="space-y-3 mb-6">
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">
                          Producto #{item.productId.toString()} × <span className="font-semibold">{item.quantity.toString()}</span>
                        </span>
                        <span className="font-bold text-indigo-600">{formatEurt(item.total)} EURT</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-indigo-200">
                    <span className="font-bold text-lg text-gray-900">Total:</span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatEurt(invoice.totalAmount)} EURT
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

