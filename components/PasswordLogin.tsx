"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PasswordLoginProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PasswordLogin({ email, onBack, onSuccess }: PasswordLoginProps) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!password) {
      setError("Enter your password to continue.");
      return;
    }
    setStatus("loading");
    setError(null);
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setStatus("idle");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message ?? "Login failed. Try again.");
      setStatus("idle");
      return;
    }

    setStatus("idle");
    setPassword("");
    onSuccess();
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
      <div>
        <p className="text-xs uppercase tracking-[0.36em] text-white/60">Welcome back</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Log in to continue</h3>
        <p className="mt-2 text-sm text-white/70">We found your account. Enter your password to unlock payment.</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.32em] text-white/50" htmlFor="checkout-password">
          Password
        </label>
        <Input
          id="checkout-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="rounded-2xl border-white/15 bg-white/10 py-5 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
        {error && <p className="text-sm text-red-200">{error}</p>}
      </div>

      <Button
        disabled={status === "loading"}
        onClick={handleSubmit}
        className="mt-auto rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.34em]"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Logging in…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Continue
          </span>
        )}
      </Button>
    </div>

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Props = {
  email: string;
  onAuthenticated: () => void;
};

export default function PasswordLogin({ email, onAuthenticated }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      onAuthenticated();
    } catch (err) {
      console.error(err);
      setError("Unable to sign in right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm text-slate-600">{email}</p>
        <label htmlFor="checkout-password" className="text-sm font-medium text-[#061031]">
          Password
        </label>
        <input
          id="checkout-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#061031]"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || password.length < 6}
        className="mt-auto flex w-full items-center justify-center rounded-2xl bg-[#061031] px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-[#0a1a3c] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {loading ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}
