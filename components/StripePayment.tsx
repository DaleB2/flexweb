"use client";

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
