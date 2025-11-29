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
  const [balanceBefore, setBalanceBefore] = useState<string>("0.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [companyAddress, setCompanyAddress] = useState<string>("");
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<string>(""); // Para mostrar el paso actual
  const [invoiceInfo, setInvoiceInfo] = useState<{
    amount: bigint;
    customer: string;
    companyId: bigint;
  } | null>(null);

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

  // Cargar información de la factura cuando hay invoiceId (sin necesidad de wallet)
  useEffect(() => {
    const loadInvoiceInfo = async () => {
      if (!invoiceId || !ECOMMERCE_ADDRESS) return;

      try {
        // Usar provider básico para leer datos sin wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = getEcommerceContract(provider, ECOMMERCE_ADDRESS);
        const invoiceIdBigInt = BigInt(invoiceId);
        
        const invoice = await contract.getInvoice(invoiceIdBigInt);
        const invoiceStatusValue = Number(invoice.status);
        
        setInvoiceStatus(invoiceStatusValue);
        setInvoiceInfo({
          amount: invoice.totalAmount,
          customer: invoice.customer,
          companyId: invoice.companyId,
        });

        // Obtener información de la empresa
        try {
          const company = await contract.getCompany(invoice.companyId);
          setCompanyAddress(company.companyAddress);
        } catch (companyError) {
          console.error("Error obteniendo empresa:", companyError);
        }
      } catch (err: any) {
        console.error("Error cargando información de factura:", err);
        // Si no se puede cargar, dejar invoiceStatus en null para permitir intentar pago
      }
    };

    if (invoiceId) {
      loadInvoiceInfo();
    }
  }, [invoiceId]);

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

  const handleApprove = async (amountToApprove: bigint) => {
    if (!provider || !address) return false;

    setLoading(true);
    setError("");

    try {
      const signer = await provider.getSigner();
      const tokenContract = getEuroTokenContract(signer, EUROTOKEN_ADDRESS);
      
      console.log("🔐 Aprobando", formatEurt(amountToApprove), "EURT para el contrato Ecommerce");
      const tx = await tokenContract.approve(ECOMMERCE_ADDRESS, amountToApprove);
      console.log("⏳ Esperando confirmación de aprobación...");
      await tx.wait();
      console.log("✅ Aprobación confirmada");

      return true;
    } catch (err: any) {
      console.error("❌ Error al aprobar tokens:", err);
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
      // Obtener información de la factura para verificar el monto correcto
      const signer = await provider.getSigner();
      const ecommerceContract = getEcommerceContract(signer, ECOMMERCE_ADDRESS);
      const invoiceIdBigInt = BigInt(invoiceId);
      
      // Obtener la factura del contrato para obtener el monto exacto y dirección de la empresa
      let invoiceAmount: bigint;
      let invoiceCustomer: string = "";
      let invoiceCompanyId: bigint = BigInt(0);
      let invoiceStatus: number = 0;
      try {
        const invoice = await ecommerceContract.getInvoice(invoiceIdBigInt);
        invoiceAmount = invoice.totalAmount;
        invoiceCustomer = invoice.customer;
        invoiceCompanyId = invoice.companyId;
        invoiceStatus = Number(invoice.status);
        console.log("💰 Monto de la factura:", formatEurt(invoiceAmount));
        console.log("👤 Cliente de la factura:", invoiceCustomer);
        console.log("🏢 ID de empresa:", invoiceCompanyId.toString());
        console.log("📋 Estado de la factura:", invoiceStatus, "(0=Pendiente, 1=Pagada, 2=Cancelada)");
        
        // Verificar si la factura ya está pagada
        if (invoiceStatus === 1) {
          throw new Error(`La factura #${invoiceIdBigInt.toString()} ya está pagada. No puedes pagarla nuevamente.`);
        } else if (invoiceStatus === 2) {
          throw new Error(`La factura #${invoiceIdBigInt.toString()} está cancelada y no se puede pagar.`);
        }
        
        // Verificar que el cliente de la factura coincide con la wallet conectada
        if (invoiceCustomer.toLowerCase() !== address.toLowerCase()) {
          throw new Error(`Esta factura pertenece a otra dirección. Cliente: ${invoiceCustomer}, Tu wallet: ${address}`);
        }
        
        // Obtener dirección de la empresa
        try {
          const company = await ecommerceContract.getCompany(invoiceCompanyId);
          setCompanyAddress(company.companyAddress);
          console.log("🏢 Dirección de la empresa:", company.companyAddress);
          
          // Verificar si cliente y empresa son la misma dirección
          const sameAddress = invoiceCustomer.toLowerCase() === company.companyAddress.toLowerCase();
          setIsSameAddress(sameAddress);
          if (sameAddress) {
            console.log("⚠️ ADVERTENCIA: El cliente y la empresa son la misma dirección. El balance no cambiará porque estás pagándote a ti mismo.");
          }
        } catch (companyError) {
          console.error("Error obteniendo empresa:", companyError);
        }
      } catch (invoiceError: any) {
        console.error("Error obteniendo factura:", invoiceError);
        // Si es un error de factura ya pagada, lanzarlo directamente
        if (invoiceError.message && (invoiceError.message.includes("ya está pagada") || invoiceError.message.includes("cancelada"))) {
          throw invoiceError;
        }
        // Usar el monto de la URL como fallback
        invoiceAmount = parseEurt(amount);
      }
      
      // Verificar y aprobar tokens si es necesario
      const tokenContract = getEuroTokenContract(signer, EUROTOKEN_ADDRESS);
      
      // Guardar balance antes del pago
      try {
        const balanceBeforePayment = await tokenContract.balanceOf(address);
        setBalanceBefore(formatEurt(balanceBeforePayment));
        console.log("💰 Balance antes del pago:", formatEurt(balanceBeforePayment));
      } catch (balanceError) {
        console.error("Error obteniendo balance antes:", balanceError);
      }
      const allowance = await tokenContract.allowance(address, ECOMMERCE_ADDRESS);
      console.log("🔐 Allowance actual:", formatEurt(allowance), "EURT");
      console.log("💰 Monto necesario:", formatEurt(invoiceAmount), "EURT");

      if (allowance < invoiceAmount) {
        console.log("⚠️ Allowance insuficiente. Aprobando tokens...");
        const approved = await handleApprove(invoiceAmount);
        if (!approved) {
          throw new Error("No se pudo aprobar los tokens. Por favor, intenta de nuevo.");
        }
        console.log("✅ Tokens aprobados exitosamente");
      }

      // Procesar pago
      setCurrentStep("Paso 2 de 2: Procesando pago... Por favor, confirma la transacción en MetaMask.");
      console.log("🚀 Procesando pago para factura:", invoiceIdBigInt.toString());
      const tx = await ecommerceContract.processPayment(invoiceIdBigInt);
      console.log("✅ Transacción de pago enviada, hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Pago procesado exitosamente, receipt:", receipt.transactionHash);
      
      // Verificar que la transacción fue exitosa
      if (receipt.status !== 1) {
        throw new Error("La transacción de pago fue revertida.");
      }
      
      // Recargar el balance después del pago para mostrar el nuevo balance
      console.log("🔄 Actualizando balance después del pago...");
      
      // Esperar un poco para que la blockchain se actualice
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loadBalance();
      
      // Mostrar información del cambio de balance
      const balanceAfter = parseFloat(balance);
      const balanceBeforeNum = parseFloat(balanceBefore);
      const balanceChange = balanceAfter - balanceBeforeNum;
      console.log("💰 Balance antes:", balanceBeforeNum, "EURT");
      console.log("💰 Balance después:", balanceAfter, "EURT");
      console.log("💰 Cambio:", balanceChange, "EURT");
      
      if (isSameAddress) {
        console.log("ℹ️ El balance no cambió porque el cliente y la empresa son la misma dirección.");
      }

      setSuccess(true);

      // Redirigir después de 10 segundos para que el usuario vea el éxito
      // Redirigir a la página de detalle de la factura si hay redirectUrl
      if (redirectUrl) {
        // Asegurar que la redirección incluye el ID de la factura
        const redirectWithInvoice = redirectUrl.includes('/order/') 
          ? redirectUrl 
          : `${redirectUrl}/order/${invoiceId}`;
        
        console.log("🔄 Redirigiendo a:", redirectWithInvoice);
        
        setTimeout(() => {
          // Usar replace en lugar de href para evitar que el usuario pueda volver atrás
          window.location.replace(redirectWithInvoice);
        }, 10000);
      } else {
        // Si no hay redirectUrl, redirigir al historial de pedidos
        setTimeout(() => {
          window.location.replace("http://localhost:6004/orders");
        }, 10000);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      
      // Decodificar errores personalizados del contrato
      let errorMessage = err.message || "Error al procesar el pago";
      
      // Intentar decodificar errores personalizados de Solidity
      if (err.data) {
        const errorData = err.data;
        const errorStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
        
        // Verificar selectores de errores conocidos
        if (errorStr.includes("0xa0f603b1") || errorStr.includes("InvoiceAlreadyPaid")) {
          errorMessage = `La factura #${invoiceId} ya está pagada. No puedes pagarla nuevamente.`;
        } else if (errorStr.includes("InsufficientAllowance")) {
          errorMessage = "No tienes suficientes tokens aprobados. Por favor, aprueba más tokens e intenta de nuevo.";
        } else if (errorStr.includes("PaymentFailed")) {
          errorMessage = "El pago falló. Verifica que tengas suficiente balance.";
        } else if (errorStr.includes("InvoiceNotFound")) {
          errorMessage = `La factura #${invoiceId} no existe.`;
        } else if (errorStr.includes("Not invoice customer")) {
          errorMessage = "Esta factura no pertenece a tu wallet. Solo el cliente de la factura puede pagarla.";
        }
      }
      
      // Si es ACTION_REJECTED, el usuario canceló
      if (err.code === "ACTION_REJECTED") {
        errorMessage = "Transacción cancelada por el usuario.";
      }
      
      setError(errorMessage);
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

          {/* Mensaje de estado de factura si ya está pagada o cancelada */}
          {invoiceStatus !== null && invoiceStatus !== 0 && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              invoiceStatus === 1 
                ? "bg-green-50 border-green-300" 
                : "bg-red-50 border-red-300"
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {invoiceStatus === 1 ? "✅" : "❌"}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${
                    invoiceStatus === 1 ? "text-green-800" : "text-red-800"
                  }`}>
                    {invoiceStatus === 1 
                      ? `Factura #${invoiceId} ya está pagada` 
                      : `Factura #${invoiceId} está cancelada`}
                  </h3>
                  <p className={`text-sm ${
                    invoiceStatus === 1 ? "text-green-700" : "text-red-700"
                  }`}>
                    {invoiceStatus === 1
                      ? "Esta factura ya ha sido pagada exitosamente. No necesitas pagarla nuevamente."
                      : "Esta factura está cancelada y no se puede pagar."}
                  </p>
                  {redirectUrl && (
                    <a
                      href={redirectUrl.includes('/order/') 
                        ? redirectUrl 
                        : `${redirectUrl}/order/${invoiceId}`}
                      className="inline-block mt-3 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium border border-indigo-200"
                    >
                      Ver Detalles de la Factura →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

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
              {(merchantAddress || companyAddress) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Comerciante:</span>
                  <span className="font-mono text-xs">{formatAddress(companyAddress || merchantAddress)}</span>
                  {isSameAddress && address && (
                    <span className="ml-2 text-xs text-yellow-600">(misma wallet)</span>
                  )}
                </div>
              )}
              {isSameAddress && address && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  ⚠️ Estás pagando a tu propia wallet. El balance no cambiará porque estás transfiriendo tokens a ti mismo.
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
          {/* Mostrar botón si la factura está pendiente (status 0) o si aún no se ha verificado el estado (null) */}
          {address && hasEnoughBalance && (invoiceStatus === null || invoiceStatus === 0) && (
            <button
              onClick={handlePayment}
              disabled={loading || success || (invoiceStatus === null && loading)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Procesando..." : success ? "¡Pago Exitoso!" : `Pagar €${amountInEurt.toFixed(2)}`}
            </button>
          )}
          
          {/* Deshabilitar botón si la factura ya está pagada o cancelada */}
          {invoiceStatus !== null && invoiceStatus !== 0 && (
            <button
              disabled
              className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed transition-colors"
            >
              {invoiceStatus === 1 ? "Factura ya Pagada" : "Factura Cancelada"}
            </button>
          )}
          
          {/* Mensaje si no hay suficiente balance */}
          {address && !hasEnoughBalance && invoiceStatus !== null && invoiceStatus === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Saldo insuficiente para pagar esta factura.
              </p>
            </div>
          )}

          {/* Mensajes de Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Mensaje de Éxito */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800 mb-2">
                ✅ ¡Pago procesado exitosamente!
              </p>
              {balanceBefore && (
                <div className="text-xs text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Balance antes:</span>
                    <span className="font-mono">{balanceBefore} EURT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance después:</span>
                    <span className="font-mono">{balance} EURT</span>
                  </div>
                  {isSameAddress && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                      ℹ️ El balance no cambió porque estás pagando a tu propia wallet (cliente = empresa).
                    </div>
                  )}
                </div>
              )}
              {redirectUrl && (
                <p className="text-xs text-gray-600 mt-2">Redirigiendo en 10 segundos...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

