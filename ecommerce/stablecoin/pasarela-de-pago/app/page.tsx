"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSearchParams } from "next/navigation";
import { connectWallet, getWalletAddress, formatAddress } from "@/lib/ethers";
import { getEuroTokenContract, getEcommerceContract, formatEurt, parseEurt } from "@/lib/contracts";

const EUROTOKEN_ADDRESS = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS || "";
const ECOMMERCE_ADDRESS = process.env.NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS || "";
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";

export default function PaymentGateway() {
  const searchParams = useSearchParams();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // Parámetros de la URL
  const merchantAddress = searchParams.get("merchant_address") || "";
  const amount = searchParams.get("amount") || "0";
  const invoiceId = searchParams.get("invoice") || "";
  const date = searchParams.get("date") || "";
  const redirectUrl = searchParams.get("redirect") || "";

  const amountInEurt = parseFloat(amount);

  useEffect(() => {
    if (provider && address) {
      loadBalance();
    }
  }, [provider, address]);

  const loadBalance = async () => {
    if (!provider || !address || !EUROTOKEN_ADDRESS) return;

    try {
      const contract = getEuroTokenContract(provider, EUROTOKEN_ADDRESS);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      setBalance(formatEurt(balance, decimals));
    } catch (err) {
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
      setProvider(newProvider);
      setAddress(newAddress);
    } catch (err: any) {
      setError(err.message || "Error al conectar wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!provider || !address || !invoiceId) return;

    setLoading(true);
    setError("");

    try {
      const signer = await provider.getSigner();
      const tokenContract = getEuroTokenContract(signer, EUROTOKEN_ADDRESS);
      
      const amountInUnits = parseEurt(amount);
      
      const tx = await tokenContract.approve(ECOMMERCE_ADDRESS, amountInUnits);
      await tx.wait();

      return true;
    } catch (err: any) {
      setError(err.message || "Error al aprobar tokens");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!provider || !address || !invoiceId) {
      setError("Faltan datos para procesar el pago");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Primero aprobar tokens si es necesario
      const signer = await provider.getSigner();
      const tokenContract = getEuroTokenContract(signer, EUROTOKEN_ADDRESS);
      const allowance = await tokenContract.allowance(address, ECOMMERCE_ADDRESS);
      const amountInUnits = parseEurt(amount);

      if (allowance < amountInUnits) {
        const approved = await handleApprove();
        if (!approved) return;
      }

      // Procesar pago
      const ecommerceContract = getEcommerceContract(signer, ECOMMERCE_ADDRESS);
      const tx = await ecommerceContract.processPayment(invoiceId);
      await tx.wait();

      setSuccess(true);

      // Redirigir después de 2 segundos
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar el pago");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughBalance = parseFloat(balance) >= amountInEurt;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pasarela de Pago</h1>

          {/* Detalles del Pago */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Detalles del Pago</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-semibold">€{amountInEurt.toFixed(2)}</span>
              </div>
              {invoiceId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Factura:</span>
                  <span className="font-mono text-xs">{invoiceId}</span>
                </div>
              )}
              {date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span>{date}</span>
                </div>
              )}
              {merchantAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Comerciante:</span>
                  <span className="font-mono text-xs">{formatAddress(merchantAddress)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conexión de Wallet */}
          {!address ? (
            <div className="mb-6">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Conectando..." : "Conectar MetaMask"}
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-semibold text-green-800">Billetera Conectada</span>
                </div>
                <span className="font-mono text-sm">{formatAddress(address)}</span>
              </div>
              <div className="text-sm text-gray-600">
                Balance: <span className="font-semibold">{balance} EURT</span>
              </div>
            </div>
          )}

          {/* Verificación de Balance */}
          {address && !hasEnoughBalance && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Saldo insuficiente. Necesitas {amountInEurt.toFixed(2)} EURT pero tienes {parseFloat(balance).toFixed(2)} EURT.
              </p>
              <a
                href="/compra-stablecoin"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Comprar EuroTokens →
              </a>
            </div>
          )}

          {/* Botón de Pago */}
          {address && hasEnoughBalance && (
            <button
              onClick={handlePayment}
              disabled={loading || success}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Procesando..." : success ? "¡Pago Exitoso!" : `Pagar €${amountInEurt.toFixed(2)}`}
            </button>
          )}

          {/* Mensajes de Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Mensaje de Éxito */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                ¡Pago procesado exitosamente! {redirectUrl && "Redirigiendo..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

