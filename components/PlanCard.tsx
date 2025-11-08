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
        if (cancelled) return;

        setCountries(json.countries ?? []);
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
          setError("We couldn’t load plans for this country. Try another destination.");
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
    <div className="flex flex-col gap-7 rounded-[32px] border border-white/40 bg-white/90 p-7 text-coal shadow-[0_35px_80px_rgba(9,41,39,0.35)] backdrop-blur lg:p-9">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-coal/50">Destination</p>
          <h2 className="text-3xl font-extrabold leading-tight lg:text-4xl">Pick where you&apos;re heading</h2>
        </div>
        <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-coal/40 sm:inline">
          Powered by eSIM Access
        </span>
      </div>

      <div className="flex gap-2 rounded-full bg-coal/5 p-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-coal/50">
        <button
          type="button"
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === "unlimited"
              ? "bg-coal text-white shadow-[0_16px_40px_rgba(6,8,8,0.25)]"
              : "hover:text-coal"
          }`}
          onClick={() => setMode("unlimited")}
        >
          Unlimited data
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-4 py-2 transition ${
            mode === "metered" ? "bg-coal text-white" : "opacity-40"
          }`}
          onClick={() => setMode("metered")}
          disabled
        >
          Pay per GB
        </button>
      </div>

      <CountrySelector countries={countries} selected={countryCode} onSelect={setCountryCode} />

      <div className="grid gap-3 sm:grid-cols-2">
        {featureBadges.map((badge) => (
          <div
            key={badge}
            className="rounded-2xl border border-coal/10 bg-coal/5 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-coal"
          >
            {badge}
          </div>
        ))}
      </div>

      <div>
        {isLoadingPlans ? (
          <div className="space-y-4">
            <div className="h-5 animate-pulse rounded-lg bg-coal/10" />
            <div className="h-24 animate-pulse rounded-2xl bg-coal/10" />
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
          <div className="rounded-2xl border border-coal/10 bg-coal/5 p-6 text-center text-sm font-semibold text-coal/70">
            Select a destination to view plans.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={buttonDisabled}
        className="w-full rounded-full bg-coal px-6 py-4 text-sm font-bold uppercase tracking-[0.4em] text-white shadow-[0_18px_55px_rgba(6,8,8,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {activePlan ? `Continue — ${formatCurrency(Math.ceil(activePlan.priceCents * (1 + markupPct / 100)), currency)}` : "Pick a destination"}
      </button>

      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/40">
        Taxes included. Secure checkout via Stripe.
      </p>
    </div>
  );
}
