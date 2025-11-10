"use client";

import * as React from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { mockConfirmPayment } from "@/lib/mockServices";
import type { DestinationSelection, EmailState, PaymentState } from "./types";

interface PaymentStepProps {
  selection?: DestinationSelection;
  email?: EmailState;
  onSuccess: (state: PaymentState) => void;
  onError: (message: string) => void;
}

export function PaymentStep({ selection, email, onSuccess, onError }: PaymentStepProps) {
  const [submitting, setSubmitting] = React.useState(false);

  if (!selection || !email) {
    return (
      <div className="space-y-4">
        <CardHeader>
          <Label>Payment</Label>
          <CardTitle className="text-3xl">Review your plan</CardTitle>
          <CardDescription>Select a plan and enter your email to continue.</CardDescription>
        </CardHeader>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selection || !email) return;
    setSubmitting(true);
    try {
      const payment = await mockConfirmPayment(selection, email);
      onSuccess(payment);
    } catch (error) {
      console.error(error);
      onError("We couldn’t confirm the payment");
    } finally {
      setSubmitting(false);
    }
  };

  const total = formatPrice(selection.plan.priceCents, selection.plan.currency);

  return (
    <div>
      <CardHeader>
        <Label>Payment</Label>
        <CardTitle className="text-3xl">Secure checkout</CardTitle>
        <CardDescription>
          Enter your payment details. We’ll only charge once your eSIM is ready to activate.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-label text-white/60">Order summary</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {selection.country.flag} {selection.country.name}
            </p>
            <p className="text-sm text-white/70">{selection.plan.name}</p>
          </div>
          <div className="grid gap-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Data</span>
              <span>{selection.plan.dataLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Duration</span>
              <span>{selection.plan.periodDays} days</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Total</span>
              <span>{total}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <span>Payments secured by Stripe. Cards, Apple Pay, and Google Pay supported.</span>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d1726]/80 p-4 backdrop-blur">
          <p className="text-sm font-semibold text-white/80">Stripe Payment Element</p>
          <MockPaymentElement email={email.email} />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Confirming…" : "Pay & Activate"}
        </Button>
        <p className="text-xs text-white/60">
          We’ll authorise your card now and capture only once the eSIM is active.
        </p>
      </CardFooter>
    </div>
  );
}

function MockPaymentElement({ email }: { email: string }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3 text-white/70">
          <CreditCard className="h-4 w-4" aria-hidden />
          <span>Card details</span>
        </div>
        <div className="mt-3 grid gap-3">
          <div className="h-10 rounded-xl border border-white/15 bg-[#111f33]/80" />
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-xl border border-white/15 bg-[#111f33]/80" />
            <div className="h-10 flex-1 rounded-xl border border-white/15 bg-[#111f33]/80" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        <p className="text-xs uppercase tracking-label text-white/50">Email</p>
        <p className="text-sm font-semibold text-white">{email}</p>
        <p className="mt-2 text-xs text-white/60">
          We’ll send the receipt and QR code here. Use your Flex account to manage future eSIMs.
        </p>
      </div>
    </div>
  );
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
