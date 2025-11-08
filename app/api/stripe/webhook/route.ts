import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { dispatchMakeOrder } from "@/lib/make";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

function parseDraft(rawDraft?: string | null) {
  if (!rawDraft) return undefined;
  try {
    return JSON.parse(rawDraft) as Record<string, unknown>;
  } catch (error) {
    console.warn("Unable to parse draft metadata", error);
    return undefined;
  }
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    if (!signature) {
      throw new Error("Missing Stripe signature header");
    }
    const stripe = getStripeClient();
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const stripe = getStripeClient();
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadataEntries = Object.entries(paymentIntent.metadata ?? {});
      const metadata: Record<string, string> = Object.fromEntries(
        metadataEntries.map(([key, value]) => [key, value ?? ""]),
      );

      const alreadyNotified = metadata.make_notified === "1";
      const draft = parseDraft(metadata.draft);

      const charges = (
        (paymentIntent as Stripe.PaymentIntent & { charges?: Stripe.ApiList<Stripe.Charge> }).charges?.data ?? []
      ) as Stripe.Charge[];
      const firstCharge = charges[0];
      const billingDetails = firstCharge?.billing_details;

      const email = (metadata.email ?? paymentIntent.receipt_email ?? billingDetails?.email ?? "").trim();
      const customerName = metadata.customer_name ?? paymentIntent.shipping?.name ?? billingDetails?.name ?? null;
      const amount = paymentIntent.amount_received ?? paymentIntent.amount ?? 0;
      const currency = paymentIntent.currency?.toUpperCase() ?? metadata.currency?.toUpperCase() ?? "USD";

      const planSku = metadata.package_code ?? (typeof draft?.packageCode === "string" ? draft.packageCode : undefined);
      const planSlug = metadata.slug ?? (typeof draft?.slug === "string" ? draft.slug : undefined);
      const dataGb = normalizeNumber(draft?.dataGb);
      const periodDays = normalizeNumber(draft?.periodDays);
      const countryCode = metadata.country_code ?? (typeof draft?.countryCode === "string" ? draft.countryCode : undefined);
      const countryName =
        typeof draft?.country === "string"
          ? draft.country
          : metadata.country ?? metadata.country_name ?? null;

      if (!alreadyNotified) {
        await dispatchMakeOrder({
          payment_intent_id: paymentIntent.id,
          email,
          amount,
          currency,
          customer_name: customerName,
          order_id: metadata.order_id ?? null,
          draft,
          plan_sku: planSku,
          plan_slug: planSlug,
          data_gb: dataGb,
          period_days: periodDays,
          country_code: countryCode,
          country_name: countryName ?? null,
        });

        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
            ...metadata,
            make_notified: "1",
          },
        });
      }
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_intent) {
        // In case Checkout is ever used, retrieve the PaymentIntent to ensure Make receives the payload.
        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.retrieve(
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id,
        );
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
            ...(paymentIntent.metadata ?? {}),
            session_completed: "1",
          },
        });
      }
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
