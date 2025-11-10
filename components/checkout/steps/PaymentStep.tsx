"use client";

import * as React from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import type { CheckoutCountry, CheckoutPackage, PaymentState } from "../types";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface PaymentStepProps {
  email: string;
  country: CheckoutCountry;
  pkg: CheckoutPackage;
  onSuccess: (state: PaymentState) => void;
}

interface PaymentIntentResponse {
  clientSecret: string | null;
  paymentIntentId: string | null;
  amount: number;
  currency: string;
  disabled?: boolean;
  error?: string;
}

export function PaymentStep({ email, country, pkg, onSuccess }: PaymentStepProps) {
  const { publish } = useToast();
  const [intent, setIntent] = React.useState<PaymentIntentResponse | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("loading");
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function createIntent() {
      setStatus("loading");
      try {
        const response = await fetch("/api/checkout/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            country: country.code,
            packageId: pkg.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const payload = (await response.json()) as PaymentIntentResponse;
        if (!cancelled) {
          setIntent(payload);
          if (payload.error && !payload.disabled) {
            setStatus("error");
          } else if (!payload.clientSecret && !payload.disabled) {
            setStatus("error");
          } else {
            setStatus("idle");
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setIntent(null);
          setStatus("error");
        }
      }
    }

    createIntent();

    return () => {
      cancelled = true;
    };
  }, [attempt, country.code, email, pkg.id]);

  if (!stripePromise || intent?.disabled) {
    return (
      <PaymentUnavailable intent={intent} />
    );
  }

  if (status === "loading" || !intent?.clientSecret || !intent.paymentIntentId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-white/70">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Starting your secure payment session…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4 rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-100">
        <p>We couldn’t start the payment element. Refresh or try again shortly.</p>
        <Button
          variant="ghost"
          onClick={() => {
            setStatus("loading");
            setAttempt((value) => value + 1);
          }}
          className="w-fit text-red-100 hover:bg-red-500/20"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={buildStripeOptions(intent.clientSecret)}
      key={intent.clientSecret}
    >
      <PaymentForm
        email={email}
        country={country}
        pkg={pkg}
        intent={intent}
        onSuccess={onSuccess}
        onError={(message) => publish({ title: "Payment failed", description: message })}
      />
    </Elements>
  );
}

interface PaymentFormProps {
  email: string;
  country: CheckoutCountry;
  pkg: CheckoutPackage;
  intent: PaymentIntentResponse;
  onSuccess: (state: PaymentState) => void;
  onError: (message: string) => void;
}

function PaymentForm({ email, country, pkg, intent, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const amount = React.useMemo(() => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: intent.currency,
    maximumFractionDigits: 0,
  }).format(intent.amount / 100), [intent.amount, intent.currency]);

  const handleSubmit = React.useCallback(async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: validationError } = await elements.submit();
    if (validationError) {
      setError(validationError.message ?? "We need a bit more info.");
      setSubmitting(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you`,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    if (result.error) {
      const message = result.error.message ?? "Payment failed. Check your details and try again.";
      setError(message);
      onError(message);
      setSubmitting(false);
      return;
    }

    onSuccess({ paymentIntentId: intent.paymentIntentId!, clientSecret: intent.clientSecret! });
    setSubmitting(false);
  }, [elements, email, intent.clientSecret, intent.paymentIntentId, onError, onSuccess, stripe]);

  return (
    <div className="space-y-8">
      <CardHeader className="space-y-3 p-0">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-white/40">Payment</div>
        <CardTitle className="text-3xl">Secure checkout</CardTitle>
        <CardDescription className="text-sm text-white/70">
          {country.flagEmoji ?? "🌍"} {country.name} · {pkg.name}
        </CardDescription>
      </CardHeader>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <div className="flex items-center justify-between">
          <span>Package</span>
          <span className="font-semibold">{pkg.name}</span>
        </div>
        <div className="flex items-center justify-between text-white/70">
          <span>Duration</span>
          <span>{pkg.days} day{pkg.days === 1 ? "" : "s"}</span>
        </div>
        <div className="flex items-center justify-between text-white/70">
          <span>Data</span>
          <span>{pkg.unlimited ? "Unlimited" : pkg.dataLabel}</span>
        </div>
        <Separator className="my-3 border-white/10" />
        <div className="flex items-center justify-between text-base font-semibold text-white">
          <span>Total</span>
          <span>{amount}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <PaymentElement />
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>

      <Button type="button" className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming…
          </span>
        ) : (
          "Pay"
        )}
      </Button>
    </div>
  );
}

function PaymentUnavailable({ intent }: { intent: PaymentIntentResponse | null }) {
  return (
    <div className="space-y-6 text-white">
      <CardHeader className="space-y-3 p-0">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-white/40">Payment</div>
        <CardTitle className="text-3xl">Add your Stripe keys</CardTitle>
        <CardDescription className="text-sm text-white/70">
          Provide NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to enable live payments.
        </CardDescription>
      </CardHeader>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        We validated your plan at {intent ? new Intl.NumberFormat("en-US", { style: "currency", currency: intent.currency, maximumFractionDigits: 0 }).format((intent?.amount ?? 0) / 100) : "the correct rate"}.
        Once Stripe keys are ready, payments will go live instantly.
      </div>
    </div>
  );
}

function buildStripeOptions(clientSecret: string): StripeElementsOptions {
  return {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#9dff00",
        colorBackground: "#050c1a",
        colorText: "#ffffff",
        borderRadius: "16px",
      },
    },
  };
}
