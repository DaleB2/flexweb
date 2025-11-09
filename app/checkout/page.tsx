"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Session } from "@supabase/supabase-js";

import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type Draft = {
  countryCode: string;
  country?: string | null;
  slug: string;
  packageCode: string;
  dataGb: number;
  periodDays: number;
  wholesaleCents: number;
  markupPct: number;
  totalCents: number;
  currency: string;
};

type CheckoutResponse = {
  clientSecret?: string;
  requiresLogin?: boolean;
  draft?: Draft;
};

function parseDraft(params: URLSearchParams): Draft | null {
  const required = [
    "countryCode",
    "slug",
    "packageCode",
    "dataGb",
    "periodDays",
    "wholesaleCents",
    "markupPct",
    "totalCents",
    "currency",
  ];

  for (const key of required) {
    if (!params.get(key)) {
      return null;
    }
  }

  return {
    countryCode: params.get("countryCode")!,
    country: params.get("country"),
    slug: params.get("slug")!,
    packageCode: params.get("packageCode")!,
    dataGb: Number(params.get("dataGb")!),
    periodDays: Number(params.get("periodDays")!),
    wholesaleCents: Number(params.get("wholesaleCents")!),
    markupPct: Number(params.get("markupPct")!),
    totalCents: Number(params.get("totalCents")!),
    currency: params.get("currency")!,
  } satisfies Draft;
}

function CheckoutSummary({ draft }: { draft: Draft }) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: draft.currency,
        minimumFractionDigits: 0,
      }),
    [draft.currency],
  );

  const total = formatter.format(draft.totalCents / 100);
  const perDay = formatter.format(Math.ceil(draft.totalCents / draft.periodDays) / 100);
  const flag =
    draft.countryCode.length === 2
      ? String.fromCodePoint(...draft.countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)))
      : "";

  return (
    <aside className="space-y-6 rounded-[32px] border border-lilac/60 bg-white p-7 text-midnight shadow-[0_25px_70px_rgba(18,7,50,0.15)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {flag}
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-midnight/50">Destination</p>
            <p className="text-2xl font-semibold">{draft.country ?? draft.countryCode}</p>
          </div>
        </div>
        <Link href="/" className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-iris transition hover:text-fuchsia">
          Change
        </Link>
      </div>
      <div className="rounded-[24px] border border-lilac/40 bg-moon/70 p-5">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-midnight/50">Plan</p>
        <p className="mt-2 text-xl font-semibold text-midnight">
          {draft.dataGb} GB • {draft.periodDays} days
        </p>
        <p className="mt-1 text-sm font-semibold text-midnight/60">Unlimited data</p>
      </div>
      <div className="rounded-[28px] bg-gradient-to-r from-iris to-fuchsia px-6 py-7 text-white shadow-[0_22px_70px_rgba(123,60,237,0.5)]">
        <div className="flex items-center justify-between">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-white/70">Total</span>
          <span className="text-4xl font-semibold">{total}</span>
        </div>
        <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-white/70">
          Starts from {perDay} / day
        </p>
      </div>
      <ul className="space-y-2 text-sm font-semibold text-midnight/70">
        <li>• Instant delivery after payment</li>
        <li>• Works on unlocked eSIM-ready devices</li>
        <li>• Keep your WhatsApp number active</li>
      </ul>
    </aside>
  );
}

function LoginPanel({ email, onAuthenticated }: { email: string; onAuthenticated: (session: Session) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setError("Supabase credentials are not configured.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        setError(error?.message ?? "Unable to log in. Check your password.");
      } else {
        onAuthenticated(data.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-lilac/40 bg-white p-6 shadow-[0_18px_60px_rgba(18,7,50,0.15)]">
      <div>
        <h3 className="text-xl font-semibold text-midnight">Welcome back</h3>
        <p className="text-sm font-medium text-midnight/60">Log in to continue checkout for {email}.</p>
      </div>
      <div>
        <label htmlFor="password" className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-midnight/50">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-lilac/60 bg-white px-4 py-3 text-sm font-medium text-midnight placeholder:text-midnight/40 focus:border-iris focus:outline-none focus:ring-2 focus:ring-iris/40"
        />
      </div>
      {error && <p className="text-sm font-semibold text-fuchsia">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-iris to-fuchsia px-5 py-3 text-sm font-semibold uppercase tracking-[0.34em] text-white shadow-[0_18px_60px_rgba(123,60,237,0.45)] transition hover:shadow-[0_22px_80px_rgba(123,60,237,0.6)] disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

function PaymentStep({ draft, email }: { draft: Draft; email: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you?country=${draft.country ?? draft.countryCode}`,
        receipt_email: email,
      },
      redirect: "if_required",
    });

    if (error) {
      setError(error.message ?? "Payment failed. Try another method.");
      setLoading(false);
      return;
    }

    router.push(`/thank-you?country=${draft.country ?? draft.countryCode}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[32px] border border-lilac/50 bg-white p-6 shadow-[0_22px_80px_rgba(18,7,50,0.18)]">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className="text-sm font-semibold text-fuchsia">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full rounded-full bg-gradient-to-r from-iris to-fuchsia px-6 py-3 text-sm font-semibold uppercase tracking-[0.34em] text-white shadow-[0_20px_70px_rgba(123,60,237,0.5)] transition hover:shadow-[0_24px_90px_rgba(123,60,237,0.65)] disabled:opacity-50"
      >
        {loading ? "Processing…" : "Complete purchase"}
      </button>
      <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-midnight/40">Secure checkout with Stripe</p>
    </form>
  );
}

function CheckoutContent({ email }: { email: string }) {
  const params = useSearchParams();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  const serializedParams = params.toString();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const currentParams = new URLSearchParams(serializedParams);
    const parsed = parseDraft(currentParams);
    if (!parsed) {
      setError("Your checkout session expired. Start again from the plans page.");
      setLoading(false);
      return;
    }

    const startCheckout = async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draft: parsed,
            email,
          }),
        });
        const json: CheckoutResponse & { error?: string } = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Checkout failed. Please refresh and try again.");
        }
        setDraft(json.draft ?? parsed);
        setClientSecret(json.clientSecret ?? null);
        setRequiresLogin(Boolean(json.requiresLogin));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    void startCheckout();
  }, [serializedParams, email, refreshKey]);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-lilac/40 bg-white p-6 text-sm text-midnight/60 shadow-[0_18px_60px_rgba(18,7,50,0.15)]">
        Setting up your secure checkout…
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="space-y-4 rounded-[32px] border border-fuchsia/40 bg-fuchsia/10 p-6 text-sm text-fuchsia">
        <p>{error ?? "Unable to start checkout."}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-white">
          Return home
        </Link>
      </div>
    );
  }

  if (requiresLogin) {
    return (
      <LoginPanel
        email={email}
        onAuthenticated={() => {
          setRequiresLogin(false);
          setLoading(true);
          setError(null);
          setClientSecret(null);
          setRefreshKey((key) => key + 1);
        }}
      />
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="rounded-[32px] border border-fuchsia/40 bg-fuchsia/10 p-6 text-sm text-fuchsia">
        Checkout isn’t available right now. Please try again later.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "flat" } }}>
      <PaymentStep draft={draft} email={email} />
    </Elements>
  );
}

export default function CheckoutPage() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return new URLSearchParams(window.location.search).get("email") ?? "";
  });

  return (
    <div className="min-h-screen bg-cloud text-midnight">
      <header className="border-b border-lilac/40 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-iris to-fuchsia text-base font-extrabold text-white shadow-[0_18px_45px_rgba(123,60,237,0.4)]">
              FM
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-midnight/50">Flex Mobile</span>
              <span className="text-lg font-semibold text-midnight">Secure checkout</span>
            </div>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-midnight/60">Secure checkout</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:flex-row lg:items-start lg:gap-14 lg:px-8">
        <div className="flex-1 space-y-6">
          <div className="rounded-[36px] border border-lilac/40 bg-white p-8 shadow-[0_28px_90px_rgba(18,7,50,0.15)]">
            <h1 className="text-3xl font-semibold text-midnight">Quick checkout</h1>
            <p className="mt-2 text-base text-midnight/70">
              Enter your email to get started. We’ll send plan details and your QR instantly after payment.
            </p>
            <div className="mt-6 space-y-4">
              <label htmlFor="email" className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-midnight/50">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                className="w-full rounded-2xl border border-lilac/60 bg-white px-4 py-3 text-sm font-medium text-midnight placeholder:text-midnight/40 focus:border-iris focus:outline-none focus:ring-2 focus:ring-iris/40"
                onChange={(event) => {
                  const value = event.target.value;
                  setEmail(value);
                  if (typeof window !== "undefined") {
                    const params = new URLSearchParams(window.location.search);
                    if (value) {
                      params.set("email", value);
                    } else {
                      params.delete("email");
                    }
                    const query = params.toString();
                    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
                    window.history.replaceState(null, "", next);
                  }
                }}
              />
            </div>
          </div>

          <Suspense fallback={<div className="rounded-[32px] border border-lilac/40 bg-white p-6 text-sm text-midnight/60 shadow-[0_18px_60px_rgba(18,7,50,0.15)]">Preparing payment…</div>}>
            <CheckoutContent email={email} />
          </Suspense>
        </div>

        <div className="lg:w-[28rem]">
          <Suspense fallback={<div className="rounded-[32px] border border-lilac/40 bg-white p-6 text-sm text-midnight/60 shadow-[0_18px_60px_rgba(18,7,50,0.15)]">Loading summary…</div>}>
            <Summary />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function Summary() {
  const params = useSearchParams();
  const draft = parseDraft(params);

  if (!draft) {
    return (
      <div className="rounded-[32px] border border-fuchsia/40 bg-fuchsia/10 p-6 text-sm text-fuchsia">
        Select a destination and plan to start checkout.
      </div>
    );
  }

  return <CheckoutSummary draft={draft} />;
}
