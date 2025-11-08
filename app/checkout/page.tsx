"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

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
  };
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
  const flag = draft.countryCode.length === 2
    ? String.fromCodePoint(...draft.countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)))
    : "";

  return (
    <aside className="space-y-7 rounded-[32px] border border-white/20 bg-white/10 p-7 text-white shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur">
    <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {flag}
          </span>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/60">Destination</p>
            <p className="text-2xl font-extrabold">{draft.country ?? draft.countryCode}</p>
          </div>
        </div>
        <Link href="/" className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60 transition hover:text-white">
          Change
        </Link>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">Plan</p>
        <p className="mt-2 text-xl font-extrabold text-white">
          {draft.dataGb} GB • {draft.periodDays} days
        </p>
        <p className="mt-1 text-sm font-semibold text-white/70">Unlimited data</p>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Destination</p>
            <p className="text-lg font-semibold text-slate-900">{draft.country ?? draft.countryCode}</p>
          </div>
        </div>
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900">
          Change
        </Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Plan</p>
        <p className="text-lg font-semibold text-slate-900">
          {draft.dataGb} GB • {draft.periodDays} days
        </p>
        <p className="text-sm font-medium text-slate-600">Unlimited data</p>
      </div>
      <div className="rounded-3xl bg-mint/95 px-6 py-7 text-coal shadow-[0_20px_60px_rgba(47,239,204,0.4)]">
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-coal/60">Total</span>
          <span className="text-4xl font-black">{total}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Total</span>
          <span className="text-3xl font-semibold">{total}</span>
        </div>
        <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-coal/70">
          Starts from {perDay} / day
        </p>
      </div>
      <ul className="space-y-2 text-sm font-semibold text-white/70">
      <ul className="space-y-2 text-sm font-medium text-slate-600">
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur">
      <div>
        <h3 className="text-xl font-extrabold">Welcome back</h3>
        <p className="text-sm font-semibold text-white/70">Log in to continue checkout for {email}.</p>
      </div>
      <div>
        <label htmlFor="password" className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Welcome back</h3>
        <p className="text-sm font-medium text-slate-600">Log in to continue checkout for {email}.</p>
      </div>
      <div>
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-sm font-semibold text-coal placeholder:text-coal/40 focus:border-mint focus:outline-none"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-bottle focus:outline-none"
        />
      </div>
      {error && <p className="text-sm font-semibold text-daisy">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-mint px-5 py-3 text-sm font-bold uppercase tracking-[0.4em] text-coal shadow-[0_16px_45px_rgba(47,239,204,0.5)] transition hover:scale-[1.02] disabled:opacity-40"
        className="w-full rounded-full bg-bottle px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bottle/90 disabled:opacity-40"
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
        return_url: `${window.location.origin}/thank-you`,
      },
    });

    if (error) {
      setError(error.message ?? "Payment failed");
      setLoading(false);
    } else {
      router.push("/thank-you");
    }
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: draft.currency,
    minimumFractionDigits: 0,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-white/80 backdrop-blur">
        <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">Pay with card or wallet</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pay with card or wallet</p>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error && <div className="rounded-xl border border-daisy/40 bg-daisy/20 px-4 py-3 text-sm font-semibold text-coal">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full rounded-full bg-mint px-6 py-4 text-sm font-bold uppercase tracking-[0.4em] text-coal shadow-[0_18px_50px_rgba(47,239,204,0.45)] transition hover:scale-[1.02] disabled:opacity-40"
      >
        {loading ? "Processing…" : `Pay ${formatter.format(draft.totalCents / 100)}`}
      </button>
      <p className="text-xs font-semibold text-white/60">
        className="w-full rounded-2xl bg-bottle px-6 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bottle/90 disabled:opacity-40"
      >
        {loading ? "Processing…" : `Pay ${formatter.format(draft.totalCents / 100)}`}
      </button>
      <p className="text-xs font-medium text-slate-500">
        By paying you agree to receive your eSIM via email for {email}. We’ll activate it instantly when you land.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const parsedDraft = useMemo(() => parseDraft(searchParams), [searchParams]);
  const [checkoutDraft, setCheckoutDraft] = useState<Draft | null>(parsedDraft);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    setCheckoutDraft(parsedDraft);
  }, [parsedDraft]);

  if (!parsedDraft || !checkoutDraft) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet via-coal to-royal p-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/20 bg-white/10 p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur">
          <p className="text-2xl font-extrabold">We couldn’t find your selection.</p>
          <p className="mt-3 text-sm font-semibold text-white/70">Start again from the homepage to pick a plan.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-mint px-6 py-3 text-sm font-bold uppercase tracking-[0.4em] text-coal shadow-[0_18px_50px_rgba(47,239,204,0.45)] transition hover:scale-[1.03]"
          >
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const handleCreateIntent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ email, draft: checkoutDraft }),
      });

      if (response.status === 409 || response.status === 403) {
        setRequiresLogin(true);
        return;
      }

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to start checkout");
      }

      const json: CheckoutResponse = await response.json();
      setClientSecret(json.clientSecret ?? null);
      setRequiresLogin(Boolean(json.requiresLogin));
      if (json.draft) {
        setCheckoutDraft(json.draft);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (session: Session) => {
    setSessionToken(session.access_token);
    setRequiresLogin(false);
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: checkoutDraft.currency,
    minimumFractionDigits: 0,
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet via-coal to-royal px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-20 h-[420px] w-[420px] rounded-full bg-heliotrope/40 blur-[160px]" />
        <div className="absolute right-[-15%] top-40 h-[520px] w-[520px] rounded-full bg-mint/40 blur-[180px]" />
        <div className="absolute inset-x-0 bottom-[-30%] h-[420px] bg-gradient-to-t from-coal via-transparent to-transparent" />
      </div>
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_1fr]">
        <CheckoutSummary draft={checkoutDraft} />

        <section className="space-y-7 rounded-[32px] border border-white/20 bg-white/10 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">Checkout</p>
            <h2 className="mt-3 text-3xl font-extrabold text-white">Secure payment</h2>
            <p className="mt-2 text-sm font-semibold text-white/70">
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        <CheckoutSummary draft={checkoutDraft} />

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Checkout</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Secure payment</h2>
            <p className="text-sm font-medium text-slate-600">
              Your plan total is {formatter.format(checkoutDraft.totalCents / 100)}. Enter your email to continue.
            </p>
          </div>

          {!clientSecret && (
            <form onSubmit={handleCreateIntent} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/30 bg-white/85 px-4 py-3 text-sm font-semibold text-coal placeholder:text-coal/40 focus:border-mint focus:outline-none"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-bottle focus:outline-none"
                />
              </div>
              {error && <div className="rounded-xl border border-daisy/40 bg-daisy/20 px-4 py-3 text-sm font-semibold text-coal">{error}</div>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-full bg-mint px-6 py-4 text-sm font-bold uppercase tracking-[0.4em] text-coal shadow-[0_18px_50px_rgba(47,239,204,0.45)] transition hover:scale-[1.02] disabled:opacity-40"
                className="w-full rounded-2xl bg-bottle px-6 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bottle/90 disabled:opacity-40"
              >
                {loading ? "Checking…" : "Continue"}
              </button>
            </form>
          )}

          {requiresLogin && !clientSecret && email && (
            <LoginPanel email={email} onAuthenticated={handleAuthenticated} />
          )}

          {clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentStep draft={checkoutDraft} email={email} />
            </Elements>
          )}
          {clientSecret && !stripePromise && (
            <div className="rounded-xl border border-daisy/40 bg-daisy/20 px-4 py-3 text-sm font-semibold text-coal">
            <div className="rounded-xl border border-persian/30 bg-persian/5 px-4 py-3 text-sm font-semibold text-persian">
              Stripe publishable key is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
