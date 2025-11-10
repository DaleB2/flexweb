"use client";

import { useState } from "react";

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
