import { NextResponse } from "next/server";

import type { EsimPlanVariant } from "@/lib/esimAccess";
import { issueEsimOrder } from "@/lib/esimAccessServer";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

interface OrderRequestBody {
  email?: string;
  amountCents?: number;
  currency?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  plan?: Pick<
    EsimPlanVariant,
    "slug" | "dataLabel" | "periodDays" | "retailCents" | "currency" | "wholesaleCents" | "markupPct" | "notes" | "dataGb" | "title" | "category"
  >;
  country?: {
    code: string;
    name: string;
    flagEmoji?: string;
  };
  metadata?: Record<string, string>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as OrderRequestBody;

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!body.plan?.slug || !body.country?.code) {
    return NextResponse.json({ error: "Plan and country are required" }, { status: 400 });
  }

  try {
    const esimOrder = await issueEsimOrder({
      planSlug: body.plan.slug,
      countryCode: body.country.code,
      email: body.email,
      metadata: {
        plan_title: body.plan.title,
        plan_data_label: body.plan.dataLabel,
        payment_intent: body.paymentIntentId ?? "",
        ...(body.metadata ?? {}),
      },
    });

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("orders").insert({
          email: body.email,
          payment_intent_id: body.paymentIntentId,
          amount_cents: body.amountCents,
          currency: body.currency,
          plan_slug: body.plan.slug,
          plan_title: body.plan.title,
          country_code: body.country.code,
          country_name: body.country.name,
          iccid: esimOrder.iccid,
          qr_code_url: esimOrder.qrCodeUrl,
          activation_code: esimOrder.activationCode,
          metadata: body.metadata ?? {},
        });
      } catch (dbError) {
        console.warn("Failed to store order in Supabase", dbError);
      }
    }

    return NextResponse.json(esimOrder);
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json({ error: "Unable to create order" }, { status: 502 });
  }
}
