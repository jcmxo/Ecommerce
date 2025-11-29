"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import CompanyDashboard from "@/components/CompanyDashboard";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");

  return (
    <main className="min-h-screen">
      {/* Header con gradiente */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Panel de Administración
            </h1>
            <p className="text-lg text-indigo-100 max-w-2xl">
              Gestiona tu empresa, productos, facturas y clientes de forma fácil y segura con tecnología blockchain
            </p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        {/* Card de conexión de wallet */}
        <div className="mb-8 animate-slide-in">
          <div className="glass rounded-2xl shadow-soft p-6">
            <WalletConnect
              onWalletConnected={(address) => setWalletAddress(address)}
              onWalletDisconnected={() => setWalletAddress("")}
            />
          </div>
        </div>

        {/* Contenido dinámico */}
        {walletAddress ? (
          <div className="animate-fade-in">
            <CompanyDashboard walletAddress={walletAddress} />
          </div>
        ) : (
          <div className="glass rounded-2xl shadow-soft p-12 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg 
                  className="w-24 h-24 mx-auto text-indigo-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Bienvenido al Panel de Administración
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Conecta tu billetera MetaMask para comenzar a gestionar tu empresa, productos, facturas y clientes de forma segura.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

