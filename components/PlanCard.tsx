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
  "4G/5G Speeds",
  "Switchless® eSIMs",
  "Hotspot/Tethering",
  "Best Network Guarantee",
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
    <div className="relative flex flex-col gap-6 rounded-[20px] bg-white/90 p-6 shadow-card backdrop-blur-xl lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-bottle/60">
            <span>Countries</span>
            <span className="rounded-full bg-bottle/10 px-3 py-1 text-[10px]">190+</span>
          </div>
          <h2 className="text-2xl font-extrabold text-bottle lg:text-3xl">Pick your destination</h2>
        </div>
        <div className="hidden flex-col items-end text-right text-xs font-semibold text-bottle/50 sm:flex">
          <span>Powered by eSIM Access</span>
          <span>Real-time inventory</span>
        </div>
      </div>

      <div className="flex gap-2 rounded-full bg-bottle/10 p-1 text-xs font-bold uppercase tracking-[0.3em] text-bottle/50">
        <button
          type="button"
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === "unlimited" ? "bg-white text-bottle shadow" : "hover:text-bottle"
          }`}
          onClick={() => setMode("unlimited")}
        >
          Unlimited Data
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === "metered" ? "bg-white text-bottle" : "opacity-50"
          }`}
          disabled
        >
          Pay Per GB
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr]">
        <CountrySelector countries={countries} selected={countryCode} onSelect={setCountryCode} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {featureBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center justify-center rounded-full bg-mint px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-bottle shadow-sm"
          >
            {badge}
          </span>
        ))}
      </div>

      <div>
        {isLoadingPlans ? (
          <div className="space-y-4">
            <div className="h-5 animate-pulse rounded-xl bg-bottle/10" />
            <div className="h-24 animate-pulse rounded-2xl bg-bottle/10" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-daisy/30 p-4 text-sm font-semibold text-bottle">{error}</div>
        ) : plans.length > 0 ? (
          <PlanSlider
            plans={plans}
            markupPct={markupPct}
            currency={currency}
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
          />
        ) : (
          <div className="rounded-2xl bg-white/80 p-6 text-center text-sm font-semibold text-bottle/60 shadow-inner">
            Select a destination to see available plans.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!activePlan || !countryCode || isLoadingPlans}
        className="group flex w-full items-center justify-between rounded-[18px] bg-mint px-6 py-4 text-bottle transition hover:translate-y-[-1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bottle/60">Continue</p>
          <p className="text-lg font-extrabold">
            {activePlan ? formatCurrency(Math.ceil(activePlan.priceCents * (1 + markupPct / 100)), currency) : "Pick a plan"}
          </p>
        </div>
        <div className="text-right text-xs font-semibold uppercase tracking-[0.3em] text-bottle/60">
          {countryCode ? countryName : "Destination"}
        </div>
      </button>
    </div>
  );
}
