"use client";

import { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SuccessPayload } from "@/components/SuccessCard";
import type { CheckoutSelection } from "@/components/SummaryAndCheckoutStack";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export interface StripePaymentProps {
  email: string;
  amountCents: number;
  currency: string;
  selection: CheckoutSelection;
  onBack: () => void;
  onSuccess: (payload: SuccessPayload) => void;
}

export default function StripePayment({ email, amountCents, currency, selection, onBack, onSuccess }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
import { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import type { CreateEsimOrderResponse } from "@/lib/esimAccess";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

type StripeCheckoutInnerProps = {
  clientSecret: string;
  email: string;
  onPaymentSuccess: (order: CreateEsimOrderResponse) => void;
  orderPayload: {
    packageCode: string;
    countryCode: string;
    planSlug: string;
    amountCents: number;
    currency: string;
  };
};

type Props = {
  email: string;
  amountCents: number;
  currency: string;
  packageCode: string;
  countryCode: string;
  planSlug: string;
  onPaymentSuccess: (order: CreateEsimOrderResponse) => void;
};

type CreateIntentResponse = {
  clientSecret: string;
  appearance: Record<string, unknown>;
};

export default function StripePayment({
  email,
  amountCents,
  currency,
  packageCode,
  countryCode,
  planSlug,
  onPaymentSuccess,
}: Props) {
  const [intent, setIntent] = useState<CreateIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function createIntent() {
      if (!stripePromise) {
        setStatus("error");
        setError("Stripe keys are missing. Provide NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to enable payment.");
        return;
      }
      setStatus("loading");
      setError(null);
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountCents, currency, email }),
        });
        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }
        const data: { clientSecret?: string; error?: string } = await response.json();
        if (!data.clientSecret) {
          throw new Error(data.error ?? "Missing client secret");
        }
        if (!cancelled) {
          setClientSecret(data.clientSecret);
          setStatus("ready");
        }
      } catch (intentError) {
        console.error(intentError);
        if (!cancelled) {
          setError("We couldn't start the payment session. Check your Stripe configuration and retry.");
          setStatus("error");
        }
      }
    }

    createIntent();
    queueMicrotask(() => {
      if (cancelled) return;
      setError(null);
      setIntent(null);
    });

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amountCents, currency }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.json();
      })
      .then((payload: CreateIntentResponse) => {
        if (cancelled) return;
        setIntent(payload);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Unable to prepare payment. Try again later.");
      });

    return () => {
      cancelled = true;
    };
  }, [amountCents, currency, email]);

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret ?? undefined,
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#9cff00",
          colorBackground: "#0f172a",
          colorText: "#ffffff",
        },
      },
    }),
    [clientSecret],
  );

  if (!stripePromise) {
    return (
      <div className="flex h-full flex-col gap-6 text-white">
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <h3 className="text-2xl font-semibold">Payment configuration required</h3>
        <p className="text-sm text-white/70">
          Add <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and
          <code className="rounded bg-white/10 px-1">STRIPE_SECRET_KEY</code> to enable the live Stripe Payment Element.
        </p>
        <Button
          onClick={async () => {
            const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                amountCents,
                currency,
                paymentIntentId: "test",
                clientSecret: "test",
                plan: selection.plan,
                country: {
                  code: selection.countryCode,
                  name: selection.countryName,
                  flagEmoji: selection.countryFlag,
                },
              }),
            });
            if (response.ok) {
              const data = (await response.json()) as SuccessPayload;
              onSuccess(data);
            } else {
              setError("Simulated order failed. Check server logs.");
            }
          }}
          className="mt-auto rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.34em]"
        >
          Simulate successful order
        </Button>
        {error && <p className="text-sm text-red-200">{error}</p>}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full flex-col gap-6 text-white">
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <h3 className="text-2xl font-semibold">Payment unavailable</h3>
        <p className="text-sm text-white/70">{error ?? "Unable to initialize payment. Please try again."}</p>
      </div>
    );
  }

  if (!clientSecret || status === "loading") {
    return (
      <div className="flex h-full flex-col gap-4 text-white">
        <button
          type="button"
          onClick={onBack}
          className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          <p className="text-sm text-white/70">Preparing secure payment…</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm
        email={email}
        onBack={onBack}
        onSuccess={onSuccess}
        clientSecret={clientSecret}
        amountCents={amountCents}
        currency={currency}
        selection={selection}
  if (!stripePromise) {
    return <p className="px-6 py-8 text-sm text-red-500">Stripe is not configured.</p>;
  }

  if (error) {
    return <p className="px-6 py-8 text-sm text-red-500">{error}</p>;
  }

  if (!intent) {
    return <p className="px-6 py-8 text-sm text-slate-500">Loading secure payment…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret, appearance: intent.appearance }}>
      <StripeCheckoutInner
        clientSecret={intent.clientSecret}
        email={email}
        onPaymentSuccess={onPaymentSuccess}
        orderPayload={{ packageCode, countryCode, planSlug, amountCents, currency }}
      />
    </Elements>
  );
}

interface StripePaymentFormProps extends StripePaymentProps {
  clientSecret: string;
}

function StripePaymentForm({ email, onBack, onSuccess, amountCents, currency, selection }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setStatus("submitting");
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Unable to validate details.");
      setStatus("idle");
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: email,
      },
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed. Check your details and try again.");
      setStatus("idle");
      return;
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amountCents,
        currency,
        paymentIntentId: result.paymentIntent?.id,
        clientSecret: result.paymentIntent?.client_secret,
        plan: selection.plan,
        country: {
          code: selection.countryCode,
          name: selection.countryName,
          flagEmoji: selection.countryFlag,
        },
      }),
    });

    if (!response.ok) {
      setError("Payment succeeded but we couldn't create the order. Contact support.");
      setStatus("idle");
      return;
    }

    const data = (await response.json()) as SuccessPayload;
    setStatus("idle");
    onSuccess(data);
  };

  return (
    <div className="flex h-full flex-col gap-6 text-white">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
      <div>
        <p className="text-xs uppercase tracking-[0.36em] text-white/60">Secure payment</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Enter your payment details</h3>
        <p className="mt-2 text-sm text-white/70">
          We charge {(amountCents / 100).toLocaleString(undefined, { style: "currency", currency })} when you confirm.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error && <p className="text-sm text-red-200">{error}</p>}
      <Button
        disabled={status === "submitting"}
        onClick={handleSubmit}
        className="mt-auto rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.34em]"
      >
        {status === "submitting" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing…
          </span>
        ) : (
          "Pay now"
        )}
      </Button>
    </div>
function StripeCheckoutInner({
  clientSecret,
  email,
  orderPayload,
  onPaymentSuccess,
}: StripeCheckoutInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== "undefined" ? window.location.href : undefined,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message ?? "Unable to process payment.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderPayload,
          email,
          clientSecret,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const order = (await res.json()) as CreateEsimOrderResponse;
      onPaymentSuccess(order);
    } catch (err) {
      console.error(err);
      setError("Payment succeeded, but we could not complete the order. Contact support.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="mt-auto flex w-full items-center justify-center rounded-2xl bg-[#061031] px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-[#0a1a3c] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {submitting ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}
