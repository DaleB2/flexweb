"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NormalizedPlan } from "@/lib/esim";

import CountrySelector from "./CountrySelector";
import PlanSlider, { formatCurrency, formatDataLabel, formatPeriodLabel } from "./PlanSlider";

import { CreditCard, MailCheck, Sparkles, Wifi, MessageCircle } from "lucide-react";

interface CatalogResponse {
  countries?: string[];
  plans?: NormalizedPlan[];
  markup_pct?: number;
  markupPct?: number;
  currency?: string;
  error?: string;
}

type ReassuranceItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const reassurance: ReassuranceItem[] = [
  {
    title: "Switchless activation",
    description: "Scan the QR in seconds and you’re live.",
    icon: Sparkles,
  },
  {
    title: "Keep your number",
    description: "iMessage, WhatsApp, and calls stay on your SIM.",
    icon: MessageCircle,
  },
  {
    title: "Best partner networks",
    description: "Top-tier carriers in every region we support.",
    icon: Wifi,
  },
];

const checkoutSteps: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Plan builder",
    description: "Tap a bundle to preview totals in the Truely stack.",
    icon: Sparkles,
  },
  {
    title: "Email verify",
    description: "Secure checkout with a one-time passcode.",
    icon: MailCheck,
  },
  {
    title: "Payment",
    description: "Apple Pay, Google Pay, or card — powered by Stripe.",
    icon: CreditCard,
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

  const pricePerDay = useMemo(() => {
    if (!activePlan || !totalCents) return null;
    return Math.ceil(totalCents / activePlan.periodDays);
  }, [activePlan, totalCents]);

  const flagEmoji = useMemo(() => {
    if (!activeCountry || activeCountry.length !== 2) return "";
    try {
      return String.fromCodePoint(...activeCountry.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
    } catch {
      return "";
    }
  }, [activeCountry]);

  const highlightPills = ["Instant QR delivery", "Hotspot ready", "Stripe secure checkout"];

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
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#ffffff] via-[#eef4ff] to-[#f7f9ff] p-8 text-[#10152b] shadow-[0_44px_140px_rgba(10,20,55,0.22)]">
      <div className="absolute -left-48 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(83,96,255,0.24),_transparent_70%)] blur-3xl" aria-hidden />
      <div className="absolute -right-32 bottom-[-160px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(156,255,0,0.18),_transparent_70%)] blur-3xl" aria-hidden />
      <CardHeader className="relative space-y-4 p-0">
        <Badge className="self-start bg-[#0f1c46] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-white">
          Truely Switchless
        </Badge>
        <CardTitle className="text-4xl font-semibold leading-tight text-[#080f27]">
          Unlimited internet that travels with you.
        </CardTitle>
        <p className="max-w-xl text-base text-[#1f2544]/70">
          Choose your destination, explore partner bundles, and slide into the stacked Truely checkout without losing momentum.
        </p>
      </CardHeader>
      <CardContent className="relative mt-10 space-y-10 p-0">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[32px] border border-[#d0d5ff]/60 bg-white/90 p-6 shadow-[0_28px_90px_rgba(12,26,63,0.14)]">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(83,96,255,0.12),_transparent_70%)]" aria-hidden />
              <div className="relative space-y-6">
                <CountrySelector countries={countries} selected={countryCode} onSelect={handleSelectCountry} />
                <div className="grid gap-3 sm:grid-cols-3">
                  {reassurance.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="group relative overflow-hidden rounded-2xl border border-[#d0d5ff]/60 bg-white/80 px-4 py-5 shadow-[0_18px_60px_rgba(83,96,255,0.14)] transition hover:border-[#74e4ff]/60"
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1ff] text-[#5360ff]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-[#0b0f1c]">{item.title}</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.28em] text-[#1f2544]/50">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#d0d5ff]/60 bg-white/95 p-6 shadow-[0_32px_100px_rgba(10,22,58,0.16)]">
              <PlanSlider
                plans={plans}
                markupPct={markupPct}
                currency={currency}
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
              />
            </div>
          </div>

          <aside className="relative flex h-full flex-col gap-6 overflow-hidden rounded-[32px] border border-[#0f1c46]/40 bg-gradient-to-br from-[#101a3f] via-[#0a1430] to-[#050b1f] p-6 text-white shadow-[0_48px_140px_rgba(4,17,49,0.6)]">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(116,228,255,0.2),_transparent_55%)]" aria-hidden />
            <div className="absolute inset-x-10 bottom-10 -z-10 h-36 bg-[radial-gradient(circle,_rgba(156,255,0,0.16),_transparent_60%)] blur-3xl" aria-hidden />
            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Plan snapshot</p>
                  <p className="text-3xl font-semibold text-white">
                    {totalCents ? formatCurrency(totalCents, currency) : "Select a destination"}
                  </p>
                  <p className="text-sm text-white/70">
                    {totalCents && activePlan
                      ? `${formatDataLabel(activePlan.dataGb)} GB • ${formatPeriodLabel(activePlan.periodDays)}`
                      : "Use the selector to load tailored partner bundles."}
                  </p>
                </div>
                <Badge className="self-start bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white">
                  {countryName ? `${flagEmoji} ${countryName}` : "Awaiting country"}
                </Badge>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Total due</p>
                    <p className="text-2xl font-semibold text-white">
                      {totalCents ? formatCurrency(totalCents, currency) : "—"}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                      {pricePerDay ? `From ${formatCurrency(pricePerDay, currency)} per day` : "Pick a bundle to see pricing"}
                    </p>
                  </div>
                  {activePlan ? (
                    <Badge className="bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                      {formatDataLabel(activePlan.dataGb)} GB • {formatPeriodLabel(activePlan.periodDays)}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlightPills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/80"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/15" />

              <ol className="space-y-4">
                {checkoutSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.title} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Step {index + 1}</p>
                        <p className="text-sm font-semibold text-white">{step.title}</p>
                        <p className="text-xs text-white/70">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <Button
                size="lg"
                className="w-full justify-between rounded-full bg-[#9cff00] px-8 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[#0b0f1c] shadow-[0_26px_70px_rgba(156,255,0,0.4)] transition hover:bg-[#9cff00]/90"
                onClick={handleViewPackages}
                disabled={!countryCode}
              >
                <span>{countryCode ? "Open stacked checkout" : "Select a country"}</span>
                <span className="text-[#0b0f1c]/70">{countryCode ? "Step 1 of 3" : ""}</span>
              </Button>
              <SheetContent className="sm:max-w-lg">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-[#d0d5ff]/60 bg-[#f5f7ff] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#313754]/60">Destination</p>
                    <p className="mt-2 flex items-center gap-3 text-lg font-semibold text-[#0b0f1c]">
                      <span className="text-2xl" aria-hidden>
                        {flagEmoji}
                      </span>
                      <span>{countryName || "Select a country"}</span>
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-[#d0d5ff]/60 bg-white/95 p-5 shadow-[0_24px_70px_rgba(18,24,63,0.14)]">
                    <Tabs value={String(selectedIndex)} className="w-full">
                      <TabsList className="grid grid-cols-2 gap-2 rounded-full bg-[#eef1ff] p-1">
                        {plans.map((plan, index) => (
                          <TabsTrigger
                            key={plan.slug}
                            value={String(index)}
                            className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#313754]/60 data-[state=active]:bg-white data-[state=active]:text-[#0b0f1c]"
                            onClick={() => setSelectedIndex(index)}
                          >
                            {formatPeriodLabel(plan.periodDays)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {plans.map((plan, index) => (
                        <TabsContent key={plan.slug} value={String(index)} className="space-y-4 pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#313754]/60">Selected plan</p>
                              <p className="text-2xl font-semibold text-[#0b0f1c]">
                                {formatCurrency(Math.ceil(plan.wholesalePriceCents * (1 + markupPct / 100)), currency)}
                              </p>
                            </div>
                            <Badge className="bg-[#ebefff] text-[#1a1f38]">
                              {plan.dataGb} GB • {formatPeriodLabel(plan.periodDays)}
                            </Badge>
                          </div>
                          <Button className="w-full rounded-full bg-[#0f1c46] px-8 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white hover:bg-[#0b1433]" onClick={handleContinue}>
                            Continue to checkout
                          </Button>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>

                  {error ? <p className="text-sm text-[#d12c4f]">{error}</p> : null}
                  {isLoadingPlans ? <p className="text-sm text-[#313754]/70">Loading plans…</p> : null}
                </div>
              </SheetContent>
            </Sheet>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}
