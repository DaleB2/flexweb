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
}
