"use client";

import { useMemo } from "react";
import type { NormalizedPlan } from "@/lib/esim";

interface PlanSliderProps {
  plans: NormalizedPlan[];
  markupPct: number;
  currency: string;
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function formatCurrency(valueInCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(valueInCents / 100);
}

export default function PlanSlider({ plans, markupPct, currency, selectedIndex, onChange }: PlanSliderProps) {
  const computed = useMemo(() => {
    return plans.map((plan) => {
      const totalCents = Math.ceil(plan.priceCents * (1 + markupPct / 100));
      const pricePerDay = totalCents / plan.periodDays;
      return { ...plan, totalCents, pricePerDay };
    });
  }, [plans, markupPct]);

  const active = computed[selectedIndex];

  if (!active) {
    return (
      <div className="rounded-2xl bg-white/80 p-6 text-center text-sm font-semibold text-bottle/60 shadow-inner">
        Select a destination to view plans.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-bottle/60">
          <span>Data Amount</span>
          <span>{active.dataGb.toFixed(active.dataGb % 1 === 0 ? 0 : 1)} GB</span>
        </div>
        <input
          type="range"
          min={0}
          max={plans.length - 1}
          value={selectedIndex}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-3 w-full accent-mint"
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-bottle/70">
          {computed.map((plan, index) => (
            <button
              key={`${plan.slug}-${plan.dataGb}`}
              type="button"
              onClick={() => onChange(index)}
              className={`rounded-full border px-4 py-1 transition ${
                index === selectedIndex
                  ? "border-bottle bg-bottle text-white"
                  : "border-transparent bg-white/70 text-bottle hover:bg-white/90"
              }`}
            >
              {plan.dataGb.toFixed(plan.dataGb % 1 === 0 ? 0 : 1)} GB
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white/90 p-5 shadow-card">
        <div className="flex items-center justify-between text-sm font-semibold text-bottle/70">
          <span>{active.periodDays} days validity</span>
          <span className="text-xs uppercase tracking-[0.25em] text-bottle/50">Unlimited</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bottle/50">Total</p>
            <p className="text-4xl font-extrabold text-bottle">{formatCurrency(active.totalCents, currency)}</p>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-bottle/40">
              Starts from {formatCurrency(Math.ceil(active.pricePerDay), currency)} / day
            </p>
          </div>
          <div className="rounded-xl bg-mint/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-bottle">
            {active.dataGb.toFixed(active.dataGb % 1 === 0 ? 0 : 1)} GB • {active.periodDays} days
          </div>
        </div>
      </div>
    </div>
  );
}
