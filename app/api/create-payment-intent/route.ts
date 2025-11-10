import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    })
  : null;

interface CreatePaymentIntentBody {
  amountCents?: number;
  currency?: string;
  email?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePaymentIntentBody;
  const amount = body.amountCents;
  const currency = (body.currency ?? "USD").toLowerCase();

  if (!stripe || !stripeSecret) {
    return NextResponse.json(
      { clientSecret: null, error: "Stripe is not configured." },
      { status: 200 },
    );
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: body.email ? { email: body.email } : undefined,
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (error) {
    console.error("Failed to create payment intent", error);
    return NextResponse.json({ error: "Unable to create payment intent" }, { status: 500 });
  }
}
