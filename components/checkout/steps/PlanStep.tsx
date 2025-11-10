"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CheckoutPackage } from "../types";

export type PlanStatus = "idle" | "loading" | "ready" | "error";

interface PlanStepProps {
  status: PlanStatus;
  packages: CheckoutPackage[];
  selected?: CheckoutPackage | null;
  onSelect: (pkg: CheckoutPackage) => void;
  onContinue: () => void;
  onRetry: () => void;
  countryName?: string;
}

export function PlanStep({ status, packages, selected, onSelect, onContinue, onRetry, countryName }: PlanStepProps) {
  const currencyFormatter = React.useMemo(() => {
    const currency = selected?.price.currency ?? packages[0]?.price.currency ?? "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  }, [packages, selected]);

  return (
    <div className="space-y-8">
      <CardHeader className="space-y-3 p-0">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-white/40">Plan</div>
        <CardTitle className="text-3xl">Lock in your data</CardTitle>
        <CardDescription className="text-sm text-white/70">
          {countryName
            ? `These plans are live from eSIM Access for ${countryName}. Pick one to continue.`
            : "Pick an eSIM package that fits your trip. You can swap later before paying."}
        </CardDescription>
      </CardHeader>

      {status === "loading" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          <p className="text-sm text-white/60">Pulling plans straight from eSIM Access…</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <div>We couldn’t reach eSIM Access. Retry to load the latest plans.</div>
          <Button variant="ghost" onClick={onRetry} className="text-red-100 hover:bg-red-500/20">
            Retry
          </Button>
        </div>
      ) : null}

      {status === "ready" && packages.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
          No packages are currently available for this destination. Try another country for now.
        </p>
      ) : null}

      {status === "ready" && packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const isSelected = selected?.id === pkg.id;
            const price = currencyFormatter.format(pkg.price.amount / 100);
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onSelect(pkg)}
                className={cn(
                  "flex w-full flex-col gap-4 rounded-3xl border px-5 py-4 text-left transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-px hover:border-white/25 hover:bg-white/10",
                  isSelected
                    ? "border-white/30 bg-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                    : "border-white/10 bg-white/5",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">{pkg.name}</p>
                    <p className="text-sm text-white/70">
                      {pkg.unlimited ? "Unlimited data" : pkg.dataLabel} · {pkg.days} day{pkg.days === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{price}</p>
                    <p className="text-xs uppercase tracking-[0.32em] text-white/50">{pkg.price.currency}</p>
                  </div>
                </div>
                {pkg.dataLabel && !pkg.unlimited ? (
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/60">
                    {pkg.dataLabel}
                  </div>
                ) : null}
                {pkg.unlimited ? (
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white">
                    Unlimited data, fair-use applies.
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <Separator className="border-white/10" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70">
          {selected ? `${selected.name} · ${countryName ?? ""}` : "Select a plan to keep going."}
        </p>
        <Button type="button" disabled={!selected} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
