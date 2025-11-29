import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import Stripe from "stripe";
import { parseEurt } from "@/lib/contracts";

// ABI completo para el backend (incluye función mint)
const EUROTOKEN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() pure returns (uint8)",
] as const;

const EUROTOKEN_ADDRESS = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS || "";

function getEuroTokenContract(signerOrProvider: ethers.Provider | ethers.Signer) {
  if (!EUROTOKEN_ADDRESS) {
    throw new Error("EUROTOKEN_CONTRACT_ADDRESS no está configurado");
  }
  return new ethers.Contract(EUROTOKEN_ADDRESS, EUROTOKEN_ABI, signerOrProvider);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, walletAddress } = await request.json();

    if (!paymentIntentId || !walletAddress) {
      return NextResponse.json(
        { error: "paymentIntentId y walletAddress son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el pago fue exitoso en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `El pago no fue exitoso. Estado: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Verificar que el walletAddress coincide
    if (paymentIntent.metadata.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: "La dirección de wallet no coincide con el pago" },
        { status: 400 }
      );
    }

    // Verificar que no se haya hecho mint antes
    if (paymentIntent.metadata.minted === "true") {
      return NextResponse.json(
        { error: "Los tokens ya han sido acuñados para este pago" },
        { status: 400 }
      );
    }

    // Obtener la cantidad de tokens a acuñar
    const tokenAmount = parseFloat(paymentIntent.metadata.tokenAmount || "0");

    if (tokenAmount === 0) {
      return NextResponse.json(
        { error: "Cantidad de tokens inválida" },
        { status: 400 }
      );
    }

    // Conectar al provider y hacer mint
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = getEuroTokenContract(wallet);

    // Convertir cantidad a unidades con decimales
    const amountInUnits = parseEurt(tokenAmount.toString());

    // Hacer mint de tokens
    const tx = await contract.mint(walletAddress, amountInUnits);
    await tx.wait();

    // Marcar como minted en Stripe
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        minted: "true",
        mintTxHash: tx.hash,
      },
    });

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      amount: tokenAmount,
    });
  } catch (error: any) {
    console.error("Error minting tokens:", error);
    return NextResponse.json(
      { error: error.message || "Error al acuñar tokens" },
      { status: 500 }
    );
  }
}

