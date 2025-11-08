import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const email = paymentIntent.receipt_email ?? (paymentIntent.metadata?.email ?? "").toString();
    let draft: Record<string, unknown> = {};

    try {
      draft = paymentIntent.metadata?.draft ? JSON.parse(paymentIntent.metadata.draft) : {};
    } catch (error) {
      console.warn("Unable to parse draft metadata", error);
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (supabaseAdmin && email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      let userId = profile?.id ?? null;

      if (!userId) {
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        const user = existingUser?.user;

        if (user) {
          userId = user.id;
        } else {
          const { data: created } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
          });
          userId = created?.user?.id ?? null;
        }

        if (userId) {
          await supabaseAdmin.from("profiles").upsert({ id: userId, email }, { onConflict: "id" });
        }
      }

      if (userId) {
        await supabaseAdmin.from("orders").insert({
          user_id: userId,
          status: "pending",
          country_code: draft.countryCode ?? draft.country_code ?? null,
          package_code: draft.packageCode ?? draft.package_code ?? null,
          slug: draft.slug ?? null,
          data_gb: draft.dataGb ?? draft.data_gb ?? null,
          period_days: draft.periodDays ?? draft.period_days ?? null,
          wholesale_cents: draft.wholesaleCents ?? draft.wholesale_cents ?? 0,
          markup_pct: draft.markupPct ?? draft.markup_pct ?? Number(process.env.DEFAULT_MARKUP_PCT ?? 35),
          total_cents: draft.totalCents ?? draft.total_cents ?? paymentIntent.amount,
          currency: draft.currency ?? paymentIntent.currency ?? "USD",
          stripe_pi_id: paymentIntent.id,
        });
      }
    } else {
      console.info("Skipping Supabase persistence; admin client not configured.");
    }

    console.info("Payment succeeded for", email, "draft:", draft);
  }

  return NextResponse.json({ received: true });
}
