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
  );
}
