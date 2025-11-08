"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CountrySelector from "./CountrySelector";
import PlanSlider, { formatCurrency } from "./PlanSlider";
import type { NormalizedPlan } from "@/lib/esim";

interface CatalogResponse {
  countries?: string[];
  plans?: NormalizedPlan[];
  markup_pct: number;
  currency: string;
}

const featureBadges = [
  "Instant activation",
  "Use on unlocked phones",
  "Keep WhatsApp active",
  "Share hotspot",
];

export default function PlanCard() {
  const router = useRouter();
  const [countries, setCountries] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<NormalizedPlan[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markupPct, setMarkupPct] = useState<number>(Number(process.env.NEXT_PUBLIC_DEFAULT_MARKUP_PCT ?? 35));
  const [currency, setCurrency] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "USD");
  const [mode, setMode] = useState<"unlimited" | "metered">("unlimited");

  useEffect(() => {
    let cancelled = false;
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (!cancelled) {
          setCountries(json.countries ?? []);
          if (typeof json.markup_pct === "number") {
            setMarkupPct(json.markup_pct);
          }
          if (json.currency) {
            setCurrency(json.currency);
          }
        }
      } catch (err) {
        console.error("Failed to load countries", err);
        if (!cancelled) {
          setCountries(["US", "GB", "JP", "AU"]);
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
        const response = await fetch(`/api/catalog?countryCode=${countryCode}`, { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (aborted) return;
        setPlans(json.plans ?? []);
        setSelectedIndex(0);
        if (typeof json.markup_pct === "number") setMarkupPct(json.markup_pct);
        if (json.currency) setCurrency(json.currency);
      } catch (err) {
        console.error("Failed to load plans", err);
        if (aborted) return;
        setError("We couldn’t load plans for this country. Try another destination.");
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
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? countryCode;
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

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Destination</p>
          <h2 className="text-2xl font-semibold text-slate-900 lg:text-3xl">Pick where you&apos;re heading</h2>
        </div>
        <span className="hidden text-xs font-medium text-slate-500 sm:inline">Powered by eSIM Access</span>
      </div>

      <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        <button
          type="button"
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === "unlimited" ? "bg-white text-slate-900 shadow" : "hover:text-slate-700"
          }`}
          onClick={() => setMode("unlimited")}
        >
          Unlimited data
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === "metered" ? "bg-white text-slate-900" : "opacity-50"
          }`}
          disabled
        >
          Pay per GB
        </button>
      </div>

      <CountrySelector countries={countries} selected={countryCode} onSelect={setCountryCode} />

      <div className="grid gap-3 sm:grid-cols-2">
        {featureBadges.map((badge) => (
          <div key={badge} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            {badge}
          </div>
        ))}
      </div>

      <div>
        {isLoadingPlans ? (
          <div className="space-y-4">
            <div className="h-5 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-persian/30 bg-persian/5 p-4 text-sm font-semibold text-persian">{error}</div>
        ) : plans.length > 0 ? (
          <PlanSlider
            plans={plans}
            markupPct={markupPct}
            currency={currency}
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Select a destination to see available plans.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!activePlan || !countryCode || isLoadingPlans}
        className="flex w-full items-center justify-between rounded-2xl bg-bottle px-6 py-4 text-white transition hover:bg-bottle/90 disabled:cursor-not-allowed disabled:bg-bottle/50"
      >
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Continue</p>
          <p className="text-lg font-semibold">
            {activePlan ? formatCurrency(Math.ceil(activePlan.priceCents * (1 + markupPct / 100)), currency) : "Pick a plan"}
          </p>
        </div>
        <div className="text-right text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
          {countryCode ? countryName : "Destination"}
        </div>
      </button>
    </div>
  );
}
