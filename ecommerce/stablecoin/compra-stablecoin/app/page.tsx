"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import PurchaseForm from "@/components/PurchaseForm";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handlePurchaseSuccess = () => {
    // Forzar actualización del balance
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compra EuroToken
          </h1>
          <p className="text-lg text-gray-600">
            Compra EuroToken (EURT) utilizando tu tarjeta de crédito y recibelos directamente en tu billetera MetaMask
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              EuroToken (EURT)
            </h2>
            <p className="text-gray-600">
              Stablecoin respaldada 1:1 con EUR. Perfecta para transacciones estables en el ecosistema DeFi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Detalles de la Compra */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Detalles de la Compra
              </h3>
              {walletAddress ? (
                <PurchaseForm
                  key={refreshKey}
                  walletAddress={walletAddress}
                  onPurchaseSuccess={handlePurchaseSuccess}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Conecta tu billetera para continuar</p>
                </div>
              )}
            </div>

            {/* Columna Derecha: Información de Pago */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Información de Pago
              </h3>
              <WalletConnect 
                key={refreshKey}
                onWalletConnected={handleWalletConnect}
                onWalletDisconnected={() => setWalletAddress("")}
              />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Tu pago está protegido por Stripe. Al completar esta transacción, aceptas recibir los tokens EURT en tu billetera conectada.
          </p>
        </div>
      </div>
    </main>
  );
}

