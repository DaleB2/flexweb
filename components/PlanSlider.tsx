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

function formatDataLabel(value: number) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function formatPeriodLabel(days: number) {
  return days === 1 ? "1 day" : `${days} days`;
}

export default function PlanSlider({ plans, markupPct, currency, selectedIndex, onChange }: PlanSliderProps) {
  const computed = useMemo(() => {
    return plans.map((plan, index) => {
      const totalCents = Math.ceil(plan.priceCents * (1 + markupPct / 100));
      const pricePerDay = totalCents / plan.periodDays;
      return { ...plan, totalCents, pricePerDay, originalIndex: index };
    });
  }, [plans, markupPct]);

  const grouped = useMemo(() => {
    const buckets = new Map<number, Array<(typeof computed)[number]>>();

    computed.forEach((plan) => {
      const key = Number(plan.dataGb.toFixed(3));
      const existing = buckets.get(key) ?? [];
      existing.push(plan);
      buckets.set(key, existing);
    });

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, entries]) =>
        entries
          .slice()
          .sort((a, b) => a.periodDays - b.periodDays || a.totalCents - b.totalCents),
      );
  }, [computed]);

  const active = computed[selectedIndex] ?? computed[0];

  if (!active) {
    return (
      <div className="rounded-2xl border border-coal/10 bg-coal/5 p-6 text-center text-sm font-semibold text-coal/70">
        Select a destination to view plans.
      </div>
    );
  }

  const activeDataKey = Number(active.dataGb.toFixed(3));
  const activeGroup = grouped.find((entries) => Number(entries[0]?.dataGb.toFixed(3)) === activeDataKey) ?? grouped[0];

  const handleSelectData = (entries: (typeof grouped)[number]) => {
    const existingSelection = entries.find((entry) => entry.originalIndex === selectedIndex);
    const next = existingSelection ?? entries[0];
    if (next) {
      onChange(next.originalIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/50">
          <span>Data package</span>
          <span>{formatDataLabel(active.dataGb)} GB</span>
        </div>

        <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/70">
          {grouped.map((entries) => {
            const plan = entries[0];
            const isActive = Number(plan.dataGb.toFixed(3)) === activeDataKey;
            return (
              <button
                key={`${plan.slug}-${plan.dataGb}`}
                type="button"
                onClick={() => handleSelectData(entries)}
                className={`rounded-full border px-4 py-2 transition ${
                  isActive
                    ? "border-coal bg-coal text-white shadow-[0_12px_30px_rgba(6,8,8,0.35)]"
                    : "border-coal/15 bg-white/80 text-coal hover:border-coal/30"
                }`}
              >
                <span>{formatDataLabel(plan.dataGb)} GB</span>
                {entries.length > 1 ? (
                  <span className="ml-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-coal/50">
                    {entries.length} options
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {activeGroup && activeGroup.length > 1 ? (
          <div className="rounded-2xl border border-coal/10 bg-white/80 p-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-coal/50">Validity</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeGroup.map((plan) => {
                const isSelected = plan.originalIndex === selectedIndex;
                return (
                  <button
                    key={`${plan.slug}-${plan.periodDays}-${plan.totalCents}`}
                    type="button"
                    onClick={() => onChange(plan.originalIndex)}
                    className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-coal bg-coal text-white shadow-[0_12px_30px_rgba(6,8,8,0.35)]"
                        : "border-coal/10 bg-white text-coal hover:border-coal/25"
                    }`}
                  >
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em]">
                      {formatPeriodLabel(plan.periodDays)}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(plan.totalCents, currency)}
                    </span>
                    <span
                      className={`text-[0.55rem] font-semibold uppercase tracking-[0.3em] ${
                        isSelected ? "text-white/70" : "text-coal/60"
                      }`}
                    >
                      {formatCurrency(Math.ceil(plan.pricePerDay), currency)} / day
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-coal/10 bg-white p-5 text-coal shadow-[0_28px_60px_rgba(10,15,17,0.18)]">
        <div className="flex items-center justify-between text-sm font-semibold text-coal/70">
          <span>{formatPeriodLabel(active.periodDays)} validity</span>
          <span className="text-[0.65rem] uppercase tracking-[0.35em] text-coal/40">Unlimited</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/40">Total</p>
            <p className="text-4xl font-black">{formatCurrency(active.totalCents, currency)}</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-coal/40">
              Starts from {formatCurrency(Math.ceil(active.pricePerDay), currency)} / day
            </p>
          </div>
          <div className="rounded-xl bg-mint/40 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-coal">
            {formatDataLabel(active.dataGb)} GB • {formatPeriodLabel(active.periodDays)}
          </div>
        </div>
      </div>
    </div>
  );
}
