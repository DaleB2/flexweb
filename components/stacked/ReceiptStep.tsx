"use client";

import type { ReactNode } from "react";
import { CheckCircle2, DownloadCloud, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DestinationSelection, EmailState, PaymentState } from "./types";

interface ReceiptStepProps {
  selection?: DestinationSelection;
  email?: EmailState;
  payment?: PaymentState;
  onPlanAnother: () => void;
}

export function ReceiptStep({ selection, email, payment, onPlanAnother }: ReceiptStepProps) {
  return (
    <div>
      <CardHeader>
        <Label>Receipt</Label>
        <CardTitle className="text-3xl">All set — safe travels</CardTitle>
        <CardDescription>
          We emailed your receipt and QR code to {email?.email}. Jump back to change anything or line up your next trip.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6 space-y-6">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:grid-cols-2">
          <SummaryItem
            icon={<MapPinned className="h-5 w-5" aria-hidden />}
            label="Destination"
            value={selection ? `${selection.country.flag} ${selection.country.name}` : "—"}
          />
          <SummaryItem
            icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
            label="Plan"
            value={selection ? `${selection.plan.name} • ${selection.plan.dataLabel} • ${selection.plan.periodDays} days` : "—"}
          />
          <SummaryItem
            icon={<DownloadCloud className="h-5 w-5" aria-hidden />}
            label="Order"
            value={payment ? `${payment.orderId} • ${formatPrice(payment.amountCents, payment.currency)}` : "Processing"}
          />
          <SummaryItem
            icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
            label="Account"
            value={email?.existingUser ? "Linked to your Flex account" : "We’ll invite you to create an account"}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/60">
            Need another trip? You can plan multiple destinations and we’ll keep your stack alive.
          </p>
          <Button type="button" variant="subtle" onClick={onPlanAnother}>
            Plan another destination
          </Button>
        </div>
      </CardContent>
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-label text-white/60">{label}</p>
        <p className="text-sm font-semibold text-white/90">{value}</p>
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
