"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WalletConnect from "@/components/WalletConnect";
import ProductCatalog from "@/components/ProductCatalog";
import ShoppingCart from "@/components/ShoppingCart";
import { useCartCount } from "@/hooks/useCartCount";

export default function Home() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showCart, setShowCart] = useState(false);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);
  const { count: cartCount } = useCartCount(walletAddress, cartUpdateTrigger);

  return (
    <main className="min-h-screen">
      {/* Header con gradiente */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                🛍️ Tienda Online
              </h1>
              <p className="text-lg text-indigo-100">
                Compra productos con EuroToken de forma segura
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <WalletConnect
                onWalletConnected={(address) => setWalletAddress(address)}
                onWalletDisconnected={() => setWalletAddress("")}
              />
              {walletAddress && (
                <>
                  <button
                    onClick={() => router.push("/orders")}
                    className="px-6 py-3 bg-white/90 text-indigo-600 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Historial
                  </button>
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {showCart ? "Ver Tienda" : "Ver Carrito"}
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {showCart && walletAddress ? (
          <div className="animate-fade-in">
            <ShoppingCart
              walletAddress={walletAddress}
              onClose={() => setShowCart(false)}
              refreshTrigger={cartUpdateTrigger}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <ProductCatalog 
              walletAddress={walletAddress}
              onProductAdded={() => {
                // Recargar el carrito cuando se agregue un producto
                setCartUpdateTrigger(prev => prev + 1);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}

