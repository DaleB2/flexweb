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
      return NextResponse.json(
        {
          error: "Unable to load countries from eSIM Access",
        },
        { status: 502 },
      );
    }
  }

  try {
    const catalog = await listPlansByLocation(countryCode);

    return NextResponse.json(catalog);
  } catch (error) {
    console.error(`Failed to fetch plans for ${countryCode}`, error);
    return NextResponse.json(
      {
        error: "Unable to load plans from eSIM Access",
      },
      { status: 502 },
    );
  }
}
