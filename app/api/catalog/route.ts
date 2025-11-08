import { NextRequest, NextResponse } from "next/server";
import { listAllCountries, listPlansByLocation } from "@/lib/esim";

export async function GET(req: NextRequest) {
  const countryCode = req.nextUrl.searchParams.get("countryCode");

  // No country → return countries list
  if (!countryCode) {
    try {
      const countries = await listAllCountries();
      return NextResponse.json({
        countries,
        markup_pct: Number(process.env.DEFAULT_MARKUP_PCT || 20),
      });
    } catch {
      // safe fallback
      return NextResponse.json({
        countries: ["United States", "Australia", "United Kingdom", "Japan"],
        markup_pct: Number(process.env.DEFAULT_MARKUP_PCT || 20),
      });
    }
  }

  // With country → return normalized plans
  try {
    const { plans } = await listPlansByLocation(countryCode);
    return NextResponse.json({
      countryCode,
      plans,
      markup_pct: Number(process.env.DEFAULT_MARKUP_PCT || 20),
      currency: process.env.DEFAULT_CURRENCY || "USD",
    });
  } catch {
    // nice fallback demo plans (NEVER empty UI)
    return NextResponse.json({
      countryCode,
      plans: [
        { slug: "demo-5gb", packageCode: "DEMO5", dataGb: 5, priceCents: 600, periodDays: 7, currency: "USD" },
        { slug: "demo-10gb", packageCode: "DEMO10", dataGb: 10, priceCents: 1000, periodDays: 15, currency: "USD" },
        { slug: "demo-20gb", packageCode: "DEMO20", dataGb: 20, priceCents: 1600, periodDays: 30, currency: "USD" },
        { slug: "demo-50gb", packageCode: "DEMO50", dataGb: 50, priceCents: 2800, periodDays: 30, currency: "USD" },
      ],
      markup_pct: Number(process.env.DEFAULT_MARKUP_PCT || 20),
      currency: process.env.DEFAULT_CURRENCY || "USD",
    });
  }
}
