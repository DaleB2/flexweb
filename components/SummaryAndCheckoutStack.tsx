"use client";

import type { ReactNode } from "react";

import type { EsimCountry, EsimPlan } from "@/lib/esimAccess";

type Props = {
  country: EsimCountry;
  plan: EsimPlan;
  totalCents: number;
  currency: string;
  stepLabel: string;
  onBack?: () => void;
  children: ReactNode;
};

export default function SummaryAndCheckoutStack({
  country,
  plan,
  totalCents,
  currency,
  stepLabel,
  onBack,
  children,
}: Props) {
  const perDay = plan.periodDays ? Math.ceil(totalCents / plan.periodDays) : totalCents;

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <article className="relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.36em] text-white/60">
          <span>Destination</span>
          <span>{country.code}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <span>{country.flagEmoji}</span>
            <span>{country.name}</span>
          </div>
          <p className="text-sm text-white/70">{plan.dataLabel} • {plan.periodDays} days</p>
        </div>
        <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.36em] text-white/50">Total due</p>
          <p className="text-3xl font-semibold">
            {(totalCents / 100).toLocaleString(undefined, { style: "currency", currency })}
          </p>
          <p className="text-xs text-white/60">≈ {(perDay / 100).toLocaleString(undefined, { style: "currency", currency })} per day</p>
        </div>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-center gap-2"><span className="text-truelyLime">•</span> Instant email delivery</li>
          <li className="flex items-center gap-2"><span className="text-truelyLime">•</span> Works on unlocked devices</li>
          <li className="flex items-center gap-2"><span className="text-truelyLime">•</span> Manage from your Flex dashboard</li>
        </ul>
      </article>

      <article className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white p-0 text-[#061031] shadow-[0_32px_120px_rgba(6,16,49,0.28)]">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Checkout</p>
            <h3 className="pt-1 text-xl font-semibold text-[#061031]">Secure payment</h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Step</p>
            <p className="text-xs font-semibold text-[#061031]">{stepLabel}</p>
          </div>
        </header>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-6 top-5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-[#061031] hover:text-[#061031]"
          >
            ← Back
          </button>
        )}

        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </article>
    </div>
  );
}
