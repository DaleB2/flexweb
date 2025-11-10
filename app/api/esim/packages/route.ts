import { NextResponse } from "next/server";

import { loadEsimPlans } from "@/lib/esimAccessServer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country");

  if (!countryCode) {
    return NextResponse.json({ error: "country is required", packages: [] }, { status: 400 });
  }

  try {
    const plans = await loadEsimPlans(countryCode.toUpperCase());
    const packages = plans.map((plan) => ({
      id: plan.slug,
      planCode: plan.slug,
      name: plan.title,
      dataLabel: plan.dataLabel,
      days: plan.periodDays,
      unlimited: plan.category === "unlimited",
      price: {
        amount: plan.retailCents,
        currency: plan.currency,
      },
    }));

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Failed to load packages", error);
    return NextResponse.json({ error: "Unable to load packages", packages: [] }, { status: 502 });
  }
}
