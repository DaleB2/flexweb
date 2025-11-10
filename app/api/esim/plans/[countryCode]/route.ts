import { NextResponse } from "next/server";

import { fetchPlans } from "@/lib/esimAccess";

export async function GET(
  _request: Request,
  { params }: { params: { countryCode: string } },
) {
  const { countryCode } = params;
  const url = new URL(_request.url);
  const markupPct = url.searchParams.get("markupPct");

  try {
    const plans = await fetchPlans(countryCode.toUpperCase(), {
      markupPct: markupPct ? Number(markupPct) : undefined,
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load plans" }, { status: 500 });
  }
}
