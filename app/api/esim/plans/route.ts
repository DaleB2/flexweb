import { NextResponse } from "next/server";

import { loadEsimPlans } from "@/lib/esimAccessServer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("countryCode") ?? "";

  if (!countryCode) {
    return NextResponse.json({ plans: [] }, { status: 400 });
  }

  try {
    const plans = await loadEsimPlans(countryCode);
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Failed to load eSIM Access plans", error);
    return NextResponse.json({ plans: [] }, { status: 502 });
  }
}
