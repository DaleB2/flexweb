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
      <div className="rounded-3xl border border-slate-200 bg-nurse p-6 text-center text-sm text-slate-600">
        Plans for this destination are loading. Please refresh.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 rounded-[2.5rem] border border-slate-200 bg-white p-8 text-slate-900 shadow-card">
      <div className="space-y-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-slate-500">Unlimited data</p>
        <h3 className="text-2xl font-semibold">Plan your stay in {countryName}.</h3>
        <p className="text-sm text-slate-600">
          Choose the data size and duration that fits your trip. Every order lands instantly with setup steps and a quick culture brief.
        </p>
      </div>

      <PlanSlider plans={plans} markupPct={markupPct} currency={currency} selectedIndex={selectedIndex} onChange={setSelectedIndex} />

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-nurse p-6">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total due</span>
          <span>{computedTotal ? formatCurrency(computedTotal, currency) : "—"}</span>
        </div>
        <p className="text-sm text-slate-500">Tax, activation, and local support are already included.</p>
        <button
          type="button"
          onClick={handleCheckout}
          className="rounded-[1.75rem] bg-coal px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-coal/90"
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
}
