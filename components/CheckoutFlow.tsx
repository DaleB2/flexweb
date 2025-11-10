"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CountryPickerCard from "@/components/CountryPickerCard";
import EmailCapture, { type EmailCaptureStatus } from "@/components/EmailCapture";
import PlanSheet from "@/components/PlanSheet";
import PasswordLogin from "@/components/PasswordLogin";
import StripePayment from "@/components/StripePayment";
import SummaryAndCheckoutStack from "@/components/SummaryAndCheckoutStack";
import SuccessCard from "@/components/SuccessCard";
import type { EsimCountry, EsimPlan } from "@/lib/esimAccess";
import type { CreateEsimOrderResponse } from "@/lib/esimAccess";

const steps = ["select", "summary", "auth-email", "auth-login", "payment", "success"] as const;
export type FlowStep = (typeof steps)[number];

type ParsedState = {
  step: FlowStep;
  country: EsimCountry | null;
  plan: EsimPlan | null;
  totalCents: number;
  currency: string;
  email: string;
  existingAccount: boolean;
  iccid?: string;
  qrCode?: string;
  orderId?: string;
};

type Props = {
  countries: EsimCountry[];
  defaultMarkupPct?: number;
};

function parseParams(params: URLSearchParams, countries: EsimCountry[]): ParsedState {
  const stepParam = params.get("step") as FlowStep | null;
  const step: FlowStep = steps.includes(stepParam ?? "select") ? (stepParam as FlowStep) ?? "select" : "select";

  const countryCode = params.get("countryCode");
  const countryName = params.get("countryName");
  const countryFlag = params.get("countryFlag");
  const country = countryCode
    ? countries.find((item) => item.code === countryCode) ??
      (countryName
        ? {
            code: countryCode,
            name: countryName,
            flagEmoji: countryFlag ?? "🌍",
          }
        : null)
    : null;

  const planSlug = params.get("planSlug");
  const dataLabel = params.get("planDataLabel") ?? undefined;
  const dataGbParam = params.get("dataGb");
  const periodDaysParam = params.get("periodDays");
  const wholesaleParam = params.get("wholesaleCents");
  const retailParam = params.get("retailCents");
  const packageCode = params.get("packageCode") ?? undefined;
  const currency = params.get("currency") ?? "USD";
  const totalCentsParam = params.get("totalCents");

  const plan: EsimPlan | null = planSlug
    ? {
        slug: planSlug,
        dataLabel: dataLabel ?? "",
        dataGb: dataGbParam ? Number(dataGbParam) : undefined,
        periodDays: periodDaysParam ? Number(periodDaysParam) : 0,
        wholesaleCents: wholesaleParam ? Number(wholesaleParam) : 0,
        retailCents: retailParam ? Number(retailParam) : totalCentsParam ? Number(totalCentsParam) : 0,
        currency,
        packageCode: packageCode ?? planSlug,
      }
    : null;

  const totalCents = totalCentsParam ? Number(totalCentsParam) : plan?.retailCents ?? 0;
  const email = params.get("email") ?? "";
  const existingAccount = params.get("existingAccount") === "1";
  const iccid = params.get("iccid") ?? undefined;
  const qrCode = params.get("qrCode") ?? undefined;
  const orderId = params.get("orderId") ?? undefined;

  return {
    step,
    country,
    plan,
    totalCents,
    currency,
    email,
    existingAccount,
    iccid,
    qrCode,
    orderId,
  };
}

export default function CheckoutFlow({ countries, defaultMarkupPct }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parsed = useMemo(() => parseParams(searchParams, countries), [searchParams, countries]);

  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [planType, setPlanType] = useState<"unlimited" | "metered" | null>(null);
  const [email, setEmail] = useState(parsed.email);
  const [emailStatus, setEmailStatus] = useState<EmailCaptureStatus>("idle");
  const [emailMessage, setEmailMessage] = useState<string | undefined>();
  const [existingAccount, setExistingAccount] = useState(parsed.existingAccount);
  const [order, setOrder] = useState<CreateEsimOrderResponse | null>(null);

  useEffect(() => {
    setEmail(parsed.email);
    setExistingAccount(parsed.existingAccount);
    if (parsed.iccid && parsed.qrCode) {
      setOrder({
        id: parsed.orderId ?? parsed.iccid,
        iccid: parsed.iccid,
        qrCode: parsed.qrCode,
      });
    }
  }, [parsed.email, parsed.existingAccount, parsed.iccid, parsed.qrCode, parsed.orderId]);

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function handleCountrySelect(country: EsimCountry) {
    updateParams((params) => {
      params.set("countryCode", country.code);
      params.set("countryName", country.name);
      params.set("countryFlag", country.flagEmoji);
      params.delete("planSlug");
      params.delete("planDataLabel");
      params.delete("dataGb");
      params.delete("periodDays");
      params.delete("wholesaleCents");
      params.delete("retailCents");
      params.delete("packageCode");
      params.delete("totalCents");
      params.delete("step");
      params.delete("existingAccount");
      params.delete("email");
    });
    setPlanType(null);
  }

  function handlePlanConfirm(plan: EsimPlan) {
    updateParams((params) => {
      params.set("planSlug", plan.slug);
      params.set("planDataLabel", plan.dataLabel);
      if (plan.dataGb) {
        params.set("dataGb", String(plan.dataGb));
      } else {
        params.delete("dataGb");
      }
      params.set("periodDays", String(plan.periodDays));
      params.set("wholesaleCents", String(plan.wholesaleCents));
      params.set("retailCents", String(plan.retailCents));
      params.set("packageCode", plan.packageCode);
      params.set("currency", plan.currency);
      params.set("totalCents", String(plan.retailCents));
      params.set("step", "summary");
      params.delete("email");
      params.delete("existingAccount");
      params.delete("iccid");
      params.delete("qrCode");
      params.delete("orderId");
    });
    setPlanSheetOpen(false);
    setEmail("");
    setEmailStatus("idle");
    setEmailMessage(undefined);
    setExistingAccount(false);
    setOrder(null);
  }

  function setStep(step: FlowStep) {
    updateParams((params) => {
      if (step === "select") {
        params.delete("step");
      } else {
        params.set("step", step);
      }
    });
  }

  function handleBack() {
    switch (parsed.step) {
      case "summary":
        setStep("select");
        break;
      case "auth-email":
        setEmailStatus("idle");
        setEmailMessage(undefined);
        setStep("summary");
        break;
      case "auth-login":
        setStep("auth-email");
        break;
      case "payment":
        if (!existingAccount) {
          setEmailStatus("new");
          setEmailMessage("We'll create your account after payment.");
        }
        setStep(existingAccount ? "auth-login" : "auth-email");
        break;
      case "success":
        setStep("payment");
        break;
      default:
        setStep("select");
    }
  }

  async function handleEmailSubmit() {
    if (emailStatus === "new") {
      setStep("payment");
      setEmailStatus("idle");
      setEmailMessage(undefined);
      updateParams((params) => {
        params.set("email", email);
        params.set("step", "payment");
        params.delete("existingAccount");
      });
      return;
    }

    setEmailStatus("checking");
    setEmailMessage(undefined);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to verify email");
      }

      updateParams((params) => {
        params.set("email", email);
      });

      if (payload.exists) {
        setExistingAccount(true);
        setEmailStatus("idle");
        setStep("auth-login");
        updateParams((params) => {
          params.set("step", "auth-login");
          params.set("existingAccount", "1");
        });
      } else {
        setExistingAccount(false);
        setEmailStatus("new");
        setEmailMessage("We'll create your account after payment.");
      }
    } catch (error) {
      console.error(error);
      setEmailStatus("error");
      setEmailMessage("Unable to check your email right now. Please try again.");
    }
  }

  function handleAuthenticated() {
    setExistingAccount(true);
    setStep("payment");
    updateParams((params) => {
      params.set("step", "payment");
      params.set("existingAccount", "1");
      params.set("email", email);
    });
  }

  function handlePaymentSuccess(nextOrder: CreateEsimOrderResponse) {
    setOrder(nextOrder);
    setStep("success");
    updateParams((params) => {
      params.set("step", "success");
      params.set("iccid", nextOrder.iccid);
      params.set("qrCode", nextOrder.qrCode);
      params.set("orderId", nextOrder.id);
    });
  }

  function handleViewAccount() {
    router.push("/account");
  }

  const canShowSummary = parsed.country && parsed.plan;

  let rightCardContent: React.ReactNode = null;
  let stepLabel = "";
  let showBack = false;

  switch (parsed.step) {
    case "summary":
      stepLabel = "Plan summary";
      showBack = true;
      rightCardContent = (
        <div className="flex flex-1 flex-col gap-6 px-6 py-8">
          <p className="text-sm text-slate-600">
            Review your selection. When you’re ready, continue to enter your email and finish checkout without leaving this page.
          </p>
          <button
            type="button"
            onClick={() => setStep("auth-email")}
            className="mt-auto flex w-full items-center justify-center rounded-2xl bg-[#061031] px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-[#0a1a3c]"
          >
            Continue
          </button>
        </div>
      );
      break;
    case "auth-email":
      stepLabel = "Email";
      showBack = true;
      rightCardContent = (
        <EmailCapture
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleEmailSubmit}
          status={emailStatus}
          message={emailMessage}
        />
      );
      break;
    case "auth-login":
      stepLabel = "Sign in";
      showBack = true;
      rightCardContent = <PasswordLogin email={email} onAuthenticated={handleAuthenticated} />;
      break;
    case "payment":
      stepLabel = "Payment";
      showBack = true;
      if (parsed.plan && parsed.country) {
        rightCardContent = (
          <StripePayment
            email={email}
            amountCents={parsed.totalCents}
            currency={parsed.currency}
            packageCode={parsed.plan.packageCode}
            countryCode={parsed.country.code}
            planSlug={parsed.plan.slug}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      }
      break;
    case "success":
      stepLabel = "Success";
      rightCardContent = order ? (
        <SuccessCard iccid={order.iccid} qrCode={order.qrCode} onViewAccount={handleViewAccount} />
      ) : (
        <div className="px-6 py-8">
          <p className="text-sm text-slate-600">Your order is complete.</p>
        </div>
      );
      break;
    default:
      break;
  }

  return (
    <div className="relative flex flex-col gap-12">
      <section className="relative isolate overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,_#071025,_#020611)] px-6 py-16 text-white shadow-[0_42px_160px_rgba(4,17,49,0.55)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.36em] text-white/70">
              Truely-style checkout
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-[3rem]">Unlimited internet that stays on this screen.</h1>
            <p className="max-w-xl text-lg text-white/80">
              Choose a destination, stack your plan, and glide through email, login, and payment without leaving the hero — the exact Truely UX, now in Flex.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/70 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">200+</p>
                <p className="text-xs uppercase tracking-[0.36em]">Destinations</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">Instant</p>
                <p className="text-xs uppercase tracking-[0.36em]">Activation</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">Secure</p>
                <p className="text-xs uppercase tracking-[0.36em]">Checkout</p>
              </div>
            </div>
          </div>

          <div className="relative flex w-full max-w-lg flex-col gap-6">
            {parsed.step === "select" && (
              <div className="transition-all duration-300">
                <CountryPickerCard
                  countries={countries}
                  selectedCountryCode={parsed.country?.code}
                  onCountrySelect={handleCountrySelect}
                  onPlanTypeSelect={(type) => {
                    if (!parsed.country) return;
                    setPlanType(type);
                    setPlanSheetOpen(true);
                  }}
                />
              </div>
            )}

            {parsed.step !== "select" && canShowSummary && rightCardContent && (
              <div className="transition-all duration-300">
                <SummaryAndCheckoutStack
                  country={parsed.country}
                  plan={parsed.plan}
                  totalCents={parsed.totalCents}
                  currency={parsed.currency}
                  stepLabel={stepLabel}
                  onBack={showBack ? handleBack : undefined}
                >
                  {rightCardContent}
                </SummaryAndCheckoutStack>
              </div>
            )}
          </div>
        </div>
      </section>

      <PlanSheet
        country={parsed.country ?? countries[0]}
        open={planSheetOpen && !!parsed.country}
        onClose={() => setPlanSheetOpen(false)}
        onConfirm={handlePlanConfirm}
        markupPct={defaultMarkupPct}
        planType={planType ?? undefined}
      />
    </div>
  );
}
