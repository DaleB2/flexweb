"use client";

import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface EmailCaptureProps {
  email: string;
  onBack: () => void;
  onEmailIdentified: (payload: { email: string; exists: boolean }) => void;
}

export default function EmailCapture({ email, onBack, onEmailIdentified }: EmailCaptureProps) {
  const [value, setValue] = useState(email);
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!value) {
      setError("Enter your email to continue.");
      return;
    }
    setStatus("checking");
    setError(null);

    try {
      const response = await fetch("/api/auth/exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data: { exists: boolean } = await response.json();
      onEmailIdentified({ email: value, exists: data.exists });
    } catch (err) {
      console.error(err);
      setError("We couldn't verify your email right now. Please try again.");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
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
        <p className="text-xs uppercase tracking-[0.36em] text-white/60">Secure checkout</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Let&apos;s start with your email</h3>
        <p className="mt-2 text-sm text-white/70">
          We&apos;ll check if you already have a Flex account. Returning customers log in inline; new travelers continue straight to
          payment.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.32em] text-white/50" htmlFor="checkout-email">
          Email address
        </label>
        <Input
          id="checkout-email"
          type="email"
          autoComplete="email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="you@example.com"
          className="rounded-2xl border-white/15 bg-white/10 py-5 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
        {error && <p className="text-sm text-red-200">{error}</p>}
      </div>

      <Button
        disabled={status === "checking"}
        onClick={handleSubmit}
        className="mt-auto rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.34em]"
      >
        {status === "checking" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking…
          </span>
        ) : (
          "Continue"
        )}
      </Button>

      <p className="text-xs text-white/50">
        We&apos;ll create your account automatically after payment if this is your first time traveling with Flex.
      </p>
    </div>
  );
}
