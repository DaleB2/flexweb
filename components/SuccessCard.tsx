"use client";

import Image from "next/image";
import { CheckCircle2, ExternalLink } from "lucide-react";

import type { CheckoutSelection } from "@/components/SummaryAndCheckoutStack";
import { Button } from "@/components/ui/button";

export interface SuccessPayload {
  iccid: string;
  qrCodeUrl: string;
  activationCode?: string;
}

export interface SuccessCardProps {
  selection: CheckoutSelection;
  email: string;
  order?: SuccessPayload;
}

export default function SuccessCard({ selection, email, order }: SuccessCardProps) {
  const maskedIccid = order?.iccid ? `•••• ${order.iccid.slice(-4)}` : "";

  return (
    <div className="flex h-full flex-col gap-6 text-white">
      <div className="flex items-center gap-3 text-truelyLime">
        <CheckCircle2 className="h-6 w-6" />
        <div>
          <p className="text-xs uppercase tracking-[0.36em] text-white/60">Installed</p>
          <h3 className="text-2xl font-semibold text-white">You&apos;re all set for {selection.countryName}</h3>
        </div>
      </div>
      <p className="text-sm text-white/70">
        We emailed {email} the QR code and install instructions. Activate when you&apos;re wheels down to start roaming instantly.
      </p>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {selection.countryFlag ?? "🌐"}
          </span>
          <div>
            <p className="text-sm text-white/60">Plan</p>
            <p className="text-lg font-semibold text-white">
              {selection.plan.dataLabel} • {selection.plan.periodDays} days
            </p>
          </div>
        </div>
        {order?.activationCode && (
          <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs text-white/70">
            Activation code: <span className="font-semibold text-white">{order.activationCode}</span>
          </div>
        )}
        {order?.qrCodeUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <Image src={order.qrCodeUrl} alt="eSIM QR code" fill className="object-cover" />
          </div>
        )}
        {maskedIccid && (
          <p className="text-xs text-white/60">ICCID: {maskedIccid}</p>
        )}
      </div>

      <Button className="mt-auto flex items-center justify-center gap-2 rounded-full px-8 py-5 text-sm font-semibold uppercase tracking-[0.34em]">
        View in account <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
}
