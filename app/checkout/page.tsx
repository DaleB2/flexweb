"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Session } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

function PlanSummaryCard({ draft }: { draft: Draft }) {
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

  const handleJumpToEmail = () => {
    if (typeof document === "undefined") return;
    const emailField = document.getElementById("checkout-email");
    if (emailField instanceof HTMLElement) {
      emailField.focus({ preventScroll: false });
      emailField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Card className="border-0 bg-white p-6 shadow-[0_28px_90px_rgba(20,24,53,0.14)]">
      <CardHeader className="space-y-3 p-0">
        <Badge className="w-fit bg-[#ebefff] text-[#1a1f38]">Step 1 · Review plan</Badge>
        <CardTitle className="text-2xl font-semibold text-[#0b0f1c]">Unlimited internet for your trip</CardTitle>
        <p className="text-sm text-[#313754]/70">Double-check the plan you picked before we verify your email.</p>
      </CardHeader>
      <CardContent className="mt-5 space-y-6 p-0">
        <div className="flex items-start justify-between rounded-3xl border border-[#d0d5ff]/60 bg-[#f5f7ff] p-5">
          <div className="flex items-start gap-4">
            <span className="text-3xl" aria-hidden>
              {flag}
            </span>
            <div className="space-y-1 text-sm font-semibold text-[#0b0f1c]">
              <p className="text-lg">{draft.country ?? draft.countryCode}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#313754]/50">
                {draft.dataGb} GB · {draft.periodDays} days
              </p>
              <p className="text-xs font-medium text-[#313754]/60">Hotspot & tethering enabled</p>
            </div>
          </div>
          <Badge className="bg-white text-[#1a1f38]">Stripe Secure</Badge>
        </div>

        <div className="space-y-3 rounded-3xl border border-[#d0d5ff]/60 bg-white p-5">
          <div className="flex items-center justify-between text-sm font-semibold text-[#313754]/70">
            <span>Amount</span>
            <span className="text-3xl font-semibold text-[#0b0f1c]">{total}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#313754]/60">
            From {perDay} per day · taxes included
          </p>
          <Separator className="bg-[#d0d5ff]/60" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input placeholder="Enter promo code" disabled className="flex-1" />
            <Button variant="outline" type="button" disabled className="sm:w-32">
              Apply
            </Button>
          </div>
          <p className="text-xs text-[#313754]/60">Promo codes are coming soon for loyal travelers.</p>
        </div>

        <Button
          size="lg"
          className="w-full justify-center rounded-full text-sm uppercase tracking-[0.3em]"
          type="button"
          onClick={handleJumpToEmail}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}

function EmailStep({ email, onSubmit }: { email: string; onSubmit: (value: string) => void }) {
  const [value, setValue] = useState(email);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setValue(email);
  }, [email]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setSubmitted(true);
  };

  return (
    <Card className="border-0 bg-white p-6 shadow-[0_24px_80px_rgba(20,24,53,0.12)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <Badge className="w-fit bg-[#ebefff] text-[#1a1f38]">Step 2 · Email</Badge>
          <CardTitle className="text-2xl font-semibold text-[#0b0f1c]">Let’s find your Truely profile</CardTitle>
          <p className="text-sm text-[#313754]/70">
            We’ll check if you already have an account. If you’re new, you’ll head straight to payment.
          </p>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled
          className="w-full justify-center rounded-full text-sm uppercase tracking-[0.3em] text-[#313754]/70"
        >
          Continue with Google
        </Button>

        <div className="relative flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#313754]/40">
          <Separator className="flex-1 bg-[#d0d5ff]/60" />
          <span>or with email</span>
          <Separator className="flex-1 bg-[#d0d5ff]/60" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-email">Email address</Label>
          <Input
            id="checkout-email"
            type="email"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSubmitted(false);
            }}
            placeholder="traveler@you.com"
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full justify-center rounded-full text-sm uppercase tracking-[0.3em]"
          disabled={!value.trim()}
        >
          {submitted && value.trim() === email ? "Email saved" : "Continue"}
        </Button>
        <p className="text-xs text-[#313754]/60">
          We send receipts, QR instructions, and travel briefings to this email. No marketing spam.
        </p>
      </form>
    </Card>
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
    <Card className="border-0 bg-white p-6 shadow-[0_24px_80px_rgba(20,24,53,0.12)]">
      <div className="space-y-3">
        <Badge className="w-fit bg-[#ebefff] text-[#1a1f38]">Step 3 · Sign in</Badge>
        <CardTitle className="text-2xl font-semibold text-[#0b0f1c]">Welcome back to Truely</CardTitle>
        <p className="text-sm text-[#313754]/70">We found an account using {email}. Sign in to continue checkout.</p>
      </div>
      <div className="mt-6 space-y-4">
        <Button
          variant="outline"
          type="button"
          disabled
          className="w-full justify-center rounded-full text-sm uppercase tracking-[0.3em] text-[#313754]/70"
        >
          Continue with Google
        </Button>
        <div className="relative flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#313754]/40">
          <Separator className="flex-1 bg-[#d0d5ff]/60" />
          <span>or with password</span>
          <Separator className="flex-1 bg-[#d0d5ff]/60" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-password">Password</Label>
            <Input
              id="checkout-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-sm font-semibold text-[#8a1f3d]">{error}</p>}
          <Button
            type="submit"
            size="lg"
            className="w-full justify-center rounded-full text-sm uppercase tracking-[0.3em]"
            disabled={loading || !password}
          >
            {loading ? "Signing in…" : "Sign in & continue"}
          </Button>
        </form>
      </div>
    </Card>
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
    <Card className="border-0 bg-white p-6 shadow-[0_28px_90px_rgba(20,24,53,0.14)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <Badge className="w-fit bg-[#ebefff] text-[#1a1f38]">Step 4 · Payment</Badge>
          <CardTitle className="text-2xl font-semibold text-[#0b0f1c]">Make payment</CardTitle>
          <p className="text-sm text-[#313754]/70">Cards, wallets, and local methods supported by Stripe.</p>
        </div>
        <PaymentElement options={{ layout: "tabs" }} />
        {error ? <p className="text-sm font-semibold text-[#8a1f3d]">{error}</p> : null}
        <Button
          type="submit"
          size="lg"
          className="w-full justify-center rounded-full text-sm uppercase tracking-[0.3em]"
          disabled={loading || !stripe || !elements}
        >
          {loading ? "Processing…" : "Complete purchase"}
        </Button>
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#313754]/50">
          Secure checkout with Stripe
        </p>
      </form>
    </Card>
  );
}

function CheckoutContent({ email, draft, attempt }: { email: string; draft: Draft | null; attempt: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<Draft | null>(draft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setActiveDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (!draft) {
      setLoading(false);
      setError("Select a destination and plan to start checkout.");
      setClientSecret(null);
      setRequiresLogin(false);
      return;
    }

    if (!email) {
      setLoading(false);
      setError(null);
      setClientSecret(null);
      setRequiresLogin(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const startCheckout = async () => {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draft,
            email,
          }),
        });
        const json: CheckoutResponse & { error?: string } = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Checkout failed. Please refresh and try again.");
        }
        if (cancelled) return;
        setActiveDraft(json.draft ?? draft);
        setClientSecret(json.clientSecret ?? null);
        setRequiresLogin(Boolean(json.requiresLogin));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Checkout failed. Please refresh and try again.");
          setClientSecret(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void startCheckout();

    return () => {
      cancelled = true;
    };
  }, [draft, email, attempt, refreshKey]);

  if (!draft) {
    return (
      <Card className="border-0 bg-[#fff2f2] p-6 text-sm font-semibold text-[#8a1f3d] shadow-none">
        Select a plan to begin checkout.
      </Card>
    );
  }

  if (!email) {
    return (
      <Card className="border-0 bg-[#f5f7ff] p-6 text-sm text-[#313754]/70 shadow-none">
        Enter your email above to unlock the next steps.
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 bg-[#f5f7ff] p-6 text-sm text-[#313754]/70 shadow-none">
        Setting up your secure checkout…
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-[#fff2f2] p-6 text-sm text-[#8a1f3d] shadow-none">
        <p>{error}</p>
        <Link href="/" className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-[#8a1f3d] underline">
          Return home
        </Link>
      </Card>
    );
  }

  if (requiresLogin && email) {
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

  if (!clientSecret || !stripePromise || !activeDraft) {
    return (
      <Card className="border-0 bg-[#fff2f2] p-6 text-sm text-[#8a1f3d] shadow-none">
        Checkout isn’t available right now. Please try again later.
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "flat" } }}>
      <PaymentStep draft={activeDraft} email={email} />
    </Elements>
  );
}

function CheckoutShell({ email, onEmailSubmit }: { email: string; onEmailSubmit: (value: string) => void }) {
  const params = useSearchParams();
  const draft = parseDraft(params);
  const [attempt, setAttempt] = useState(0);

  const handleEmailSubmit = (value: string) => {
    onEmailSubmit(value);
    setAttempt((count) => count + 1);
  };

  return (
    <div className="space-y-5">
      {draft ? <PlanSummaryCard draft={draft} /> : (
        <Card className="border-0 bg-[#fff2f2] p-6 text-sm font-semibold text-[#8a1f3d] shadow-none">
          Select a plan from the home page to begin checkout.
        </Card>
      )}
      <EmailStep email={email} onSubmit={handleEmailSubmit} />
      <CheckoutContent email={email} draft={draft} attempt={attempt} />
    </div>
  );
}

function CheckoutPanel({ email, onEmailSubmit }: { email: string; onEmailSubmit: (value: string) => void }) {
  return (
    <div className="w-full max-w-md rounded-[36px] border border-white/15 bg-white text-[#0b0f1c] shadow-[0_40px_120px_rgba(15,28,70,0.35)]">
      <div className="flex items-center justify-between border-b border-[#d0d5ff]/60 px-6 py-5">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#313754]/60">Checkout</p>
          <p className="text-xl font-semibold text-[#0b0f1c]">Complete your purchase</p>
        </div>
        <Badge className="bg-[#ebefff] text-[#1a1f38]">Secure</Badge>
      </div>
      <div className="space-y-5 px-6 py-6">
        <Suspense
          fallback={
            <Card className="border-0 bg-[#f5f7ff] p-6 text-sm text-[#313754]/70 shadow-none">Preparing checkout…</Card>
          }
        >
          <CheckoutShell email={email} onEmailSubmit={onEmailSubmit} />
        </Suspense>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return new URLSearchParams(window.location.search).get("email") ?? "";
  });

  const handleEmailSubmit = (value: string) => {
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
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02061a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(83,96,255,0.4),transparent_55%),linear-gradient(180deg,#02061a_0%,#05102b_60%,#02061a_100%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-25"
        aria-hidden
      />
      <div className="relative flex min-h-screen flex-col">
        <header className="px-6 py-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between text-white">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#74e4ff] via-[#5360ff] to-[#6f3] text-sm font-extrabold tracking-[0.3em]">
                TR
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-white/70">Truely Switchless</span>
                <span className="text-lg font-semibold">Secure checkout</span>
              </div>
            </Link>
            <div className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 sm:flex">
              <span>Support</span>
              <span>Help center</span>
              <span>Destinations</span>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 pb-16 pt-10 text-white sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-xl space-y-6">
            <Badge className="bg-white/15 text-white">Stacked checkout</Badge>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Unlimited internet that travels with you</h1>
            <p className="text-lg text-white/80">
              You’re moments away from connecting like a local. Confirm your plan, verify your email, and pay without leaving this panel.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <span>Instant QR delivery</span>
              <Separator orientation="vertical" className="hidden h-4 w-px bg-white/40 sm:block" />
              <span>Hotspot friendly</span>
              <Separator orientation="vertical" className="hidden h-4 w-px bg-white/40 sm:block" />
              <span>Best network guarantee</span>
            </div>
          </div>

          <CheckoutPanel email={email} onEmailSubmit={handleEmailSubmit} />
        </main>
      </div>
    </div>
  );
}
