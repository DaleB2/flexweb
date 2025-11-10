"use client";

import { useMemo } from "react";
import { ArrowLeft, ShieldCheck, Sparkle } from "lucide-react";

import type { EsimPlanVariant, PlanCategory } from "@/lib/esimAccess";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmailCapture from "@/components/EmailCapture";
import PasswordLogin from "@/components/PasswordLogin";
import StripePayment from "@/components/StripePayment";
import SuccessCard, { type SuccessPayload } from "@/components/SuccessCard";

export type CheckoutStep = "summary" | "email" | "login" | "payment" | "success";

export interface CheckoutSelection {
  countryCode: string;
  countryName: string;
  countryFlag?: string;
  plan: Pick<EsimPlanVariant, "slug" | "dataLabel" | "periodDays" | "retailCents" | "currency" | "wholesaleCents" | "markupPct" | "notes"> & {
    dataGb?: number;
    title?: string;
    category?: PlanCategory;
  };
}

export interface SummaryAndCheckoutStackProps {
  visible: boolean;
  step: CheckoutStep;
  selection: CheckoutSelection | null;
  email?: string;
  existingCustomer?: boolean;
  order?: SuccessPayload | null;
  onClose: () => void;
  onProceedToEmail: () => void;
  onEmailIdentified: (payload: { email: string; exists: boolean }) => void;
  onLoginSuccess: () => void;
  onPaymentSuccess: (payload: SuccessPayload) => void;
  onBackToSummary: () => void;
  onBackToEmail: () => void;
  onBackToPlan: () => void;
}

export default function SummaryAndCheckoutStack({
  visible,
  step,
  selection,
  email,
  existingCustomer,
  order,
  onClose,
  onProceedToEmail,
  onEmailIdentified,
  onLoginSuccess,
  onPaymentSuccess,
  onBackToSummary,
  onBackToEmail,
  onBackToPlan,
}: SummaryAndCheckoutStackProps) {
  const formattedTotal = useMemo(() => {
    if (!selection) return "";
    return (selection.plan.retailCents / 100).toLocaleString(undefined, {
      style: "currency",
      currency: selection.plan.currency,
    });
  }, [selection]);

  const dayRate = useMemo(() => {
    if (!selection) return "";
    const perDay = selection.plan.retailCents / selection.plan.periodDays / 100;
    return `${perDay.toFixed(2)} ${selection.plan.currency}/day`;
  }, [selection]);

  if (!selection) return null;

  const renderRightCard = () => {
    switch (step) {
      case "summary":
        return (
          <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.34em] text-white/60">Checkout</p>
              <Button variant="ghost" size="icon" className="rounded-full text-white/60 hover:text-white" onClick={onClose}>
                ×
              </Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Ready to checkout?</h3>
              <p className="text-sm text-white/70">
                We keep things stacked in place. Confirm the plan details on the left, then continue with your email to finish.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-truelyLime" />
                Secure payment powered by Stripe
              </div>
              <div className="flex items-center gap-2">
                <Sparkle className="h-4 w-4 text-truelyLime" />
                Accounts are created automatically after checkout
              </div>
            </div>
            <Button
              onClick={onProceedToEmail}
              className="mt-auto rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.34em]"
            >
              Continue with email
            </Button>
          </div>
        );
      case "email":
        return (
          <EmailCapture
            email={email ?? ""}
            onBack={onBackToPlan}
            onEmailIdentified={onEmailIdentified}
          />
        );
      case "login":
        return <PasswordLogin email={email ?? ""} onBack={onBackToEmail} onSuccess={onLoginSuccess} />;
      case "payment":
        return (
          <StripePayment
            email={email ?? ""}
            amountCents={selection.plan.retailCents}
            currency={selection.plan.currency}
            selection={selection}
            onBack={existingCustomer ? onBackToSummary : onBackToEmail}
            onSuccess={onPaymentSuccess}
          />
        );
      case "success":
        return <SuccessCard selection={selection} email={email ?? ""} order={order ?? undefined} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-40 flex items-start justify-center bg-transparent px-4 py-12 sm:px-6 lg:px-8",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto grid w-full max-w-5xl gap-6 transition-all duration-300",
          visible ? "translate-y-0" : "translate-y-8",
          "md:grid-cols-[1.05fr_0.95fr]",
        )}
      >
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <button
              type="button"
              onClick={onBackToPlan}
              className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.34em] text-white/70 transition hover:border-white/50 hover:text-white"
            >
              <span className="flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back</span>
            </button>
            <Badge className="bg-white/20 text-white">Summary</Badge>
          </div>

          <div className="mt-2 space-y-3">
            <p className="text-xs uppercase tracking-[0.34em] text-white/60">Destination</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {selection.countryFlag ?? "🌐"}
              </span>
              <div>
                <h3 className="text-2xl font-semibold">{selection.countryName}</h3>
                <p className="text-sm text-white/70">{selection.plan.dataLabel} • {selection.plan.periodDays} days</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="text-xl font-semibold text-white">{formattedTotal}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Approx. per-day</span>
              <span>{dayRate}</span>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><Sparkle className="h-4 w-4 text-truelyLime" /> Instant QR delivery</li>
            <li className="flex items-center gap-2"><Sparkle className="h-4 w-4 text-truelyLime" /> Works with hotspot & tethering</li>
            <li className="flex items-center gap-2"><Sparkle className="h-4 w-4 text-truelyLime" /> Switchless Truely-style activation</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
          {renderRightCard()}
        </div>
      </div>
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
