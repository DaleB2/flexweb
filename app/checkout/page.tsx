"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Session } from "@supabase/supabase-js";

import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

import styles from "./page.module.css";

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
    <aside className={styles.summaryCard}>
      <div className={styles.destinationRow}>
        <div className={styles.destinationMeta}>
          <span className={styles.flag} aria-hidden>
            {flag}
          </span>
          <div className={styles.destinationCopy}>
            <span className={styles.label}>Destination</span>
            <strong>{draft.country ?? draft.countryCode}</strong>
          </div>
        </div>
        <Link href="/" className={styles.buttonSecondary}>
          Change
        </Link>
      </div>
      <div className={styles.planCard}>
        <span className={styles.label}>Plan</span>
        <strong>
          {draft.dataGb} GB • {draft.periodDays} days
        </strong>
        <span className={styles.helperText}>Unlimited data</span>
      </div>
      <div className={styles.totalCard}>
        <div className={styles.totalRow}>
          <span className={styles.label} style={{ color: "rgba(255,255,255,0.7)" }}>
            Total
          </span>
          <span className={styles.totalValue}>{total}</span>
        </div>
        <span className={styles.helperText} style={{ color: "rgba(255,255,255,0.78)" }}>
          Starts from {perDay} / day
        </span>
      </div>
      <ul className={styles.benefits}>
        <li>• Instant delivery after payment</li>
        <li>• Works on unlocked eSIM-ready devices</li>
        <li>• Keep your messaging apps active</li>
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
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <div>
        <h3>Welcome back</h3>
        <p className={styles.helperText}>Log in to continue checkout for {email}.</p>
      </div>
      <div>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={styles.input}
        />
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      <button type="submit" disabled={loading} className={styles.buttonPrimary}>
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
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <p className={styles.errorText}>{error}</p>}
      <button type="submit" disabled={loading || !stripe || !elements} className={styles.buttonPrimary}>
        {loading ? "Processing…" : "Complete purchase"}
      </button>
      <p className={styles.secureFooter}>Secure checkout with Stripe</p>
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
    return <div className={styles.loadingCard}>Setting up your secure checkout…</div>;
  }

  if (error || !draft) {
    return (
      <div className={styles.errorCard}>
        <p>{error ?? "Unable to start checkout."}</p>
        <Link href="/" className={styles.buttonSecondary}>
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
    return <div className={styles.errorCard}>Checkout isn’t available right now. Please try again later.</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "flat" } }}>
      <PaymentStep draft={draft} email={email} />
    </Elements>
  );
}

function SummaryPanel() {
  const params = useSearchParams();
  const draft = parseDraft(new URLSearchParams(params.toString()));

  if (!draft) {
    return <div className={styles.noticeCard}>Select a plan to view your summary.</div>;
  }

  return <CheckoutSummary draft={draft} />;
}

export default function CheckoutPage() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return new URLSearchParams(window.location.search).get("email") ?? "";
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandBadge}>FM</span>
            <span className={styles.brandCopy}>
              <span className={styles.brandLabel}>Flex Mobile</span>
              <span className={styles.brandTitle}>Secure checkout</span>
            </span>
          </Link>
          <span className={styles.secureTag}>Secure checkout</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.panel}>
          <h1>Quick checkout</h1>
          <p>Enter your email to get started. We’ll send plan details and your QR instantly after payment.</p>
          <div>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              className={styles.input}
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
          <Suspense fallback={<div className={styles.loadingCard}>Preparing payment…</div>}>
            <CheckoutContent email={email} />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<div className={styles.loadingCard}>Loading summary…</div>}>
            <SummaryPanel />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
