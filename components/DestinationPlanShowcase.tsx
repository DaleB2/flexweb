"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { NormalizedPlan } from "@/lib/esim";
import PlanSlider, { formatCurrency } from "./PlanSlider";

interface DestinationPlanShowcaseProps {
  countryCode: string;
  countryName: string;
  plans: NormalizedPlan[];
  markupPct: number;
  currency: string;
}

export default function DestinationPlanShowcase({
  countryCode,
  countryName,
  plans,
  markupPct,
  currency,
}: DestinationPlanShowcaseProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activePlan = plans[selectedIndex] ?? plans[0];

  const computedTotal = useMemo(() => {
    if (!activePlan) return null;
    return Math.ceil(activePlan.priceCents * (1 + markupPct / 100));
  }, [activePlan, markupPct]);

  const handleCheckout = () => {
    if (!activePlan || !computedTotal) return;
    const params = new URLSearchParams({
      countryCode,
      country: countryName,
      slug: activePlan.slug,
      packageCode: activePlan.packageCode,
      dataGb: String(activePlan.dataGb),
      periodDays: String(activePlan.periodDays),
      wholesaleCents: String(activePlan.priceCents),
      markupPct: String(markupPct),
      totalCents: String(computedTotal),
      currency,
    });
    router.push(`/checkout?${params.toString()}`);
  };

  if (!activePlan) {
    return (
      <div className="rounded-[32px] border border-white/20 bg-white/80 p-6 text-center text-sm text-midnight/70">
        Plans for this destination are loading. Please refresh.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/95 p-8 text-midnight shadow-[0_35px_110px_rgba(18,7,50,0.25)]">
      <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-fuchsia/30 via-iris/30 to-amber/30 blur-3xl" />
      <div className="relative space-y-8">
        <div className="space-y-2">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-iris/70">Unlimited data</p>
          <h3 className="text-3xl font-bold">Plan your stay in {countryName}.</h3>
          <p className="max-w-2xl text-sm text-midnight/70">
            Tailored data for {countryName}. Choose your data size and trip length, then checkout in seconds with instant QR delivery.
          </p>
        </div>

        <PlanSlider plans={plans} markupPct={markupPct} currency={currency} selectedIndex={selectedIndex} onChange={setSelectedIndex} />

        <div className="flex flex-col gap-4 rounded-[30px] border border-lilac/50 bg-moon/80 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-midnight/40">Total due</p>
            <p className="text-3xl font-bold text-midnight">
              {computedTotal ? formatCurrency(computedTotal, currency) : "—"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-midnight/40">
              Tax, activation, and support included
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="w-full rounded-full bg-gradient-to-r from-iris to-fuchsia px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-[0_22px_70px_rgba(123,60,237,0.45)] transition hover:shadow-[0_26px_80px_rgba(123,60,237,0.6)] sm:w-auto"
          >
            Continue to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
