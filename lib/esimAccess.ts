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
}
