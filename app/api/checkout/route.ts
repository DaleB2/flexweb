import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { listPlansByLocation } from "@/lib/esim";

export const dynamic = "force-dynamic";

interface CheckoutDraft {
  countryCode: string;
  country?: string | null;
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

    const supabaseAdmin = getSupabaseAdmin();
    let knownUserId: string | null = null;

    if (supabaseAdmin) {
      try {
        const { data: authMatch, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
        if (authError && authError.status !== 404) {
          console.error("Supabase admin lookup error", authError);
        }
        knownUserId = authMatch?.user?.id ?? null;
      } catch (error) {
        console.error("Failed to check Supabase auth for email", error);
      }

      if (!knownUserId) {
        const { data: profileMatch, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Supabase profile lookup error", profileError);
        }
        knownUserId = profileMatch?.id ?? null;
      }
    }

    const authHeader = request.headers.get("authorization");
    let authenticatedUserId: string | null = null;

    if (authHeader?.startsWith("Bearer ") && supabaseAdmin) {
      const token = authHeader.slice(7);
      const { data } = await supabaseAdmin.auth.getUser(token);
      authenticatedUserId = data.user?.id ?? null;
    }

    if (knownUserId) {
      if (!authenticatedUserId) {
        return NextResponse.json({ requiresLogin: true }, { status: 409 });
      }
      if (knownUserId !== authenticatedUserId) {
        return NextResponse.json({ requiresLogin: true }, { status: 403 });
      }
    }

    const catalog = await listPlansByLocation(draft.countryCode);
    const plan = catalog.plans.find(
      (candidate) =>
        candidate.packageCode.toLowerCase() === draft.packageCode.toLowerCase() ||
        candidate.slug.toLowerCase() === draft.slug.toLowerCase(),
    );

    if (!plan) {
      return NextResponse.json({ error: "Selected plan is no longer available" }, { status: 400 });
    }

    const defaultMarkup = Number(process.env.DEFAULT_MARKUP_PCT ?? 18);
    const markupFromCatalog = Number(catalog.markupPct);
    const markupPct = Number.isFinite(markupFromCatalog) && markupFromCatalog > 0 ? markupFromCatalog : defaultMarkup;
    const wholesaleCents = plan.priceCents;
    const totalCents = Math.max(1, Math.ceil(wholesaleCents * (1 + markupPct / 100)));
    const currency = (plan.currency ?? catalog.currency ?? draft.currency ?? "USD").toString().toUpperCase();
    const sanitizedDraft: CheckoutDraft = {
      countryCode: catalog.countryCode ?? draft.countryCode,
      country: draft.country ?? null,
      slug: plan.slug,
      packageCode: plan.packageCode,
      dataGb: plan.dataGb,
      periodDays: plan.periodDays,
      wholesaleCents,
      markupPct,
      totalCents,
      currency,
    };

    const metadataDraft = {
      ...sanitizedDraft,
    } satisfies CheckoutDraft;

    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: sanitizedDraft.totalCents,
      currency: sanitizedDraft.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        email,
        draft: JSON.stringify(metadataDraft),
        country_code: sanitizedDraft.countryCode,
        package_code: sanitizedDraft.packageCode,
        data_gb: sanitizedDraft.dataGb.toString(),
        period_days: sanitizedDraft.periodDays.toString(),
        wholesale_cents: sanitizedDraft.wholesaleCents.toString(),
        markup_pct: sanitizedDraft.markupPct.toString(),
        total_cents: sanitizedDraft.totalCents.toString(),
        currency: sanitizedDraft.currency,
        make_notified: "0",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      requiresLogin: Boolean(knownUserId),
      draft: sanitizedDraft,
    });
  } catch (error) {
    console.error("Checkout error", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
