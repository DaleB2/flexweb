"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { NormalizedPlan } from "@/lib/esim";
import CountrySelector from "./CountrySelector";
import PlanSlider, { formatCurrency, formatPeriodLabel } from "./PlanSlider";

interface CatalogResponse {
  countries?: string[];
  plans?: NormalizedPlan[];
  markup_pct?: number;
  markupPct?: number;
  currency?: string;
  error?: string;
}

const reassurance = [
  "Instant QR activation",
  "Keep your phone number active",
  "Works in hotspots & tablets",
];

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
          throw new Error(json.error ?? "Failed to load destinations");
        }
        if (cancelled) return;

        const fetchedCountries = Array.isArray(json.countries)
          ? json.countries.map((code) => code.trim().toUpperCase()).filter((code) => code)
          : [];

        if (fetchedCountries.length === 0) {
          throw new Error("No destinations available");
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
          setError("We couldn’t reach the catalog. Refresh or try again later.");
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
          throw new Error("No plans available for this destination yet.");
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
            err instanceof Error ? err.message : "We couldn’t load plans. Pick another destination for now.",
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

  const totalCents = useMemo(() => {
    if (!activePlan) return null;
    return Math.ceil(activePlan.priceCents * (1 + markupPct / 100));
  }, [activePlan, markupPct]);

  const handleContinue = useCallback(() => {
    if (!countryCode || !activePlan || !totalCents) return;
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
  }, [activePlan, countryCode, countryName, currency, markupPct, router, totalCents]);

  const buttonDisabled = !activePlan || isLoadingPlans;

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/90 p-8 text-midnight shadow-[0_40px_120px_rgba(18,7,50,0.35)] backdrop-blur">
      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-iris/40 via-fuchsia/40 to-amber/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-iris/30 via-plum/30 to-lilac/30 blur-3xl" />

      <div className="relative space-y-6">
        <div className="space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-iris/70">Build your eSIM</p>
          <h2 className="text-3xl font-bold text-midnight sm:text-[2.4rem]">
            Choose a destination and lock in flexible data.
          </h2>
          <p className="max-w-lg text-sm text-midnight/70">
            Pick the stay length that fits your trip. Every plan comes with instant delivery, full-speed data, and support that follows you globally.
          </p>
        </div>

        <CountrySelector countries={countries} selected={countryCode} onSelect={setCountryCode} variant="light" />

        <div className="rounded-3xl border border-lilac/40 bg-moon/70 p-6 shadow-[0_25px_70px_rgba(89,43,234,0.15)]">
          {isLoadingPlans ? (
            <div className="space-y-5">
              <div className="h-5 animate-pulse rounded-full bg-white/70" />
              <div className="h-28 animate-pulse rounded-[28px] bg-white/70" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-fuchsia/40 bg-fuchsia/10 p-4 text-sm font-semibold text-fuchsia">
              {error}
            </div>
          ) : plans.length > 0 ? (
            <PlanSlider
              plans={plans}
              markupPct={markupPct}
              currency={currency}
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
            />
          ) : (
            <div className="rounded-2xl border border-white/60 bg-white p-6 text-center text-sm font-semibold text-midnight/70">
              Select a destination to view plans.
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-midnight/70">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-midnight/50">You get</p>
              <ul className="mt-3 space-y-2">
                {reassurance.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-semibold">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-iris/10 text-iris">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-lilac/60 bg-moon/80 p-5 text-right">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-midnight/50">Total today</p>
              <p className="text-3xl font-bold text-midnight">
                {totalCents && activePlan ? formatCurrency(totalCents, currency) : "—"}
              </p>
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-midnight/40">
                {activePlan ? `${formatPeriodLabel(activePlan.periodDays)} validity` : "Pick a plan"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={buttonDisabled}
          className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-iris to-fuchsia px-6 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-[0_25px_80px_rgba(123,60,237,0.45)] transition hover:shadow-[0_30px_90px_rgba(123,60,237,0.6)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {activePlan && totalCents
            ? `Continue — ${formatCurrency(totalCents, currency)}`
            : "Select a destination"}
        </button>

        <p className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-midnight/40">
          Powered by Stripe. Taxes included.
        </p>
      </div>
    </div>
  );
}
