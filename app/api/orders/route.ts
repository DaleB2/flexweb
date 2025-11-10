import { NextResponse } from "next/server";

import { createOrder, type EsimPlanVariant } from "@/lib/esimAccess";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

interface OrderRequestBody {
  email?: string;
  amountCents?: number;
  currency?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  plan?: Pick<EsimPlanVariant, "slug" | "dataLabel" | "periodDays" | "retailCents" | "currency" | "wholesaleCents" | "markupPct" | "notes" | "dataGb" | "title" | "category">;
  country?: {
    code: string;
    name: string;
    flagEmoji?: string;
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as OrderRequestBody;

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const esimOrder = await createOrder({
      planSlug: body.plan?.slug ?? "unknown-plan",
      countryCode: body.country?.code ?? "",
      email: body.email,
      paymentIntentId: body.paymentIntentId ?? "",
      clientSecret: body.clientSecret ?? "",
    });

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("orders").insert({
          email: body.email,
          payment_intent_id: body.paymentIntentId,
          amount_cents: body.amountCents,
          currency: body.currency,
          plan_slug: body.plan?.slug,
          country_code: body.country?.code,
          iccid: esimOrder.iccid,
        });
      } catch (dbError) {
        console.warn("Failed to store order in Supabase", dbError);
      }
    }

    return NextResponse.json(esimOrder);
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }
import { createOrder } from "@/lib/esimAccess";
import { getSupabaseServiceClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, packageCode, countryCode, planSlug, amountCents, currency } = body ?? {};

  if (!email || !packageCode || !countryCode || !planSlug || !amountCents || !currency) {
    return NextResponse.json({ error: "Missing order payload" }, { status: 400 });
  }

  let userId: string | undefined;

  try {
    const supabase = getSupabaseServiceClient();
    const { data: users } = await supabase.auth.admin.listUsers({ email });
    const existing = users?.users?.[0];

    if (existing) {
      userId = existing.id;
    } else {
      const { data: created } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      userId = created.user?.id ?? undefined;
    }
  } catch (error) {
    console.warn("Unable to sync user with Supabase", error);
  }

  const order = await createOrder({
    packageCode,
    email,
    countryCode,
    planSlug,
    amountCents,
    currency,
    userId,
  });

  try {
    const supabase = getSupabaseServiceClient();
    await supabase.from("orders").insert({
      user_id: userId ?? null,
      email,
      country_code: countryCode,
      plan_slug: planSlug,
      amount_cents: amountCents,
      currency,
      external_order_id: order.id,
      iccid: order.iccid,
    });
  } catch (error) {
    console.warn("Unable to persist order to Supabase", error);
  }

  return NextResponse.json(order);
}
