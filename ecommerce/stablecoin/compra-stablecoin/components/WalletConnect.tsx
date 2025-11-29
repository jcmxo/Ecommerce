"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { connectWallet, getWalletAddress, formatAddress } from "@/lib/ethers";
import { getEuroTokenContract, formatEurt } from "@/lib/contracts";
import { disableEnsForLocalNetwork, isLocalNetwork } from "@/lib/ens-fix";

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
      // Deshabilitar ENS antes de cargar balance
      if (provider) {
        isLocalNetwork(provider).then((isLocal) => {
          if (isLocal) {
            disableEnsForLocalNetwork(provider);
          }
        });
      }
      
      loadBalance();
      // Notificar al componente padre si la dirección cambió
      if (onWalletConnected) {
        onWalletConnected(address);
      }
      // Listen for account changes
      window.ethereum?.on("accountsChanged", handleAccountsChanged);
      // Listen for chain changes
      window.ethereum?.on("chainChanged", () => window.location.reload());
    }

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", () => window.location.reload());
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
      // Verificar que la dirección es válida (no un nombre ENS)
      if (!ethers.isAddress(address)) {
        console.warn("Invalid address format:", address);
        return;
      }

      // Deshabilitar ENS en el provider antes de crear el contrato
      try {
        const network = await provider.getNetwork();
        if (network.chainId === 31337n) {
          (provider as any).disableEns = true;
        }
      } catch (e) {
        // Ignorar
      }

      // Validar que la dirección del usuario es válida
      if (!ethers.isAddress(address)) {
        return;
      }
      
      const contract = getEuroTokenContract(provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      setBalance(formatEurt(balance, decimals));
    } catch (err: any) {
      // Ignorar errores de ENS silenciosamente
      const isEnsError = err?.code === "UNSUPPORTED_OPERATION" && 
                        (err?.info?.operation?.includes("Ens") || err?.message?.includes("ENS"));
      
      if (!isEnsError) {
        console.error("Error loading balance:", err);
      }
      // Si es error de ENS, simplemente dejar el balance en 0.0
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
      // Validar que la dirección es válida
      if (!ethers.isAddress(newAddress)) {
        throw new Error("Dirección de wallet inválida");
      }
      setProvider(newProvider);
      setAddress(newAddress);
      // Notificar al componente padre
      if (onWalletConnected) {
        onWalletConnected(newAddress);
      }
    } catch (err: any) {
      // Ignorar errores de ENS, mostrar otros errores
      if (err?.code === "UNSUPPORTED_OPERATION" && err?.info?.operation?.includes("Ens")) {
        // Intentar obtener la dirección de otra forma
        try {
          const accounts = await window.ethereum?.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0 && ethers.isAddress(accounts[0])) {
            setAddress(accounts[0]);
            setProvider(newProvider);
            if (onWalletConnected) {
              onWalletConnected(accounts[0]);
            }
            return;
          }
        } catch (fallbackErr) {
          // Continuar con el error original
        }
      }
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
    // Notificar al componente padre
    if (onWalletDisconnected) {
      onWalletDisconnected();
    }
  };

  if (address) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="font-semibold text-green-800">Billetera Conectada</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Balance de EuroToken: <span className="font-semibold">{balance} EURT</span></p>
              <p>Billetera conectada: <span className="font-mono">{formatAddress(address)}</span></p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-gray-700 mb-3">
        Conecta tu billetera MetaMask para comprar EuroTokens
      </p>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Conectando..." : "Conectar MetaMask"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

