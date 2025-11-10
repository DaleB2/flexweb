"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckoutSheet } from "./CheckoutSheet";

export function CheckoutExperience() {
  const [open, setOpen] = React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);

  const handlePlanAnother = React.useCallback(() => {
    setOpen(false);
    window.setTimeout(() => {
      setResetKey((value) => value + 1);
      setOpen(true);
    }, 220);
  }, []);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/5 to-transparent" aria-hidden />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-24 sm:px-8 lg:px-12">
        <header className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">Flex Mobile</p>
          <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
            Unlimited travel data without leaving your page.
          </h1>
          <p className="text-base text-white/70">
            Flex mirrors Truely’s right-side checkout so you can grab an eSIM while the landing page stays open. Slide in, pick a destination, sign in, and pay in one smooth flow.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              size="lg"
              className="group w-full sm:w-auto"
              onClick={() => setOpen(true)}
            >
              <span>Get eSIM</span>
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-white/60">Destinations live from eSIM Access. Secure payments via Stripe.</p>
          </div>
        </header>
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold">Stacked cards, saved context</h2>
            <p className="mt-3 text-sm text-white/70">
              Each step layers over the last with Truely’s signature dim + blur treatment so you never lose track of previous selections.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold">Supabase + Stripe ready</h2>
            <p className="mt-3 text-sm text-white/70">
              Email-first auth flows into the Payment Element. Successful checkouts trigger provisioning, Supabase user sync, and SendGrid email hooks.
            </p>
          </div>
        </section>
      </div>

      <CheckoutSheet
        key={resetKey}
        open={open}
        onOpenChange={setOpen}
        onPlanAnother={handlePlanAnother}
      />
    </div>
  );
}
