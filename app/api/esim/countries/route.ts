import { NextResponse } from "next/server";

import { loadEsimCountries } from "@/lib/esimAccessServer";

export async function GET() {
  try {
    const countries = await loadEsimCountries();
    return NextResponse.json({ countries });
  } catch (error) {
    console.error("Failed to load eSIM Access countries", error);
    return NextResponse.json({ countries: [] }, { status: 502 });
  }
}
