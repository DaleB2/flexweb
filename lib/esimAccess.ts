export interface EsimCountry {
  code: string;
  name: string;
  region?: string;
  flagEmoji?: string;
}

export type PlanCategory = "unlimited" | "metered";

export interface EsimPlanVariant {
  slug: string;
  title: string;
import "server-only";

import { cache } from "react";

type EsimAccessCountryResponse = {
  code: string;
  name: string;
  flagEmoji?: string;
};

type EsimAccessPlanResponse = {
  package_code: string;
  data_gb: number | null;
  data_label: string;
  period_days: number;
  wholesale_cents: number;
  currency: string;
};

export type EsimCountry = {
  code: string;
  name: string;
  flagEmoji: string;
};

export type EsimPlan = {
  slug: string;
  dataLabel: string;
  dataGb?: number;
  periodDays: number;
  wholesaleCents: number;
  retailCents: number;
  currency: string;
  category: PlanCategory;
  markupPct: number;
  notes?: string;
}

export interface EsimOrderPayload {
  planSlug: string;
  countryCode: string;
  email: string;
  userId?: string;
  clientSecret: string;
  paymentIntentId: string;
}

export interface EsimOrderResponse {
  iccid: string;
  qrCodeUrl: string;
  activationCode?: string;
}

const MOCK_COUNTRIES: EsimCountry[] = [
  { code: "US", name: "United States", region: "North America", flagEmoji: "🇺🇸" },
  { code: "GB", name: "United Kingdom", region: "Europe", flagEmoji: "🇬🇧" },
  { code: "JP", name: "Japan", region: "Asia", flagEmoji: "🇯🇵" },
  { code: "FR", name: "France", region: "Europe", flagEmoji: "🇫🇷" },
  { code: "AU", name: "Australia", region: "Oceania", flagEmoji: "🇦🇺" },
  { code: "AE", name: "United Arab Emirates", region: "Middle East", flagEmoji: "🇦🇪" },
  { code: "SG", name: "Singapore", region: "Asia", flagEmoji: "🇸🇬" },
  { code: "ES", name: "Spain", region: "Europe", flagEmoji: "🇪🇸" },
  { code: "DE", name: "Germany", region: "Europe", flagEmoji: "🇩🇪" },
  { code: "BR", name: "Brazil", region: "South America", flagEmoji: "🇧🇷" },
  { code: "MX", name: "Mexico", region: "North America", flagEmoji: "🇲🇽" },
  { code: "TH", name: "Thailand", region: "Asia", flagEmoji: "🇹🇭" },
];

const MOCK_PLANS: Record<string, Array<Omit<EsimPlanVariant, "retailCents">>> = {
  US: [
    {
      slug: "us-5gb-7d",
      title: "USA 5 GB",
  packageCode: string;
};

const MOCK_COUNTRIES: EsimCountry[] = [
  { code: "US", name: "United States", flagEmoji: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flagEmoji: "🇬🇧" },
  { code: "JP", name: "Japan", flagEmoji: "🇯🇵" },
  { code: "ES", name: "Spain", flagEmoji: "🇪🇸" },
  { code: "TH", name: "Thailand", flagEmoji: "🇹🇭" },
];

const MOCK_PLANS: Record<string, EsimPlan[]> = {
  US: [
    {
      slug: "us-5gb-7d",
      dataLabel: "5 GB",
      dataGb: 5,
      periodDays: 7,
      wholesaleCents: 1200,
      currency: "USD",
      category: "metered",
      markupPct: 25,
      notes: "Best for long weekends",
    },
    {
      slug: "us-20gb-30d",
      title: "USA 20 GB",
      retailCents: 1500,
      currency: "USD",
      packageCode: "US-5GB-7D",
    },
    {
      slug: "us-20gb-30d",
      dataLabel: "20 GB",
      dataGb: 20,
      periodDays: 30,
      wholesaleCents: 1850,
      currency: "USD",
      category: "metered",
      markupPct: 20,
    },
    {
      slug: "us-unlimited-15d",
      title: "USA Unlimited",
      dataLabel: "Unlimited",
      periodDays: 15,
      wholesaleCents: 3400,
      currency: "USD",
      category: "unlimited",
      markupPct: 18,
      notes: "Includes 5G speeds where available",
      retailCents: 2220,
      currency: "USD",
      packageCode: "US-20GB-30D",
    },
    {
      slug: "us-unlimited-30d",
      dataLabel: "Unlimited",
      periodDays: 30,
      wholesaleCents: 3200,
      retailCents: 3840,
      currency: "USD",
      packageCode: "US-UNLTD-30D",
    },
  ],
  GB: [
    {
      slug: "gb-10gb-15d",
      title: "UK 10 GB",
      dataLabel: "10 GB",
      dataGb: 10,
      periodDays: 15,
      wholesaleCents: 1500,
      currency: "GBP",
      category: "metered",
      markupPct: 22,
    },
    {
      slug: "gb-unlimited-30d",
      title: "UK Unlimited",
      dataLabel: "Unlimited",
      periodDays: 30,
      wholesaleCents: 4200,
      currency: "GBP",
      category: "unlimited",
      markupPct: 18,
    },
  ],
  JP: [
    {
      slug: "jp-5gb-10d",
      title: "Japan 5 GB",
      dataLabel: "5 GB",
      dataGb: 5,
      periodDays: 10,
      wholesaleCents: 1600,
      currency: "USD",
      category: "metered",
      markupPct: 20,
    },
    {
      slug: "jp-unlimited-7d",
      title: "Japan Unlimited",
      dataLabel: "Unlimited",
      periodDays: 7,
      wholesaleCents: 2100,
      currency: "USD",
      category: "unlimited",
      markupPct: 18,
    },
  ],
};

function computeRetail(variant: Omit<EsimPlanVariant, "retailCents">): EsimPlanVariant {
  const { wholesaleCents, markupPct } = variant;
  const retailCents = Math.ceil(wholesaleCents * (1 + markupPct / 100));
  return { ...variant, retailCents };
}

export async function fetchCountries(): Promise<EsimCountry[]> {
  return MOCK_COUNTRIES;
}

export async function fetchPlans(countryCode: string): Promise<EsimPlanVariant[]> {
  const plans = MOCK_PLANS[countryCode] ?? [];
  return plans.map((plan) => computeRetail(plan));
}

export async function createOrder(payload: EsimOrderPayload): Promise<EsimOrderResponse> {
  console.info("Issuing mock eSIM order", payload);
  return {
    iccid: "89014103211118510720",
    qrCodeUrl: "https://dummyimage.com/280x280/0f172a/ffffff.png&text=SCAN",
    activationCode: "LPA:1$DUMMYCODE",
  };
      slug: "gb-5gb-7d",
      dataLabel: "5 GB",
      dataGb: 5,
      periodDays: 7,
      wholesaleCents: 1100,
      retailCents: 1380,
      currency: "GBP",
      packageCode: "GB-5GB-7D",
    },
    {
      slug: "gb-15gb-30d",
      dataLabel: "15 GB",
      dataGb: 15,
      periodDays: 30,
      wholesaleCents: 1900,
      retailCents: 2376,
      currency: "GBP",
      packageCode: "GB-15GB-30D",
    },
  ],
};

const API_BASE = process.env.ESIM_ACCESS_API_BASE_URL;
const API_KEY = process.env.ESIM_ACCESS_API_KEY;

async function fetchFromEsimAccess<T>(path: string): Promise<T | null> {
  if (!API_BASE || !API_KEY) {
    return null;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 60 * 5,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${path} from eSIM Access`, await response.text());
    return null;
  }

  return (await response.json()) as T;
}

export const fetchCountries = cache(async (): Promise<EsimCountry[]> => {
  const data = await fetchFromEsimAccess<EsimAccessCountryResponse[]>("/countries");

  if (!data) {
    return MOCK_COUNTRIES;
  }

  return data.map((country) => ({
    code: country.code,
    name: country.name,
    flagEmoji: country.flagEmoji ?? "🌍",
  }));
});

function computeRetailPrice(wholesaleCents: number, markupPct: number | undefined) {
  const markup = typeof markupPct === "number" ? markupPct : Number(process.env.ESIM_ACCESS_DEFAULT_MARKUP_PCT ?? 25);
  return Math.ceil(wholesaleCents * (1 + markup / 100));
}

export const fetchPlans = cache(async (
  countryCode: string,
  options: { markupPct?: number } = {},
): Promise<EsimPlan[]> => {
  const data = await fetchFromEsimAccess<EsimAccessPlanResponse[]>(`/countries/${countryCode}/plans`);

  if (!data) {
    return MOCK_PLANS[countryCode] ?? [];
  }

  return data.map((plan) => ({
    slug: `${countryCode.toLowerCase()}-${plan.package_code.toLowerCase()}`,
    dataLabel: plan.data_label,
    dataGb: plan.data_gb ?? undefined,
    periodDays: plan.period_days,
    wholesaleCents: plan.wholesale_cents,
    retailCents: computeRetailPrice(plan.wholesale_cents, options.markupPct),
    currency: plan.currency,
    packageCode: plan.package_code,
  }));
});

export type CreateEsimOrderInput = {
  packageCode: string;
  email: string;
  countryCode: string;
  planSlug: string;
  amountCents: number;
  currency: string;
  userId?: string;
};

export type CreateEsimOrderResponse = {
  id: string;
  iccid: string;
  qrCode: string;
};

export async function createOrder(order: CreateEsimOrderInput): Promise<CreateEsimOrderResponse> {
  const body = {
    package_code: order.packageCode,
    email: order.email,
    country_code: order.countryCode,
    plan_slug: order.planSlug,
    amount_cents: order.amountCents,
    currency: order.currency,
    user_id: order.userId,
  };

  if (!API_BASE || !API_KEY) {
    // Mock success order when API credentials are absent.
    return {
      id: `mock-${Date.now()}`,
      iccid: "8988247000001234567",
      qrCode: "https://example.com/mock-qr.png",
    };
  }

  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to create eSIM Access order: ${await response.text()}`);
  }

  return (await response.json()) as CreateEsimOrderResponse;
}
