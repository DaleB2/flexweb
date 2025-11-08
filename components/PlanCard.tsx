"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { NormalizedPlan } from "@/lib/esim";
import CountrySelector from "./CountrySelector";
import PlanSlider, { formatCurrency } from "./PlanSlider";

interface CatalogResponse {
  countries?: string[];
  plans?: NormalizedPlan[];
  markup_pct?: number;
  markupPct?: number;
  currency?: string;
  error?: string;
}

const featureBadges = ["Instant QR", "Hotspot friendly", "Cheeky culture guide", "Local currency checkout"];

export default function PlanCard() {
  const router = useRouter();
  const [countries, setCountries] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<NormalizedPlan[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markupPct, setMarkupPct] = useState<number>(Number(process.env.NEXT_PUBLIC_DEFAULT_MARKUP_PCT ?? 18));
  const [currency, setCurrency] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "USD");

  useEffect(() => {
    let cancelled = false;

    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load countries");
        }
        if (cancelled) return;

        const fetchedCountries = Array.isArray(json.countries)
          ? json.countries.map((code) => code.trim().toUpperCase()).filter((code) => code)
          : [];

        if (fetchedCountries.length === 0) {
          throw new Error("No countries available");
        }

        setCountries(fetchedCountries);
        setError(null);
        setCountryCode((current) => {
          if (!current) return null;
          const normalized = current.trim().toUpperCase();
          return fetchedCountries.includes(normalized) ? normalized : null;
        });
        const markupFromResponse = json.markup_pct ?? json.markupPct;
        if (typeof markupFromResponse === "number") {
          setMarkupPct(markupFromResponse);
        }
        if (json.currency) {
          setCurrency(json.currency);
        }
      } catch (err) {
        console.error("Failed to load countries", err);
        if (!cancelled) {
          setCountries([]);
          setCountryCode(null);
          setPlans([]);
          setSelectedIndex(0);
          setError("We couldn’t load countries right now. Please refresh and try again.");
        }
      }
    };

    void fetchCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!countryCode) return;

    let aborted = false;
    setIsLoadingPlans(true);
    setError(null);
    setPlans([]);

    const loadPlans = async () => {
      try {
        const normalizedCode = countryCode.trim().toUpperCase();
        const response = await fetch(`/api/catalog?countryCode=${normalizedCode}`, { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load plans");
        }
        if (aborted) return;

        if (!Array.isArray(json.plans) || json.plans.length === 0) {
          throw new Error("No plans available for this country yet. Check back soon.");
        }

        setPlans(json.plans);
        setSelectedIndex(0);
        const markupFromResponse = json.markup_pct ?? json.markupPct;
        if (typeof markupFromResponse === "number") {
          setMarkupPct(markupFromResponse);
        }
        if (json.currency) {
          setCurrency(json.currency);
        }
      } catch (err) {
        console.error("Failed to load plans", err);
        if (!aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn’t load plans for this country. Try another destination.",
          );
        }
      } finally {
        if (!aborted) {
          setIsLoadingPlans(false);
        }
      }
    };

    void loadPlans();

    return () => {
      aborted = true;
    };
  }, [countryCode]);

  const activePlan = plans[selectedIndex];

  const countryName = useMemo(() => {
    if (!countryCode) return "";
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? countryCode;
    } catch {
      return countryCode;
    }
  }, [countryCode]);

  const handleContinue = useCallback(() => {
    if (!countryCode || !activePlan) return;
    const totalCents = Math.ceil(activePlan.priceCents * (1 + markupPct / 100));
    const params = new URLSearchParams({
      countryCode,
      country: countryName,
      slug: activePlan.slug,
      packageCode: activePlan.packageCode,
      dataGb: String(activePlan.dataGb),
      periodDays: String(activePlan.periodDays),
      wholesaleCents: String(activePlan.priceCents),
      markupPct: String(markupPct),
      totalCents: String(totalCents),
      currency,
    });
    router.push(`/checkout?${params.toString()}`);
  }, [activePlan, countryCode, countryName, currency, markupPct, router]);

  const buttonDisabled = !activePlan || isLoadingPlans;

  return (
    <div className="relative flex flex-col gap-8 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-8 text-slate-900 shadow-card">
      <div className="space-y-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-slate-500">Plan studio</p>
        <h2 className="text-3xl font-semibold leading-snug sm:text-[2.25rem]">Pick a country and grab unlimited data.</h2>
        <p className="text-sm text-slate-600">
          We keep things breezy: no plastic SIM swaps, no confusing bundles. Just choose your stop, checkout, and scan the QR when you land.
        </p>
      </div>

      <CountrySelector countries={countries} selected={countryCode} onSelect={setCountryCode} variant="light" />

      <div className="grid gap-3 sm:grid-cols-2">
        {featureBadges.map((badge) => (
          <div key={badge} className="rounded-2xl border border-slate-200 bg-nurse px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-600">
            {badge}
          </div>
        ))}
      </div>

      <div>
        {isLoadingPlans ? (
          <div className="space-y-4">
            <div className="h-5 animate-pulse rounded-lg bg-nurse" />
            <div className="h-28 animate-pulse rounded-3xl bg-nurse" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-persian/30 bg-persian/5 p-4 text-sm font-medium text-persian">{error}</div>
        ) : plans.length > 0 ? (
          <PlanSlider
            plans={plans}
            markupPct={markupPct}
            currency={currency}
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-nurse p-6 text-center text-sm font-semibold text-slate-600">
            Select a destination to view plans.
          </div>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-nurse p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-slate-500">Checkout preview</span>
          <span className="text-sm font-medium text-slate-500">Stripe secured</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Total due</span>
            <span className="text-base font-semibold">
              {activePlan
                ? formatCurrency(Math.ceil(activePlan.priceCents * (1 + markupPct / 100)), currency)
                : "—"}
            </span>
          </div>
          <div className="text-xs text-slate-500">No surprise fees—taxes and activation included.</div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={buttonDisabled}
        className="group relative w-full overflow-hidden rounded-[1.75rem] bg-coal px-6 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-coal/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="relative z-10">
          {activePlan
            ? `Continue — ${formatCurrency(Math.ceil(activePlan.priceCents * (1 + markupPct / 100)), currency)}`
            : "Pick a destination"}
        </span>
        <span className="absolute inset-0 -z-10 scale-110 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)] opacity-0 transition group-hover:opacity-100" />
      </button>

      <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-slate-400">
        Taxes included. Secure checkout via Stripe.
      </p>
    </div>
  );
}
