"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getEcommerceContract } from "@/lib/contracts";

interface CompanyRegistrationProps {
  walletAddress: string;
  provider: ethers.BrowserProvider | null;
  onRegistered: () => void;
}

export default function CompanyRegistration({
  walletAddress,
  provider,
  onRegistered,
}: CompanyRegistrationProps) {
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) {
      setError("Provider no disponible");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);

      // Usar la dirección ingresada o la wallet conectada por defecto
      const addressToUse = companyAddress.trim() || walletAddress;
      
      // Validar que la dirección sea válida
      if (!ethers.isAddress(addressToUse)) {
        throw new Error("La dirección de la empresa no es válida");
      }

      const tx = await contract.registerCompany(name, addressToUse, taxId);
      await tx.wait();

      setSuccess(true);
      setTimeout(() => {
        onRegistered();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al registrar la empresa");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-4">
          <div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Empresa Registrada Exitosamente!</h3>
        <p className="text-gray-600">Redirigiendo al panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nueva Empresa</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mi Empresa S.A."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIT / Tax ID *
          </label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123456789-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección de la Empresa (donde recibirás los pagos) *
          </label>
          <input
            type="text"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder={walletAddress}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 <strong>Consejo:</strong> Deja vacío para usar tu wallet actual ({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}), 
            o ingresa una dirección diferente para recibir los pagos. Si usas la misma wallet, el balance no cambiará cuando compres tus propios productos.
          </p>
          {companyAddress && companyAddress.trim() !== walletAddress && ethers.isAddress(companyAddress.trim()) && (
            <p className="text-xs text-blue-600 mt-2">
              ✅ Usarás una dirección diferente para recibir pagos. Esto permitirá que el balance cambie correctamente.
            </p>
          )}
          {companyAddress && !ethers.isAddress(companyAddress.trim()) && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ La dirección ingresada no es válida. Por favor, verifica que sea una dirección de Ethereum válida.
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name || !taxId}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Registrando..." : "Registrar Empresa"}
        </button>
      </form>
    </div>
  );
}

