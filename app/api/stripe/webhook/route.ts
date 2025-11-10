import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { issueEsimOrder } from "@/lib/esimAccessServer";
import { sendOrderReadyEmail } from "@/lib/email";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("Stripe webhook secret missing. Skipping processing.");
    return NextResponse.json({ received: true });
  }

  const stripe = getStripeClient();
  const signature = headers().get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Invalid Stripe signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await handlePaymentSucceeded(intent);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const email = (intent.receipt_email ?? intent.metadata?.email ?? "").trim().toLowerCase();
  const countryCode = intent.metadata?.country_code ?? "";
  const packageCode = intent.metadata?.package_code ?? "";
  const amountCents = Number.parseInt(intent.metadata?.amount_cents ?? `${intent.amount}`, 10);
  const currency = (intent.metadata?.currency ?? intent.currency ?? "usd").toUpperCase();

  if (!email || !countryCode || !packageCode) {
    console.warn("Missing metadata for payment intent", intent.id);
    return;
  }

  let supabase: ReturnType<typeof getSupabaseServiceClient> | null = null;
  try {
    supabase = getSupabaseServiceClient();
  } catch (error) {
    console.warn("Supabase service client unavailable", error);
  }

  let userId: string | null = null;

  if (supabase) {
    try {
      const { data: existing } = await supabase.auth.admin.listUsers({ email });
      userId = existing?.users?.[0]?.id ?? null;
      if (!userId) {
        const { data: created, error: createError } = await supabase.auth.admin.createUser({ email, email_confirm: false });
        if (createError) {
          throw createError;
        }
        userId = created.user?.id ?? null;
        if (userId) {
          const fallbackHost = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
          const inviteRedirect = process.env.SUPABASE_INVITE_REDIRECT_URL ??
            (fallbackHost ? `${fallbackHost.replace(/\/$/, "")}/account` : undefined);
          try {
            await supabase.auth.admin.generateLink({
              type: "magiclink",
              email,
              options: inviteRedirect ? { redirectTo: inviteRedirect } : undefined,
            });
          } catch (error) {
            console.error("Failed to generate Supabase invite link", error);
          }
        }
      }
    } catch (error) {
      console.error("Supabase user management failed", error);
    }
  }

  let orderId: string | null = null;
  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "processing",
          country: countryCode,
          package_code: packageCode,
          amount: amountCents,
          currency,
          stripe_payment_intent: intent.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      orderId = data?.id ?? null;
    } catch (error) {
      console.error("Failed to create order record", error);
    }
  }

  try {
    const esim = await issueEsimOrder({
      planSlug: packageCode,
      countryCode,
      email,
      metadata: {
        stripe_payment_intent: intent.id,
      },
    });

    if (supabase && orderId) {
      try {
        await supabase
          .from("orders")
          .update({
            status: "fulfilled",
          })
          .eq("id", orderId);

        await supabase.from("esims").insert({
          order_id: orderId,
          iccid: esim.iccid,
          activation_code: esim.activationCode ?? null,
          qr_url_or_svg: esim.qrCodeUrl,
          status: "active",
          raw: esim as unknown as Record<string, unknown>,
        });
      } catch (error) {
        console.error("Failed to update Supabase order", error);
      }
    }

    await sendOrderReadyEmail({ to: email, iccid: esim.iccid, qrUrl: esim.qrCodeUrl });
  } catch (error) {
    console.error("Provisioning failed", error);
    if (supabase && orderId) {
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);
    }
  }
}
