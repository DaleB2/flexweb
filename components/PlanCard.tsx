"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  {
    title: "Switchless activation",
    description: "Scan the QR in seconds and you’re live.",
  },
  {
    title: "Keep your number",
    description: "iMessage, WhatsApp, and calls stay on your SIM.",
  },
  {
    title: "Best partner networks",
    description: "Top-tier carriers in every region we support.",
  },
];

export default function PlanCard() {
  const router = useRouter();
  const [countries, setCountries] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [plans, setPlans] = useState<NormalizedPlan[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markupPct, setMarkupPct] = useState<number>(Number(process.env.NEXT_PUBLIC_DEFAULT_MARKUP_PCT ?? 18));
  const [currency, setCurrency] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "USD");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

        setCountries(fetchedCountries);
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
        }
      }
    };

    void fetchCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeCountry) return;

    let aborted = false;
    setIsLoadingPlans(true);
    setError(null);

    const loadPlans = async () => {
      try {
        const normalizedCode = activeCountry.trim().toUpperCase();
        const response = await fetch(`/api/catalog?countryCode=${normalizedCode}`, { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load plans");
        }
        if (aborted) return;

        if (!Array.isArray(json.plans) || json.plans.length === 0) {
          throw new Error("We’re refreshing plans for this country. Try again shortly.");
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
          setPlans([]);
          setError(err instanceof Error ? err.message : "We couldn’t load plans. Try a different country.");
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
  }, [activeCountry]);

  const activePlan = plans[selectedIndex];

  const countryName = useMemo(() => {
    if (!activeCountry) return "";
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(activeCountry) ?? activeCountry;
    } catch {
      return activeCountry;
    }
  }, [activeCountry]);

  const totalCents = useMemo(() => {
    if (!activePlan) return null;
    return Math.ceil(activePlan.wholesalePriceCents * (1 + markupPct / 100));
  }, [activePlan, markupPct]);

  const handleViewPackages = useCallback(() => {
    if (!countryCode) return;
    setActiveCountry(countryCode);
    setIsSheetOpen(true);
  }, [countryCode]);

  const handleSelectCountry = useCallback((code: string) => {
    setCountryCode(code);
    setPlans([]);
    setSelectedIndex(0);
    setError(null);
    setActiveCountry((current) => (current === code ? current : null));
    setIsSheetOpen(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (!activeCountry || !activePlan || !totalCents) return;
    const params = new URLSearchParams({
      countryCode: activeCountry,
      country: countryName,
      slug: activePlan.slug,
      packageCode: activePlan.packageCode,
      dataGb: String(activePlan.dataGb),
      periodDays: String(activePlan.periodDays),
      wholesaleCents: String(activePlan.wholesalePriceCents),
      markupPct: String(markupPct),
      totalCents: String(totalCents),
      currency,
    });
    router.push(`/checkout?${params.toString()}`);
  }, [activeCountry, activePlan, countryName, currency, markupPct, router, totalCents]);

  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-truelySky/40 bg-white p-8 text-truelyNavy shadow-[0_40px_140px_rgba(5,25,71,0.18)]">
      <div className="absolute inset-x-0 -top-48 h-64 bg-[radial-gradient(circle_at_top,_rgba(11,141,244,0.25),_transparent_70%)]" aria-hidden />
      <CardHeader className="relative space-y-4 p-0">
        <Badge className="self-start bg-truelyNavy text-white">Truely Switchless</Badge>
        <CardTitle className="text-4xl font-semibold leading-tight text-truelyNavy">
          Unlimited internet that travels with you.
        </CardTitle>
        <p className="max-w-xl text-base text-truelyNavy/70">
          Pick a destination, preview partner plans, and continue to checkout in a stack that mirrors Truely’s flow.
        </p>
      </CardHeader>
      <CardContent className="relative mt-8 space-y-8 p-0">
        <CountrySelector countries={countries} selected={countryCode} onSelect={handleSelectCountry} />

        <div className="grid gap-4 rounded-3xl border border-truelySky/30 bg-truelyMint/40 p-6">
          {reassurance.map((item) => (
            <div key={item.title} className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-truelyNavy">{item.title}</p>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-truelyNavy/50">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-truelyNavy to-[#031236] px-6 py-6 text-white shadow-[0_32px_90px_rgba(3,18,54,0.45)]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
            <span>Next step</span>
            <span>Email verification</span>
          </div>
          <div>
            <p className="text-3xl font-semibold">Stacked checkout like Truely</p>
            <p className="mt-1 text-sm text-white/80">
              We’ll open the plan builder sheet where you pick the stay and see totals before email capture.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            <span>Instant QR</span>
            <Separator orientation="vertical" className="hidden h-4 w-px bg-white/40 sm:block" />
            <span>Hotspot ready</span>
            <Separator orientation="vertical" className="hidden h-4 w-px bg-white/40 sm:block" />
            <span>Stripe secure</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-8 flex flex-col gap-4 p-0">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <Button
            size="lg"
            className="w-full justify-between rounded-full px-8 text-sm uppercase tracking-[0.28em] bg-none bg-truelyLime text-truelyNavy shadow-[0_24px_60px_rgba(156,255,0,0.35)] hover:bg-truelyLime/90"
            onClick={handleViewPackages}
            disabled={!countryCode}
          >
            <span>View packages</span>
            <span className="text-truelyNavy/70">{countryCode ? "Step 1 of 3" : "Select a country"}</span>
          </Button>
          <SheetContent>
            <div className="space-y-6">
              <div className="rounded-2xl border border-truelySky/40 bg-truelyMint/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-truelyNavy/50">Destination</p>
                <p className="mt-2 flex items-center gap-3 text-lg font-semibold text-truelyNavy">
                  <span className="text-2xl" aria-hidden>
                    {activeCountry && activeCountry.length === 2
                      ? String.fromCodePoint(
                          ...activeCountry.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)),
                        )
                      : ""}
                  </span>
                  {countryName || "Select a country"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-truelyNavy/50">
                  Unlimited data network partners
                </p>
              </div>

              {isLoadingPlans ? (
                <div className="space-y-5">
                  <div className="h-5 w-40 animate-pulse rounded-full bg-truelySky/30" />
                  <div className="h-32 animate-pulse rounded-3xl bg-truelySky/20" />
                  <div className="h-44 animate-pulse rounded-3xl bg-truelySky/20" />
                </div>
              ) : error ? (
                <Card className="border-truelySky/30 bg-white p-6 text-sm font-semibold text-truelyNavy shadow-none">
                  {error}
                </Card>
              ) : plans.length > 0 ? (
                <Tabs defaultValue="unlimited" className="w-full">
                  <TabsList className="flex justify-start gap-2 rounded-full border border-truelySky/20 bg-white p-1">
                    <TabsTrigger value="unlimited" className="flex-1 rounded-full text-xs uppercase tracking-[0.3em] text-truelyNavy">
                      Unlimited data
                    </TabsTrigger>
                    <TabsTrigger
                      value="payg"
                      className="flex-1 rounded-full text-xs uppercase tracking-[0.3em] text-truelyNavy/40"
                      disabled
                    >
                      Pay per GB
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="unlimited">
                    <PlanSlider
                      plans={plans}
                      markupPct={markupPct}
                      currency={currency}
                      selectedIndex={selectedIndex}
                      onChange={setSelectedIndex}
                    />
                  </TabsContent>
                  <TabsContent value="payg">
                    <Card className="border-dashed border-truelySky/30 bg-white/80 p-6 text-center text-sm text-truelyNavy/60 shadow-none">
                      Pay-as-you-go options are coming soon.
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card className="border-dashed border-truelySky/30 bg-white/80 p-6 text-center text-sm text-truelyNavy/60 shadow-none">
                  Pick a country to load partner plans.
                </Card>
              )}

              <div className="rounded-3xl border border-truelySky/30 bg-white p-6 shadow-[0_20px_70px_rgba(5,25,71,0.12)]">
                <div className="flex items-center justify-between text-sm font-semibold text-truelyNavy/70">
                  <span>{activePlan ? formatPeriodLabel(activePlan.periodDays) : "Plan"}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-truelySky">Stripe secure</span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-truelyNavy">
                  {totalCents && activePlan ? formatCurrency(totalCents, currency) : "Choose a plan"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-truelyNavy/50">
                  {activePlan
                    ? `From ${formatCurrency(Math.ceil(totalCents! / activePlan.periodDays), currency)} per day`
                    : "Select a stay length"}
                </p>
                <p className="mt-4 text-xs font-medium text-truelyNavy/70">
                  Continue to email verification next. Existing Truely users will be prompted to sign in.
                </p>
                <Button
                  size="lg"
                  className="mt-6 w-full justify-center rounded-full text-sm uppercase tracking-[0.3em] bg-none bg-truelyLime text-truelyNavy shadow-[0_24px_60px_rgba(156,255,0,0.35)] hover:bg-truelyLime/90"
                  onClick={handleContinue}
                  disabled={!activePlan || !totalCents}
                >
                  {activePlan && totalCents
                    ? `Continue — ${formatCurrency(totalCents, currency)}`
                    : "Select a plan"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-truelyNavy/50">
          Trusted by 150k+ users. Taxes included.
        </p>
      </CardFooter>
    </Card>
  );
}
