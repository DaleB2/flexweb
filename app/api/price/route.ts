// app/api/price/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { wholesale_cents, markup_pct } = await req.json();
  const total_cents = Math.round(wholesale_cents * (1 + markup_pct / 100));
  return NextResponse.json({ total_cents, markup_pct });
}
