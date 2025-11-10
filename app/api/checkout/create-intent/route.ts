import { NextResponse } from "next/server";

import { loadEsimPlans } from "@/lib/esimAccessServer";
import { getStripeClient } from "@/lib/stripe";

interface CreateIntentBody {
  email?: string;
  country?: string;
  packageId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateIntentBody;
  const email = body.email?.trim().toLowerCase();
  const country = body.country?.trim().toUpperCase();
  const packageId = body.packageId?.trim();

  if (!email || !country || !packageId) {
    return NextResponse.json({ error: "Missing email, country, or packageId", clientSecret: null, paymentIntentId: null }, { status: 400 });
  }

  try {
    const plans = await loadEsimPlans(country);
    const match = plans.find((plan) => plan.slug.toLowerCase() === packageId.toLowerCase());

    if (!match) {
      return NextResponse.json({ error: "Package not found", clientSecret: null, paymentIntentId: null }, { status: 404 });
    }

    const baseResponse = {
      amount: match.retailCents,
      currency: match.currency,
      package: {
        id: match.slug,
        name: match.title,
      },
    };

    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json({ ...baseResponse, clientSecret: null, paymentIntentId: null, disabled: true });
    }

    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.create({
      amount: match.retailCents,
      currency: match.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        package_code: match.slug,
        country_code: country,
        amount_cents: match.retailCents.toString(),
        currency: match.currency,
        email,
      },
    });

    return NextResponse.json({
      ...baseResponse,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (error) {
    console.error("Failed to create payment intent", error);
    return NextResponse.json({ error: "Unable to create payment intent", clientSecret: null, paymentIntentId: null }, { status: 500 });
  }
}
