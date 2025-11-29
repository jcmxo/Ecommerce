"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { connectWallet, getWalletAddress } from "@/lib/ethers";
import { getEcommerceContract } from "@/lib/contracts";
import CompanyRegistration from "./CompanyRegistration";
import ProductsManagement from "./ProductsManagement";
import InvoicesView from "./InvoicesView";

interface CompanyDashboardProps {
  walletAddress: string;
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

export default function CompanyDashboard({ walletAddress }: CompanyDashboardProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "invoices">("products");

  useEffect(() => {
    loadProvider();
  }, []);

  useEffect(() => {
    if (provider && walletAddress) {
      loadCompany();
    }
  }, [provider, walletAddress]);

  const loadProvider = async () => {
    try {
      if (!window.ethereum) return;
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    } catch (err) {
      console.error("Error loading provider:", err);
    }
  };

  const loadCompany = async () => {
    if (!provider || !walletAddress) return;

    try {
      setLoading(true);
      const contract = getEcommerceContract(provider);
      
      // Intentar obtener el ID de la empresa
      // Si no existe, devolverá 0
      let companyId;
      try {
        companyId = await contract.getCompanyIdByAddress(walletAddress);
      } catch (err: any) {
        // Si la llamada falla (contrato no desplegado o dirección incorrecta)
        console.warn("No se pudo obtener companyId (posible contrato no desplegado):", err.message);
        setCompany(null);
        setLoading(false);
        return;
      }
      
      if (companyId && companyId > BigInt(0)) {
        // La empresa existe, obtener sus datos
        try {
          const companyData = await contract.getCompany(companyId);
          setCompany({
            companyId: companyData.companyId,
            name: companyData.name,
            companyAddress: companyData.companyAddress,
            taxId: companyData.taxId,
            owner: companyData.owner,
            isActive: companyData.isActive,
            createdAt: companyData.createdAt,
          });
        } catch (err: any) {
          console.error("Error loading company data:", err);
          setCompany(null);
        }
      } else {
        // La empresa no existe (companyId es 0)
        setCompany(null);
      }
    } catch (err: any) {
      // Error general al cargar empresa
      console.error("Error loading company:", err);
      // Si el error es porque el contrato no está desplegado, mostrar mensaje útil
      if (err.code === "CALL_EXCEPTION" || err.message?.includes("revert")) {
        console.warn("El contrato Ecommerce no está desplegado o la dirección es incorrecta");
      }
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyRegistered = () => {
    loadCompany();
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl shadow-soft p-12 text-center animate-fade-in">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Cargando información de la empresa...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl p-6 shadow-md">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-amber-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                <strong>Nota:</strong> Si ves errores en la consola, asegúrate de que el contrato Ecommerce esté desplegado.
                La aplicación funcionará correctamente una vez que registres tu primera empresa.
              </p>
            </div>
          </div>
        </div>
        <CompanyRegistration
          walletAddress={walletAddress}
          provider={provider}
          onRegistered={handleCompanyRegistered}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Información de la Empresa */}
      <div className="glass rounded-2xl shadow-soft p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mi Empresa
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nombre</p>
            <p className="text-xl font-bold text-gray-900">{company.name}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ID de Empresa</p>
            <p className="text-xl font-bold text-indigo-600">#{company.companyId.toString()}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">NIT/Tax ID</p>
            <p className="text-xl font-bold text-gray-900 font-mono">{company.taxId}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado</p>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
              company.isActive 
                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300" 
                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300"
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                company.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}></span>
              {company.isActive ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="glass rounded-2xl shadow-soft overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-8 py-5 text-sm font-bold border-b-3 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "products"
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-8 py-5 text-sm font-bold border-b-3 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "invoices"
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Facturas
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === "products" && (
            <ProductsManagement
              companyId={company.companyId}
              provider={provider}
              walletAddress={walletAddress}
            />
          )}
          {activeTab === "invoices" && (
            <InvoicesView
              companyId={company.companyId}
              provider={provider}
              walletAddress={walletAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
}

