"use client";

import * as React from "react";
import { Copy, MailCheck, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import type { EsimInfo, PaymentState } from "./types";

interface ProvisionStepProps {
  payment?: PaymentState;
  esim?: EsimInfo;
  onResend: () => void;
  onViewAccount: () => void;
}

export function ProvisionStep({ payment, esim, onResend, onViewAccount }: ProvisionStepProps) {
  const { publish } = useToast();
  const status = esim?.status ?? "provisioning";
  const hasDetails = Boolean(esim?.activationCode);

  const handleCopy = async (value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      publish({ title: "Copy manually", description: value });
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      publish({ title: "Copied", description: "Details copied to your clipboard." });
    } catch {
      publish({ title: "Copy failed", description: "Copy manually if clipboard access is blocked." });
    }
  };

  const handleResend = () => {
    onResend();
    publish({ title: "Receipt queued", description: "We’ll resend the email with your QR code." });
  };

  return (
    <div>
      <CardHeader>
        <Label>Provision</Label>
        <CardTitle className="text-3xl">{status === "active" ? "Your eSIM is live" : "Provisioning your eSIM"}</CardTitle>
        <CardDescription>
          {status === "active"
            ? "Scan the QR or follow the steps below to install."
            : "We’re finalising activation with the carrier. Hang tight—this usually takes under a minute."}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <StatusPill status={status} />
          {payment ? (
            <div className="text-sm text-white/70">
              <p className="font-semibold text-white">Order {payment.orderId}</p>
              <p>{payment.planName}</p>
              <p>{payment.countryName}</p>
              <p className="text-xs uppercase tracking-label text-white/60">
                Total {formatPrice(payment.amountCents, payment.currency)}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="subtle" className="gap-2" onClick={handleResend}>
              <MailCheck className="h-4 w-4" aria-hidden /> Resend email
            </Button>
            <Button type="button" variant="subtle" className="gap-2" onClick={onViewAccount}>
              <RefreshCcw className="h-4 w-4" aria-hidden /> View in account
            </Button>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d1726]/80 p-4 backdrop-blur">
          {hasDetails && esim ? (
            <React.Fragment>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="rounded-2xl border border-white/10 bg-white/10 p-4"
                  dangerouslySetInnerHTML={{ __html: esim.qrSvg }}
                />
                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="font-semibold">Activation code</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="font-mono text-base">{esim.activationCode}</span>
                    <Button type="button" variant="subtle" className="gap-1" onClick={() => handleCopy(esim.activationCode)}>
                      <Copy className="h-4 w-4" aria-hidden /> Copy
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-white/60">Use if your device asks for an SM-DP+ activation code.</p>
                </div>
              </div>
              <Tabs defaultValue="ios">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="ios">iOS</TabsTrigger>
                  <TabsTrigger value="android">Android</TabsTrigger>
                </TabsList>
                <TabsContent value="ios">
                  <Checklist
                    items={[
                      "Open Settings → Cellular → Add eSIM",
                      "Choose “Use QR code” and scan above",
                      "Label the new line “Flex data”",
                      "Keep your primary SIM for calls",
                      "Turn on Data Roaming once you land",
                    ]}
                  />
                </TabsContent>
                <TabsContent value="android">
                  <Checklist
                    items={[
                      "Open Settings → Network & Internet",
                      "Tap the + icon next to SIMs",
                      "Select “Download a SIM instead”",
                      "Scan the QR or enter the activation code",
                      "Set Flex as preferred for mobile data",
                    ]}
                  />
                </TabsContent>
              </Tabs>
            </React.Fragment>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/60">
              <div className="h-20 w-20 animate-pulse rounded-full border border-white/15" />
              <p>Reserving your eSIM profile with the network…</p>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}

function StatusPill({ status }: { status: EsimInfo["status"] | "provisioning" }) {
  const label = status === "active" ? "Active" : "Provisioning…";
  return (
    <span
      className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-label text-white"
    >
      {label}
    </span>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-white/70">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
