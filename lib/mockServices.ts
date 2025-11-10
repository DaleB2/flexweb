import type { DestinationSelection, EmailState, EsimInfo, PaymentState } from "@/components/stacked/types";

const existingCustomers = new Map<string, { hasSession: boolean }>([
  ["sarah@flex.travel", { hasSession: true }],
  ["alex@flex.travel", { hasSession: false }],
]);

export async function mockLookupEmail(email: string): Promise<{ existingUser: boolean; hasSession: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  const record = existingCustomers.get(email.toLowerCase());
  return { existingUser: Boolean(record), hasSession: Boolean(record?.hasSession) };
}

let orderCounter = 4000;

export async function mockConfirmPayment(selection: DestinationSelection, email: EmailState): Promise<PaymentState> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const normalizedEmail = email.email.toLowerCase();
  if (!existingCustomers.has(normalizedEmail)) {
    existingCustomers.set(normalizedEmail, { hasSession: false });
  }
  orderCounter += 1;
  return {
    orderId: `ORD-${orderCounter}`,
    amountCents: selection.plan.priceCents,
    currency: selection.plan.currency,
    planName: selection.plan.name,
    countryName: selection.country.name,
  };
}

export async function mockProvisionEsim(order: PaymentState): Promise<EsimInfo> {
  await new Promise((resolve) => setTimeout(resolve, 1600));
  return {
    iccid: `8988${order.orderId.replace(/[^0-9]/g, "").padEnd(19, "1")}`.slice(0, 19),
    qrSvg: generateQrPlaceholder(order.orderId),
    activationCode: `ACT-${order.orderId.slice(-4)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    status: "active",
  };
}

function generateQrPlaceholder(seed: string): string {
  const payload = `flex-esim:${seed}`;
  const encoded = typeof window === "undefined" ? Buffer.from(payload).toString("base64") : btoa(payload);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5B2BEA" />
      <stop offset="100%" stop-color="#FF6AD5" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="24" fill="#050B1A" />
  <rect x="24" y="24" width="152" height="152" rx="18" fill="url(#grad)" opacity="0.18" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter',sans-serif" font-size="12" fill="#ffffffaa">
    ${encoded.slice(0, 18)}
  </text>
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter',sans-serif" font-size="12" fill="#ffffffaa">
    ${encoded.slice(18, 36)}
  </text>
  <text x="50%" y="66%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter',sans-serif" font-size="12" fill="#ffffffaa">
    ${encoded.slice(36, 54)}
  </text>
</svg>`;
}
