import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, walletAddress } = await request.json();

    // Validar inputs
    if (!amount || amount < 10 || amount > 10000) {
      return NextResponse.json(
        { error: "El monto debe estar entre €10 y €10,000" },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: "La dirección de wallet es requerida" },
        { status: 400 }
      );
    }

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: "eur",
      metadata: {
        walletAddress,
        tokenAmount: amount.toString(), // EURT amount (1:1 con EUR)
      },
      description: `Compra de ${amount} EURT`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la intención de pago" },
      { status: 500 }
    );
  }
}

