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

export function formatDataLabel(value: number) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

export function formatPeriodLabel(days: number) {
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
      <div className="rounded-[28px] border border-white/60 bg-white p-6 text-center text-sm font-semibold text-midnight/70">
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
    <div className="space-y-6 text-midnight">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-midnight/40">
          <span>Data package</span>
          <span>{formatDataLabel(active.dataGb)} GB</span>
        </div>

        <div className="flex flex-wrap gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-midnight/60">
          {grouped.map((entries) => {
            const plan = entries[0];
            const isActive = Number(plan.dataGb.toFixed(3)) === activeDataKey;
            return (
              <button
                key={`${plan.slug}-${plan.dataGb}`}
                type="button"
                onClick={() => handleSelectData(entries)}
                className={`rounded-full border px-5 py-2 transition ${
                  isActive
                    ? "border-transparent bg-gradient-to-r from-iris to-fuchsia text-white shadow-[0_15px_45px_rgba(123,60,237,0.35)]"
                    : "border-lilac/40 bg-white text-midnight/70 hover:border-iris/50 hover:text-iris"
                }`}
              >
                <span>{formatDataLabel(plan.dataGb)} GB</span>
                {entries.length > 1 ? (
                  <span className="ml-2 text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-midnight/40">
                    {entries.length} options
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {activeGroup && activeGroup.length > 1 ? (
          <div className="rounded-[26px] border border-lilac/40 bg-white/90 p-5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-midnight/50">Stay length options</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeGroup.map((plan) => {
                const isSelected = plan.originalIndex === selectedIndex;
                return (
                  <button
                    key={`${plan.slug}-${plan.periodDays}-${plan.totalCents}`}
                    type="button"
                    onClick={() => onChange(plan.originalIndex)}
                    className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-transparent bg-gradient-to-r from-iris to-fuchsia text-white shadow-[0_18px_55px_rgba(123,60,237,0.35)]"
                        : "border-lilac/40 bg-moon/80 text-midnight/70 hover:border-iris/50 hover:text-iris"
                    }`}
                  >
                    <span className="text-[0.58rem] font-semibold uppercase tracking-[0.32em]">
                      {formatPeriodLabel(plan.periodDays)}
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(plan.totalCents, currency)}
                    </span>
                    <span
                      className={`text-[0.52rem] font-semibold uppercase tracking-[0.3em] ${
                        isSelected ? "text-white/80" : "text-midnight/50"
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

      <div className="rounded-[30px] border border-white/40 bg-white/90 p-6 shadow-[0_25px_80px_rgba(17,5,45,0.12)]">
        <div className="flex items-center justify-between text-sm font-semibold text-midnight/60">
          <span>{formatPeriodLabel(active.periodDays)} validity</span>
          <span className="text-[0.6rem] uppercase tracking-[0.35em] text-iris/70">Unlimited data</span>
        </div>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-midnight/40">Total</p>
            <p className="text-4xl font-bold text-midnight">{formatCurrency(active.totalCents, currency)}</p>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-midnight/40">
              From {formatCurrency(Math.ceil(active.pricePerDay), currency)} per day
            </p>
          </div>
          <div className="rounded-2xl border border-lilac/50 bg-moon/80 px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-midnight/70">
            {formatDataLabel(active.dataGb)} GB • {formatPeriodLabel(active.periodDays)}
          </div>
        </div>
      </div>
    </div>
  );
}
