import { NextRequest, NextResponse } from "next/server";
import { listAllCountries, listPlansByLocation } from "@/lib/esim";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const countryCode = request.nextUrl.searchParams.get("countryCode");

  if (!countryCode) {
    try {
      const countries = await listAllCountries();
      return NextResponse.json({
        countries,
        markup_pct: Number(process.env.DEFAULT_MARKUP_PCT ?? 35),
        currency: process.env.DEFAULT_CURRENCY ?? "USD",
      });
    } catch (error) {
      console.error("Failed to fetch countries", error);
      return NextResponse.json({
        countries: ["US", "MX", "GB", "ES", "JP"],
        markup_pct: Number(process.env.DEFAULT_MARKUP_PCT ?? 35),
        currency: process.env.DEFAULT_CURRENCY ?? "USD",
      });
    }
  }

  try {
    const catalog = await listPlansByLocation(countryCode);
    return NextResponse.json(catalog);
  } catch (error) {
    console.error(`Falling back to demo plans for ${countryCode}`, error);
    return NextResponse.json({
      countryCode,
      plans: [
        { slug: `${countryCode}-demo-5`, packageCode: `${countryCode}-DEMO-5`, dataGb: 5, priceCents: 750, periodDays: 7, currency: process.env.DEFAULT_CURRENCY ?? "USD" },
        { slug: `${countryCode}-demo-10`, packageCode: `${countryCode}-DEMO-10`, dataGb: 10, priceCents: 1150, periodDays: 15, currency: process.env.DEFAULT_CURRENCY ?? "USD" },
        { slug: `${countryCode}-demo-20`, packageCode: `${countryCode}-DEMO-20`, dataGb: 20, priceCents: 1850, periodDays: 30, currency: process.env.DEFAULT_CURRENCY ?? "USD" },
        { slug: `${countryCode}-demo-50`, packageCode: `${countryCode}-DEMO-50`, dataGb: 50, priceCents: 3250, periodDays: 45, currency: process.env.DEFAULT_CURRENCY ?? "USD" },
      ],
      markupPct: Number(process.env.DEFAULT_MARKUP_PCT ?? 35),
      markup_pct: Number(process.env.DEFAULT_MARKUP_PCT ?? 35),
      currency: process.env.DEFAULT_CURRENCY ?? "USD",
    });
  }
}
