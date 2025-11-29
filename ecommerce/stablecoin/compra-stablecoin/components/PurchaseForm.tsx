"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ethers } from "ethers";
import { getWalletAddress } from "@/lib/ethers";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PurchaseFormProps {
  walletAddress: string;
  onPurchaseSuccess: () => void;
}

function CheckoutForm({ walletAddress, onPurchaseSuccess }: PurchaseFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const minAmount = 10;
  const maxAmount = 10000;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const amountNum = parseFloat(amount);
      if (amountNum < minAmount || amountNum > maxAmount) {
        setError(`El monto debe estar entre €${minAmount} y €${maxAmount}`);
        setLoading(false);
        return;
      }

      // Crear Payment Intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la intención de pago");
      }

      // Confirmar pago con Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Elemento de tarjeta no encontrado");
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Comprador EuroToken",
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || "Error al procesar el pago");
      }

      if (paymentIntent?.status === "succeeded") {
        // Hacer mint de tokens
        const mintResponse = await fetch("/api/mint-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            walletAddress,
          }),
        });

        const mintData = await mintResponse.json();

        if (!mintResponse.ok) {
          throw new Error(mintData.error || "Error al acuñar tokens");
        }

        setSuccess(true);
        onPurchaseSuccess();
      }
    } catch (err: any) {
      // Ignorar errores de ENS, solo mostrar errores reales
      const isEnsError = err?.code === "UNSUPPORTED_OPERATION" && 
                        (err?.info?.operation?.includes("Ens") || 
                         err?.message?.includes("ENS") ||
                         err?.message?.includes("does not support ENS"));
      
      if (!isEnsError) {
        setError(err.message || "Error al procesar la compra");
        console.error("Purchase error:", err);
      } else {
        // Si es solo error de ENS, continuar sin mostrar error
        console.warn("ENS error (ignored):", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const tokensToReceive = amountNum; // 1:1 conversion

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantidad a Comprar (EUR)
        </label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          min={minAmount}
          max={maxAmount}
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="100"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Mínimo: €{minAmount}, Máximo: €{maxAmount.toLocaleString()}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Tokens a recibir:</span>
          <span className="font-semibold">{tokensToReceive.toFixed(2)} EURT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tasa de cambio:</span>
          <span className="text-sm">1 EUR = 1 EURT</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información de Pago
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">
            ¡Compra exitosa! Los tokens han sido enviados a tu billetera.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !amount || amountNum < minAmount || amountNum > maxAmount}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Procesando..." : `Comprar ${tokensToReceive.toFixed(2)} EURT por €${amountNum.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function PurchaseForm({ walletAddress, onPurchaseSuccess }: PurchaseFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm walletAddress={walletAddress} onPurchaseSuccess={onPurchaseSuccess} />
    </Elements>
  );
}

