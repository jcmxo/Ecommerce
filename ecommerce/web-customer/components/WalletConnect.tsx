"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { connectWallet, getWalletAddress, formatAddress } from "@/lib/ethers";
import { getEuroTokenContract, formatEurt } from "@/lib/contracts";

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
  onWalletDisconnected?: () => void;
}

export default function WalletConnect({ onWalletConnected, onWalletDisconnected }: WalletConnectProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (provider && address) {
      loadBalance();
      if (onWalletConnected) {
        onWalletConnected(address);
      }
      // Event listeners para cambios en MetaMask
      if (window.ethereum) {
        (window.ethereum as any).on?.("accountsChanged", handleAccountsChanged);
        (window.ethereum as any).on?.("chainChanged", () => window.location.reload());
      }
    }

    return () => {
      // Cleanup de listeners
      if (window.ethereum) {
        (window.ethereum as any).removeListener?.("accountsChanged", handleAccountsChanged);
        (window.ethereum as any).removeListener?.("chainChanged", () => window.location.reload());
      }
    };
  }, [provider, address, onWalletConnected]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAddress(accounts[0]);
    }
  };

  const loadBalance = async () => {
    if (!provider || !address) return;

    try {
      if (!ethers.isAddress(address)) return;
      
      const contract = getEuroTokenContract(provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      setBalance(formatEurt(balance, decimals));
    } catch (err: any) {
      console.error("Error loading balance:", err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const newProvider = await connectWallet();
      if (!newProvider) {
        throw new Error("No se pudo conectar a MetaMask");
      }

      const newAddress = await getWalletAddress(newProvider);
      if (!ethers.isAddress(newAddress)) {
        throw new Error("Dirección de wallet inválida");
      }
      
      setProvider(newProvider);
      setAddress(newAddress);
      if (onWalletConnected) {
        onWalletConnected(newAddress);
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar wallet");
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setAddress("");
    setBalance("0.0");
    if (onWalletDisconnected) {
      onWalletDisconnected();
    }
  };

  if (address) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="absolute top-0 left-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-green-800 text-sm truncate">{formatAddress(address)}</p>
            <p className="text-xs text-gray-600 font-semibold">{balance} EURT</p>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold text-xs"
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-bold flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Conectando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Conectar MetaMask
          </>
        )}
      </button>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg animate-fade-in">
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

