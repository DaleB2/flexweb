"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { NormalizedPlan } from "@/lib/esim";

import styles from "./DestinationPlans.module.css";

interface DestinationPlansProps {
  countryCode: string;
  countryName: string;
  plans: NormalizedPlan[];
  markupPct: number;
  currency: string;
}

function formatCurrency(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function describePlan(plan: NormalizedPlan) {
  const data = plan.dataGb >= 100 ? `${Math.round(plan.dataGb)} GB` : `${plan.dataGb} GB`;
  const duration = plan.periodDays === 1 ? "1 day" : `${plan.periodDays} days`;
  return `${data} · ${duration}`;
}

export default function DestinationPlans({ countryCode, countryName, plans, markupPct, currency }: DestinationPlansProps) {
  const router = useRouter();

  const handleCheckout = useCallback(
    (plan: NormalizedPlan) => {
      const params = new URLSearchParams({
        countryCode,
        country: countryName,
        slug: plan.slug,
        packageCode: plan.packageCode,
        dataGb: String(plan.dataGb),
        periodDays: String(plan.periodDays),
        wholesaleCents: String(plan.wholesalePriceCents),
        markupPct: String(markupPct),
        totalCents: String(plan.retailPriceCents),
        currency,
      });
      router.push(`/checkout?${params.toString()}`);
    },
    [countryCode, countryName, currency, markupPct, router],
  );

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <span className={styles.kicker}>Unlimited data</span>
        <h2 className={styles.title}>Plans ready for {countryName}</h2>
        <p className={styles.description}>
          Pick how much data you need and how long you’ll stay. Pricing already includes taxes and Flex’s {markupPct}% service
          margin so there are no surprises.
        </p>
      </div>
      <div className={styles.grid}>
        {plans.map((plan) => (
          <article key={plan.packageCode} className={styles.plan}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{describePlan(plan)}</h3>
              <p className={styles.planPrice}>{formatCurrency(plan.retailPriceCents, currency)}</p>
            </div>
            <p className={styles.planMeta}>
              Wholesale: {formatCurrency(plan.wholesalePriceCents, currency)} · Includes activation, support, and taxes.
            </p>
            <div className={styles.actions}>
              <span className={styles.supportCopy}>Instant QR delivery · works in phones & hotspots</span>
              <button type="button" className={styles.button} onClick={() => handleCheckout(plan)}>
                Continue
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
