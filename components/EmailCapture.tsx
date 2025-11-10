"use client";

import { useState } from "react";

export type EmailCaptureStatus = "idle" | "checking" | "new" | "error";

type Props = {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => Promise<void> | void;
  status: EmailCaptureStatus;
  message?: string;
};

export default function EmailCapture({ email, onEmailChange, onSubmit, status, message }: Props) {
  const [touched, setTouched] = useState(false);
  const isValid = /.+@.+\..+/.test(email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!isValid || status === "checking") return;
    await onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <label htmlFor="checkout-email" className="text-sm font-medium text-[#061031]">
          Email address
        </label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onBlur={() => setTouched(true)}
          onChange={(event) => onEmailChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#061031]"
          placeholder="you@example.com"
          autoComplete="email"
        />
        {touched && !isValid && <p className="text-xs text-red-500">Enter a valid email to continue.</p>}
        {message && <p className="text-xs text-slate-500">{message}</p>}
      </div>

      <button
        type="submit"
        disabled={!isValid || status === "checking"}
        className="mt-auto flex w-full items-center justify-center rounded-2xl bg-[#061031] px-6 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white transition hover:bg-[#0a1a3c] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {status === "checking" ? "Checking…" : status === "new" ? "Continue to payment" : "Continue"}
      </button>
    </form>
  );
}
