import { NextResponse } from "next/server";

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
