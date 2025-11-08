import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { dispatchMakeOrder } from "@/lib/make";

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
    const makeAlreadyNotified = paymentIntent.metadata?.make_notified === "1";
    let userId: string | null = null;
    let orderId: string | null = null;

    if (supabaseAdmin && email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      userId = profile?.id ?? null;

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
        const { data: existingOrder } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("stripe_pi_id", paymentIntent.id)
          .maybeSingle();

        orderId = existingOrder?.id ?? null;

        if (!orderId) {
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from("orders")
            .insert({
              user_id: userId,
              status: "paid",
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
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Failed to persist order", insertError);
          }

          orderId = inserted?.id ?? orderId;
        }
      }
    } else {
      console.info("Skipping Supabase persistence; admin client not configured.");
    }

    console.info("Payment succeeded for", email, "draft:", draft);

    if (!makeAlreadyNotified) {
      try {
        await dispatchMakeOrder({
          payment_intent_id: paymentIntent.id,
          email,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency ?? "usd",
          customer_name: paymentIntent.shipping?.name ?? paymentIntent.metadata?.customer_name ?? null,
          order_id: orderId,
          draft,
        });

        const metadataUpdate = Object.entries(paymentIntent.metadata ?? {}).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (value !== null && value !== undefined && key !== "make_notified") {
              acc[key] = String(value);
            }
            return acc;
          },
          {},
        );

        metadataUpdate.make_notified = "1";

        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: metadataUpdate,
        });

        if (supabaseAdmin && orderId) {
          await supabaseAdmin
            .from("orders")
            .update({ status: "processing" })
            .eq("id", orderId);
        }
      } catch (error) {
        console.error("Failed to notify Make webhook", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
