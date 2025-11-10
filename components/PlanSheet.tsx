"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Sparkle } from "lucide-react";

import {
  fetchPlans,
  type EsimCountry,
  type EsimPlanVariant,
  type PlanCategory,
} from "@/lib/esimAccess";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface PlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: EsimCountry | null;
  intent: PlanCategory;
  onConfirm: (plan: EsimPlanVariant) => void;
}

const categories: Array<{ key: PlanCategory; label: string; helper: string }> = [
  {
    key: "unlimited",
    label: "Unlimited data",
    helper: "Best for heavy users",
  },
  {
    key: "metered",
    label: "Pay per GB",
    helper: "Metered data allowances",
  },
];

export default function PlanSheet({ open, onOpenChange, country, intent, onConfirm }: PlanSheetProps) {
  const [plans, setPlans] = useState<EsimPlanVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PlanCategory>(intent);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!country || !open) return;

    let cancelled = false;
    async function loadPlans() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPlans(country.code);
        if (!cancelled) {
          setPlans(response);
          if (response.length > 0) {
            const initial = response.find((plan) => plan.category === intent) ?? response[0];
            setActiveCategory(initial.category);
            setSelectedPlan(initial.slug);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("We couldn't load plans right now. Please try again in a moment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [country, open, intent]);

  useEffect(() => {
    if (!open) {
      setSelectedPlan(null);
    }
  }, [open]);

  useEffect(() => {
    setActiveCategory(intent);
  }, [intent]);

  const filteredPlans = useMemo(() => plans.filter((plan) => plan.category === activeCategory), [plans, activeCategory]);

  const activeSelection = filteredPlans.find((plan) => plan.slug === selectedPlan) ?? filteredPlans[0];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-2xl rounded-t-[32px] border border-white/10 bg-slate-900/95 p-6 text-white shadow-[0_-20px_80px_rgba(15,23,42,0.35)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[32px]">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold uppercase tracking-[0.34em] text-white/80">
              Select plan
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-sm text-white/60 transition hover:text-white">Close</button>
            </Dialog.Close>
          </div>
          <p className="mt-2 text-sm text-white/60">
            {country ? `Plans for ${country.name}` : "Choose a destination to view available plans."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={cn(
                  "flex flex-col rounded-2xl border px-4 py-3 text-left transition",
                  "border-white/10 bg-white/5 text-white/70 hover:border-white/40 hover:text-white",
                  activeCategory === category.key && "border-white/60 bg-white/15 text-white",
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.32em]">{category.label}</span>
                <span className="text-[0.7rem] text-white/60">{category.helper}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {loading && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-white/60" />
                <span className="text-sm text-white/70">Loading plans…</span>
              </div>
            )}
            {error && !loading && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
            )}
            {!loading && !error && filteredPlans.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                No plans available for this category right now.
              </div>
            )}
            {!loading && !error &&
              filteredPlans.map((plan) => {
                const selected = plan.slug === activeSelection?.slug;
                const perDay = plan.retailCents / plan.periodDays / 100;

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
                    onClick={() => setSelectedPlan(plan.slug)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition",
                      "border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10",
                      selected && "border-white/70 bg-white/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.32em] text-white/60">{plan.title}</p>
                        <h3 className="text-2xl font-semibold">{plan.dataLabel}</h3>
                        <p className="text-xs text-white/60">
                          {plan.periodDays} day{plan.periodDays === 1 ? "" : "s"} • {plan.currency}
                        </p>
                        {plan.notes && <p className="text-xs text-white/50">{plan.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold">
                          {(plan.retailCents / 100).toLocaleString(undefined, {
                            style: "currency",
                            currency: plan.currency,
                          })}
                        </p>
                        <p className="text-xs text-white/60">≈ {perDay.toFixed(2)} {plan.currency}/day</p>
                      </div>
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
          </div>

          <Separator className="my-6 border-white/10" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Sparkle className="h-4 w-4 text-truelyLime" />
              {activeSelection ? (
                <span>
                  {activeSelection.dataLabel} • {activeSelection.periodDays} days •
                  {(activeSelection.retailCents / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: activeSelection.currency,
                  })}
                </span>
              ) : (
                <span>Pick a plan to continue</span>
              )}
            </div>
            <Button
              disabled={!activeSelection}
              onClick={() => {
                if (activeSelection) {
                  onConfirm(activeSelection);
                }
              }}
              className="rounded-full px-6 py-5 text-sm font-semibold uppercase tracking-[0.34em]"
            >
              Continue
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
