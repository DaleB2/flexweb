"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      const totalCents = Math.ceil(plan.wholesalePriceCents * (1 + markupPct / 100));
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
      <Card className="border-dashed border-truelySky/30 bg-white/80 p-6 text-center text-sm text-truelyNavy/60 shadow-none">
      <Card className="border-dashed border-[#d0d5ff]/60 bg-white/80 p-6 text-center text-sm text-[#313754]/70 shadow-none">
        Select a destination to view plans.
      </Card>
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-truelyNavy/50">Choose data</p>
          <p className="text-sm font-semibold text-truelyNavy">Pick what matches your trip.</p>
        </div>
        <Badge className="bg-truelyMint/70 text-truelyNavy">{formatDataLabel(active.dataGb)} GB</Badge>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#313754]/60">Choose data</p>
          <p className="text-sm font-semibold text-[#0b0f1c]">Pick what matches your trip.</p>
        </div>
        <Badge className="bg-[#ebefff] text-[#1a1f38]">{formatDataLabel(active.dataGb)} GB</Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {grouped.map((entries) => {
          const plan = entries[0];
          const isActive = Number(plan.dataGb.toFixed(3)) === activeDataKey;
          return (
            <Button
              key={`${plan.slug}-${plan.dataGb}`}
              type="button"
              variant="outline"
              className={`h-auto flex-col gap-1 rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.28em] ${
                isActive
                  ? "border-transparent bg-truelyLime text-truelyNavy shadow-[0_16px_45px_rgba(156,255,0,0.35)]"
                  : "border-truelySky/40 bg-white text-truelyNavy/70"
              variant={isActive ? "default" : "outline"}
              className={`h-auto flex-col gap-1 rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.28em] ${
                isActive ? "from-[#74e4ff] via-[#5360ff] to-[#6f3]" : "border-[#d0d5ff]/60 text-[#313754]"
              }`}
              onClick={() => handleSelectData(entries)}
            >
              <span>{formatDataLabel(plan.dataGb)} GB</span>
              {entries.length > 1 ? <span className="text-[0.6rem] font-medium normal-case">{entries.length} durations</span> : null}
            </Button>
          );
        })}
      </div>

      {activeGroup && activeGroup.length > 0 ? (
        <div className="space-y-3 rounded-3xl border border-truelySky/30 bg-white/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-truelyNavy/50">Stay length</p>
        <div className="space-y-3 rounded-3xl border border-[#d0d5ff]/60 bg-white/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#313754]/60">Stay length</p>
          <div className="grid gap-3">
            {activeGroup.map((plan) => {
              const isSelected = plan.originalIndex === selectedIndex;
              return (
                <button
                  key={`${plan.slug}-${plan.periodDays}-${plan.totalCents}`}
                  type="button"
                  onClick={() => onChange(plan.originalIndex)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-transparent bg-truelyLime text-truelyNavy shadow-[0_20px_60px_rgba(156,255,0,0.35)]"
                      : "border-truelySky/30 bg-white text-truelyNavy hover:border-truelySky/40"
                  }`}
                >
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${isSelected ? "text-truelyNavy/70" : "text-truelyNavy/50"}`}>
                      ? "border-transparent bg-gradient-to-r from-[#74e4ff] via-[#5360ff] to-[#6f3] text-white shadow-[0_18px_55px_rgba(83,96,255,0.35)]"
                      : "border-[#d0d5ff]/60 bg-white text-[#0b0f1c] hover:border-[#74e4ff]/60"
                  }`}
                >
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${isSelected ? "text-white/80" : "text-[#313754]/60"}`}>
                      {formatPeriodLabel(plan.periodDays)}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(plan.totalCents, currency)}
                    </p>
                  </div>
                  <div className={`text-right text-xs font-semibold uppercase tracking-[0.3em] ${isSelected ? "text-truelyNavy/70" : "text-truelyNavy/50"}`}>
                  <div className={`text-right text-xs font-semibold uppercase tracking-[0.3em] ${isSelected ? "text-white/80" : "text-[#313754]/60"}`}>
                    {formatCurrency(Math.ceil(plan.pricePerDay), currency)} / day
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <Card className="border-truelySky/30 bg-white p-6 shadow-[0_20px_70px_rgba(5,25,71,0.12)]">
        <div className="flex items-center justify-between text-sm font-semibold text-truelyNavy/70">
          <span>{formatPeriodLabel(active.periodDays)} validity</span>
          <span className="text-xs uppercase tracking-[0.3em] text-truelySky">Instant QR delivery</span>
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-truelyNavy/50">Total</p>
            <p className="text-3xl font-semibold text-truelyNavy">{formatCurrency(active.totalCents, currency)}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-truelyNavy/50">
              From {formatCurrency(Math.ceil(active.pricePerDay), currency)} per day
            </p>
          </div>
          <Badge className="self-start bg-truelyMint/70 text-truelyNavy">
      <Card className="border-[#d0d5ff]/60 bg-white p-6 shadow-[0_16px_60px_rgba(20,24,53,0.1)]">
        <div className="flex items-center justify-between text-sm font-semibold text-[#313754]/70">
          <span>{formatPeriodLabel(active.periodDays)} validity</span>
          <span className="text-xs uppercase tracking-[0.3em] text-[#74e4ff]">Instant QR delivery</span>
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#313754]/60">Total</p>
            <p className="text-3xl font-semibold text-[#0b0f1c]">{formatCurrency(active.totalCents, currency)}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#313754]/60">
              From {formatCurrency(Math.ceil(active.pricePerDay), currency)} per day
            </p>
          </div>
          <Badge className="self-start bg-[#ebefff] text-[#1a1f38]">
            {formatDataLabel(active.dataGb)} GB • {formatPeriodLabel(active.periodDays)}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
