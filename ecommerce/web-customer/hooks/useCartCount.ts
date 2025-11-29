"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getEcommerceContract } from "@/lib/contracts";

export function useCartCount(walletAddress: string, refreshTrigger?: number) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress || !window.ethereum) {
      setCount(0);
      return;
    }

    const loadCartCount = async () => {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = getEcommerceContract(signer);

        // Intentar obtener el carrito
        try {
          const cart = await contract.getCart();
          // Contar la cantidad total de items (sumando las cantidades)
          const totalItems = cart.items?.reduce((sum: bigint, item: any) => {
            return sum + item.quantity;
          }, BigInt(0)) || BigInt(0);
          setCount(Number(totalItems));
        } catch (err: any) {
          // Si el carrito no existe, el contador es 0
          if (err.code === "CALL_EXCEPTION") {
            const errorData = err.data || err.message || "";
            const errorStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            if (errorStr.includes("CartNotFound") || errorStr.includes("0xa9965755")) {
              setCount(0);
            } else {
              setCount(0); // Por defecto, 0 si hay error
            }
          } else {
            setCount(0);
          }
        }
      } catch (err) {
        console.error("Error loading cart count:", err);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadCartCount();
  }, [walletAddress, refreshTrigger]);

  return { count, loading };
}

