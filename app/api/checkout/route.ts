import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

interface CheckoutDraft {
  countryCode: string;
  country?: string;
  slug: string;
  packageCode: string;
  dataGb: number;
  periodDays: number;
  wholesaleCents: number;
  markupPct: number;
  totalCents: number;
  currency: string;
}

function parseDraft(payload: Record<string, unknown>): CheckoutDraft {
  const requiredFields = [
    "countryCode",
    "slug",
    "packageCode",
    "dataGb",
    "periodDays",
    "wholesaleCents",
    "markupPct",
    "totalCents",
    "currency",
  ] as const;

  for (const field of requiredFields) {
    if (!(field in payload)) {
      throw new Error(`Missing draft field ${field}`);
    }
  }

  return {
    countryCode: String(payload.countryCode),
    country: typeof payload.country === "string" ? payload.country : undefined,
    slug: String(payload.slug),
    packageCode: String(payload.packageCode),
    dataGb: Number(payload.dataGb),
    periodDays: Number(payload.periodDays),
    wholesaleCents: Number(payload.wholesaleCents),
    markupPct: Number(payload.markupPct),
    totalCents: Number(payload.totalCents),
    currency: String(payload.currency),
  } satisfies CheckoutDraft;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const draft = parseDraft(body.draft ?? {});
    if (!Number.isFinite(draft.totalCents) || draft.totalCents <= 0) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const existingUser = supabaseAdmin
      ? await supabaseAdmin.from("profiles").select("id, email").eq("email", email).maybeSingle()
      : { data: null };

    const existingProfile = existingUser?.data ?? null;
    const authHeader = request.headers.get("authorization");
    let authenticatedUserId: string | null = null;

    if (authHeader?.startsWith("Bearer ") && supabaseAdmin) {
      const token = authHeader.slice(7);
      const { data } = await supabaseAdmin.auth.getUser(token);
      authenticatedUserId = data.user?.id ?? null;
    }

    if (existingProfile) {
      if (!authenticatedUserId) {
        return NextResponse.json({ requiresLogin: true }, { status: 409 });
      }
      if (existingProfile.id !== authenticatedUserId) {
        return NextResponse.json({ requiresLogin: true }, { status: 403 });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: draft.totalCents,
      currency: draft.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        email,
        draft: JSON.stringify(draft),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      requiresLogin: Boolean(existingProfile),
    });
  } catch (error) {
    console.error("Checkout error", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
