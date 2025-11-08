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
      <div className="rounded-2xl border border-coal/10 bg-coal/5 p-6 text-center text-sm font-semibold text-coal/70">
        Select a destination to view plans.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/50">
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
        <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/60">
          {computed.map((plan, index) => (
            <button
              key={`${plan.slug}-${plan.dataGb}`}
              type="button"
              onClick={() => onChange(index)}
              className={`rounded-full border px-4 py-1 transition ${
                index === selectedIndex
                  ? "border-coal bg-coal text-white shadow-[0_10px_25px_rgba(6,8,8,0.25)]"
                  : "border-coal/10 bg-white/70 text-coal hover:bg-white"
              }`}
            >
              {plan.dataGb.toFixed(plan.dataGb % 1 === 0 ? 0 : 1)} GB
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-coal/10 bg-white p-5 shadow-[0_25px_60px_rgba(9,41,39,0.15)]">
        <div className="flex items-center justify-between text-sm font-semibold text-coal/70">
          <span>{active.periodDays} days validity</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-coal/40">Unlimited</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/40">Total</p>
            <p className="text-4xl font-black text-coal">{formatCurrency(active.totalCents, currency)}</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/40">
              Starts from {formatCurrency(Math.ceil(active.pricePerDay), currency)} / day
            </p>
          </div>
          <div className="rounded-xl bg-mint/40 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-coal">
            {active.dataGb.toFixed(active.dataGb % 1 === 0 ? 0 : 1)} GB • {active.periodDays} days
          </div>
        </div>
      </div>
    </div>
  );
}
