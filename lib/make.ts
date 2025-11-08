const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL ?? "";

export interface MakeOrderPayload {
  payment_intent_id: string;
  email: string;
  amount: number;
  currency: string;
  customer_name?: string | null;
  order_id?: string | null;
  draft?: Record<string, unknown>;
}

export async function dispatchMakeOrder(payload: MakeOrderPayload) {
  if (!MAKE_WEBHOOK_URL) {
    console.info("MAKE_WEBHOOK_URL not configured, skipping Make dispatch.");
    return { skipped: true } as const;
  }

  const response = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Make webhook failed with status ${response.status}`);
  }

  return { skipped: false } as const;
}
