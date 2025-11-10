"use client";

import { useEffect, useMemo, useState } from "react";

import type { EsimCountry, EsimPlan } from "@/lib/esimAccess";

type Props = {
  country: EsimCountry;
  open: boolean;
  onClose: () => void;
  onConfirm: (plan: EsimPlan) => void;
  markupPct?: number;
  planType?: "unlimited" | "metered";
};

type PlanState = {
  plans: EsimPlan[];
  loading: boolean;
  error?: string;
};

export default function PlanSheet({ country, open, onClose, onConfirm, markupPct, planType }: Props) {
  const [state, setState] = useState<PlanState>({ plans: [], loading: true });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setState({ plans: [], loading: true });
    });

    const controller = new AbortController();

    const query = new URLSearchParams({
      ...(markupPct ? { markupPct: String(markupPct) } : {}),
    }).toString();

    const url = query ? `/api/esim/plans/${country.code}?${query}` : `/api/esim/plans/${country.code}`;

    fetch(url, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load plans");
        return response.json();
      })
      .then((payload: { plans: EsimPlan[] }) => {
        if (cancelled) return;
        setState({ plans: payload.plans, loading: false });
        setSelectedSlug(payload.plans[0]?.slug ?? null);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ plans: [], loading: false, error: "Unable to fetch plans right now" });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [country.code, markupPct, open]);

  const filteredPlans = useMemo(() => {
    if (!planType) return state.plans;
    return state.plans.filter((plan) => {
      const isUnlimited = plan.dataLabel.toLowerCase().includes("unlimited");
      return planType === "unlimited" ? isUnlimited : !isUnlimited;
    });
  }, [planType, state.plans]);

  useEffect(() => {
    if (!filteredPlans.some((plan) => plan.slug === selectedSlug)) {
      queueMicrotask(() => {
        setSelectedSlug(filteredPlans[0]?.slug ?? null);
      });
    }
  }, [filteredPlans, selectedSlug]);

  const selectedPlan = useMemo(
    () => filteredPlans.find((plan) => plan.slug === selectedSlug) ?? null,
    [selectedSlug, filteredPlans],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8 pt-24 sm:items-center">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A142C] text-white shadow-[0_48px_120px_rgba(10,20,44,0.65)]">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-white/50">{country.flagEmoji} {country.name}</p>
            <h3 className="pt-1 text-xl font-semibold">Pick your plan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.32em] text-white/60 transition hover:border-white/25 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-6">
          {state.loading && <p className="text-sm text-white/70">Loading plans…</p>}
          {state.error && <p className="text-sm text-red-300">{state.error}</p>}

          {!state.loading && !state.error && (
            <div className="space-y-3">
              {filteredPlans.map((plan) => {
                const isActive = plan.slug === selectedSlug;
                const perDay = plan.periodDays ? Math.ceil(plan.retailCents / plan.periodDays) : plan.retailCents;
                return (
                  <button
                    key={plan.slug}
                    type="button"
                    onClick={() => setSelectedSlug(plan.slug)}
                    className={`flex w-full flex-col gap-2 rounded-3xl border px-5 py-4 text-left transition ${
                      isActive
                        ? "border-truelyLime bg-truelyLime/15 shadow-[0_24px_70px_rgba(156,255,0,0.25)]"
                        : "border-white/10 bg-white/5 hover:border-truelyLime/60 hover:bg-truelyLime/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{plan.dataLabel}</span>
                      <span>
                        {(plan.retailCents / 100).toLocaleString(undefined, {
                          style: "currency",
                          currency: plan.currency,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{plan.periodDays} days</span>
                      <span>≈ {(perDay / 100).toLocaleString(undefined, { style: "currency", currency: plan.currency })} / day</span>
                    </div>
                  </button>
                );
              })}
              {filteredPlans.length === 0 && (
                <p className="text-sm text-white/70">No plans available for this filter.</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/5 bg-white/5 px-6 py-4">
          <button
            type="button"
            disabled={!selectedPlan}
            onClick={() => selectedPlan && onConfirm(selectedPlan)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-truelyLime px-6 py-3 text-sm font-semibold uppercase tracking-[0.36em] text-[#061031] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
