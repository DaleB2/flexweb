"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CountryPickerCard, { type PlanIntent } from "@/components/CountryPickerCard";
import PlanSheet from "@/components/PlanSheet";
import SummaryAndCheckoutStack, {
  type CheckoutSelection,
  type CheckoutStep,
} from "@/components/SummaryAndCheckoutStack";
import { Badge } from "@/components/ui/badge";
import type { EsimCountry, EsimPlanVariant, PlanCategory } from "@/lib/esimAccess";
import type { SuccessPayload } from "@/components/SuccessCard";

const heroBenefits = [
  "Best network guarantee",
  "Switchless activation",
  "Hotspot & tethering",
  "Visa, Apple Pay & Google Pay",
];

const highlightStats = [
  { label: "Countries", value: "200+" },
  { label: "Activation", value: "Instant" },
  { label: "Support", value: "24/7" },
];

const featureCards = [
  {
    title: "Roam like a local",
    description: "Unlimited data on top partner networks in 200+ destinations with no surprise charges.",
  },
  {
    title: "Keep your number",
    description: "Stay on iMessage and WhatsApp with your existing SIM while Flex powers your data.",
  },
  {
    title: "Five minute setup",
    description: "Purchase, scan the QR we email instantly, and you’re live before wheels down.",
  },
  {
    title: "One account everywhere",
    description: "Manage all of your eSIMs, top ups, and receipts from a single Truely-style dashboard.",
  },
];

const destinationShowcase = [
  "United States",
  "United Kingdom",
  "Japan",
  "Spain",
  "Thailand",
  "Portugal",
  "Germany",
  "Mexico",
  "Turkey",
  "Italy",
  "France",
  "Greece",
];

const comparisons = [
  { label: "Single global eSIM", flex: true, roaming: false, tourist: false },
  { label: "Pay-as-you-go flexibility", flex: true, roaming: false, tourist: false },
  { label: "No expiration", flex: true, roaming: false, tourist: false },
  { label: "Fixed data plans", flex: true, roaming: true, tourist: true },
  { label: "Affordable pricing", flex: true, roaming: false, tourist: false },
  { label: "International voice calls", flex: true, roaming: true, tourist: false },
];

const faqs = [
  {
    question: "What is an eSIM?",
    answer:
      "An eSIM is a digital SIM that lets you activate a cellular plan without a physical SIM card. Scan the QR code we send after checkout to get online instantly.",
  },
  {
    question: "How do I set it up?",
    answer:
      "Setup is simple: purchase a plan, scan the QR delivered to your inbox, and follow the on-device steps. The Flex app guides you if you need help.",
  },
  {
    question: "Can I keep my number?",
    answer:
      "Yes. Your existing phone number stays active for calls and messaging while your Flex eSIM handles data.",
  },
  {
    question: "Is hotspotting allowed?",
    answer: "Absolutely. Share data with laptops, tablets, and friends without extra fees.",
  },
];

type StepParam = CheckoutStep | "select";

function parseSelection(params: URLSearchParams): CheckoutSelection | null {
  const countryName = params.get("country");
  const countryCode = params.get("countryCode");
  const planSlug = params.get("planSlug");
  const totalCents = params.get("totalCents");
  const currency = params.get("currency");
  const periodDays = params.get("periodDays");
  const dataLabel = params.get("dataLabel");
  if (!countryName || !countryCode || !planSlug || !totalCents || !currency || !periodDays || !dataLabel) {
    return null;
  }

  const selection: CheckoutSelection = {
    countryName,
    countryCode,
    countryFlag: params.get("countryFlag") ?? undefined,
    plan: {
      slug: planSlug,
      dataLabel,
      periodDays: Number(periodDays),
      retailCents: Number(totalCents),
      currency,
      wholesaleCents: Number(params.get("wholesaleCents") ?? "0"),
      markupPct: Number(params.get("markupPct") ?? "0"),
      notes: params.get("planNotes") ?? undefined,
      dataGb: params.get("dataGb") ? Number(params.get("dataGb")) : undefined,
      title: params.get("planTitle") ?? undefined,
      category: (params.get("planCategory") as PlanCategory | null) ?? undefined,
    },
  };

  return selection;
}

function formatCountryFromSelection(selection: CheckoutSelection | null): EsimCountry | null {
  if (!selection) return null;
  return {
    code: selection.countryCode,
    name: selection.countryName,
    flagEmoji: selection.countryFlag,
  };
}

export default function CheckoutFlow() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [planIntent, setPlanIntent] = useState<PlanIntent>("unlimited");
  const [sheetCountry, setSheetCountry] = useState<EsimCountry | null>(null);
  const [order, setOrder] = useState<SuccessPayload | null>(null);

  const stepParam = (searchParams.get("step") as StepParam) ?? "select";
  const emailParam = searchParams.get("email") ?? undefined;
  const existingCustomer = searchParams.get("existing") === "true";

  const selection = useMemo(() => parseSelection(new URLSearchParams(searchParams.toString())), [searchParams]);
  const selectedCountry = sheetCountry ?? formatCountryFromSelection(selection);
  const intentForUi = (selection?.plan.category as PlanIntent | undefined) ?? planIntent;

  const updateParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutator(next);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handlePlanIntent = (country: EsimCountry, intent: PlanIntent) => {
    setSheetCountry(country);
    setPlanIntent(intent);
    setPlanSheetOpen(true);
  };

  const handlePlanConfirm = (plan: EsimPlanVariant) => {
    const country = sheetCountry ?? formatCountryFromSelection(selection);
    if (!country) return;
    updateParams((params) => {
      params.set("country", country.name);
      params.set("countryCode", country.code);
      if (country.flagEmoji) params.set("countryFlag", country.flagEmoji);
      params.set("planSlug", plan.slug);
      params.set("planTitle", plan.title ?? plan.dataLabel);
      params.set("dataLabel", plan.dataLabel);
      if (plan.dataGb != null) params.set("dataGb", String(plan.dataGb));
      else params.delete("dataGb");
      params.set("periodDays", String(plan.periodDays));
      params.set("wholesaleCents", String(plan.wholesaleCents));
      params.set("markupPct", String(plan.markupPct));
      params.set("totalCents", String(plan.retailCents));
      params.set("currency", plan.currency);
      params.set("planCategory", plan.category);
      if (plan.notes) params.set("planNotes", plan.notes);
      else params.delete("planNotes");
      params.set("step", "summary");
      params.delete("email");
      params.delete("existing");
    });
    setOrder(null);
    setPlanIntent(plan.category as PlanIntent);
    setPlanSheetOpen(false);
  };

  const handleCloseStack = () => {
    updateParams((params) => {
      params.set("step", "select");
    });
  };

  const handleProceedToEmail = () => {
    updateParams((params) => {
      params.set("step", "email");
    });
  };

  const handleEmailIdentified = ({ email, exists }: { email: string; exists: boolean }) => {
    updateParams((params) => {
      params.set("email", email);
      params.set("existing", String(exists));
      params.set("step", exists ? "login" : "payment");
    });
  };

  const handleLoginSuccess = () => {
    updateParams((params) => {
      params.set("step", "payment");
      params.set("existing", "true");
    });
  };

  const handlePaymentSuccess = (payload: SuccessPayload) => {
    setOrder(payload);
    updateParams((params) => {
      params.set("step", "success");
    });
  };

  const handleBackToSummary = () => {
    updateParams((params) => {
      params.set("step", "summary");
    });
  };

  const handleBackToEmail = () => {
    updateParams((params) => {
      params.set("step", "email");
    });
  };

  const handleBackToPlan = () => {
    updateParams((params) => {
      params.set("step", "select");
    });
    if (selection) {
      setSheetCountry(formatCountryFromSelection(selection));
      setPlanSheetOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 flex flex-col gap-28 pb-28 pt-28">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1522149374751-76d3c53f625a?auto=format&fit=crop&w=1800&q=80"
              alt="Blue sky with clouds"
              fill
              priority
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-heroOverlay" />
            <div className="absolute inset-x-0 top-10 -z-10 h-80 bg-heroHalo blur-3xl" />
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex-1 space-y-6 text-white">
              <Badge className="bg-white/20 text-white">Truely Switchless</Badge>
              <h1 className="text-4xl font-semibold leading-tight sm:text-[3.4rem]">
                Unlimited internet that travels with you.
              </h1>
              <p className="max-w-xl text-lg text-white/85">
                Truely Switchless keeps you online in over 200 countries. Pick a destination, preview unlimited plans, and glide through the stacked checkout just like the original site.
              </p>
              <div className="flex flex-wrap gap-2">
                {heroBenefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/80"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-8 pt-6 text-white/80">
                {highlightStats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.36em]">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="#plans"
                  className="rounded-full bg-truelyLime px-10 py-3 text-sm font-semibold uppercase tracking-[0.36em] text-truelyNavy shadow-[0_24px_70px_rgba(156,255,0,0.35)] transition hover:shadow-[0_28px_90px_rgba(156,255,0,0.5)]"
                >
                  View packages
                </Link>
                <Link
                  href="#destinations"
                  className="rounded-full border border-white/30 px-10 py-3 text-sm font-semibold uppercase tracking-[0.36em] text-white/80 transition hover:border-white hover:text-white"
                >
                  Popular regions
                </Link>
              </div>
            </div>

            <div className="flex w-full max-w-lg shrink-0 flex-col gap-6">
              <CountryPickerCard
                selectedCountry={selectedCountry ?? undefined}
                intent={intentForUi}
                onPlanIntent={handlePlanIntent}
              />
            </div>
          </div>
        </section>

        <section id="plans" className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-5">
                <Badge className="bg-white/20 text-white">How it works</Badge>
                <h2 className="text-3xl font-semibold">Slide into Truely&apos;s stacked checkout</h2>
                <p className="text-sm text-white/70">
                  Pick a destination on the hero card, explore real plan variants, and move through summary, email, login, and payment without leaving the screen.
                </p>
                <div className="space-y-4">
                  {featureCards.map((feature) => (
                    <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-white/70">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                  <h3 className="text-xl font-semibold text-white">Stacked state machine</h3>
                  <p>
                    Every step is modeled with <code className="rounded bg-white/10 px-1">?step=</code> query params. Go back anytime without losing your country or plan.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                  <h3 className="text-xl font-semibold text-white">Inline authentication</h3>
                  <p>
                    Returning travelers see a password prompt instantly. New guests skip straight to secure payment and receive their invite after checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="destinations" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white">Popular regions</Badge>
              <h2 className="text-3xl font-semibold">Destinations our travelers love</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/70 md:grid-cols-3">
                {destinationShowcase.map((destination) => (
                  <div key={destination} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    {destination}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
            <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:items-center">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white">Comparison</Badge>
                <h2 className="text-3xl font-semibold">Why Flex feels like Truely</h2>
                <p className="text-sm text-white/70">
                  We modeled the experience around Truely’s stacked cards. Inline authentication, preserved state, and payment all stay on one hero.
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.36em] text-white/60">
                    <tr>
                      <th className="px-4 py-3">Feature</th>
                      <th className="px-4 py-3">Flex</th>
                      <th className="px-4 py-3">Roaming SIM</th>
                      <th className="px-4 py-3">Tourist kiosk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr key={row.label} className="border-t border-white/10">
                        <td className="px-4 py-3 text-white">{row.label}</td>
                        <td className="px-4 py-3 text-truelyLime">{row.flex ? "Yes" : "—"}</td>
                        <td className="px-4 py-3">{row.roaming ? "Yes" : "—"}</td>
                        <td className="px-4 py-3">{row.tourist ? "Yes" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white">FAQ</Badge>
              <h2 className="text-3xl font-semibold">Questions travelers ask</h2>
              <div className="grid gap-4">
                {faqs.map((faq) => (
                  <details key={faq.question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <summary className="cursor-pointer text-lg font-semibold text-white">{faq.question}</summary>
                    <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PlanSheet
        open={planSheetOpen}
        onOpenChange={setPlanSheetOpen}
        country={selectedCountry ?? null}
        intent={intentForUi as PlanCategory}
        onConfirm={handlePlanConfirm}
      />

      <SummaryAndCheckoutStack
        visible={stepParam !== "select" && !!selection}
        step={(stepParam === "select" ? "summary" : stepParam) as CheckoutStep}
        selection={selection}
        email={emailParam}
        existingCustomer={existingCustomer}
        order={order}
        onClose={handleCloseStack}
        onProceedToEmail={handleProceedToEmail}
        onEmailIdentified={handleEmailIdentified}
        onLoginSuccess={handleLoginSuccess}
        onPaymentSuccess={handlePaymentSuccess}
        onBackToSummary={handleBackToSummary}
        onBackToEmail={handleBackToEmail}
        onBackToPlan={handleBackToPlan}
      />
    </div>
  );
}
