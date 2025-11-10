import "server-only";

import type { EsimCountry, EsimPlanVariant, PlanCategory } from "@/lib/esimAccess";

const baseUrl = process.env.ESIM_ACCESS_API_BASE_URL?.replace(/\/$/, "");
const apiKey = process.env.ESIM_ACCESS_API_KEY;
const partnerId = process.env.ESIM_ACCESS_PARTNER_ID;
const defaultMarkupPct = Number.parseFloat(process.env.ESIM_ACCESS_DEFAULT_MARKUP_PCT ?? "20");

function requireConfig() {
  if (!baseUrl) {
    throw new Error("ESIM_ACCESS_API_BASE_URL is not configured");
  }
  if (!apiKey) {
    throw new Error("ESIM_ACCESS_API_KEY is not configured");
  }
}

async function esimRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  requireConfig();
  const url = `${baseUrl}/${path.replace(/^\//, "")}`;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${apiKey}`,
    "X-API-Key": apiKey,
  };
  if (partnerId) {
    headers["X-Partner-ID"] = partnerId;
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`eSIM Access request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

interface RawCountry {
  iso2?: string;
  iso?: string;
  countryCode?: string;
  code?: string;
  name: string;
  region?: string;
  flagEmoji?: string;
  flag?: string;
}

interface RawCountriesResponse {
  countries?: RawCountry[];
  data?: RawCountry[];
  result?: RawCountry[];
}

export async function loadEsimCountries(): Promise<EsimCountry[]> {
  const data = await esimRequest<RawCountriesResponse>(process.env.ESIM_ACCESS_COUNTRIES_PATH ?? "/catalog/countries");
  const countries = data.countries ?? data.data ?? data.result ?? [];
  return countries
    .map((country) => {
      const code = country.iso2 ?? country.iso ?? country.countryCode ?? country.code;
      if (!code) return null;
      return {
        code,
        name: country.name,
        region: country.region,
        flagEmoji: country.flagEmoji ?? country.flag,
      } satisfies EsimCountry;
    })
    .filter(Boolean) as EsimCountry[];
}

interface RawPlan {
  slug?: string;
  planSlug?: string;
  package_code?: string;
  packageCode?: string;
  package?: string;
  name?: string;
  title?: string;
  description?: string;
  display_name?: string;
  retailPrice?: number;
  retail_price?: number;
  price?: number;
  wholesale?: number;
  wholesale_cents?: number;
  wholesaleCents?: number;
  currency?: string;
  currency_code?: string;
  validity_days?: number;
  validityDays?: number;
  periodDays?: number;
  data_gb?: number;
  dataGb?: number;
  data?: number;
  data_label?: string;
  dataLabel?: string;
  category?: PlanCategory;
  type?: string;
}

interface RawPlansResponse {
  plans?: RawPlan[];
  data?: RawPlan[];
  packages?: RawPlan[];
}

function buildPlanVariant(countryCode: string, plan: RawPlan): EsimPlanVariant | null {
  const slug = plan.slug ?? plan.planSlug ?? plan.packageCode ?? plan.package_code ?? plan.package;
  if (!slug) return null;

  const currency = (plan.currency ?? plan.currency_code ?? "USD").toUpperCase();
  const wholesaleField =
    plan.wholesaleCents ?? plan.wholesale_cents ?? plan.price ?? plan.wholesale ?? plan.retailPrice ?? plan.retail_price ?? 0;
  const wholesaleCents = Math.round(wholesaleField > 100 ? wholesaleField : wholesaleField * 100);

  if (!wholesaleCents || wholesaleCents <= 0) {
    return null;
  }

  const periodDays = plan.periodDays ?? plan.validityDays ?? plan.validity_days ?? 30;
  const dataGb = plan.dataGb ?? plan.data_gb ?? (typeof plan.data === "number" ? plan.data : undefined);

  const dataLabel =
    plan.dataLabel ??
    plan.data_label ??
    plan.display_name ??
    plan.title ??
    plan.name ??
    (typeof dataGb === "number" && dataGb > 0 ? `${dataGb} GB` : "Unlimited");

  const planCategory: PlanCategory =
    plan.category ?? (dataLabel.toLowerCase().includes("unlimited") ? "unlimited" : "metered");

  const markupSource = plan.retail_price ?? plan.retailPrice;
  const markupPct = Number.isFinite(markupSource)
    ? computeMarkupFromRetail(wholesaleCents, Number(markupSource))
    : defaultMarkupPct;

  const retailCents = Math.ceil(wholesaleCents * (1 + markupPct / 100));

  return {
    slug,
    title: plan.title ?? plan.name ?? dataLabel,
    dataLabel,
    dataGb,
    periodDays,
    wholesaleCents,
    retailCents,
    currency,
    category: planCategory,
    markupPct,
    notes: plan.description,
    countryCode,
  };
}

function computeMarkupFromRetail(wholesaleCents: number, rawRetail: number): number {
  const retailCents = rawRetail > 100 ? rawRetail : Math.round(rawRetail * 100);
  if (retailCents <= wholesaleCents) return defaultMarkupPct;
  return ((retailCents - wholesaleCents) / wholesaleCents) * 100;
}

export async function loadEsimPlans(countryCode: string): Promise<EsimPlanVariant[]> {
  if (!countryCode) return [];
  const data = await esimRequest<RawPlansResponse>(
    `${process.env.ESIM_ACCESS_PLANS_PATH ?? "/catalog/countries"}/${countryCode}/plans`,
  );
  const plans = data.plans ?? data.packages ?? data.data ?? [];
  return plans
    .map((plan) => buildPlanVariant(countryCode, plan))
    .filter(Boolean) as EsimPlanVariant[];
}

interface CreateOrderPayload {
  planSlug: string;
  countryCode: string;
  email: string;
  customerName?: string;
  iccid?: string;
  metadata?: Record<string, string>;
}

interface RawOrderResponse {
  iccid?: string;
  sim?: { iccid?: string; qr?: string; activation_code?: string; activationCode?: string; activation_url?: string; activationUrl?: string };
  qr?: string;
  qrCode?: string;
  qr_code?: string;
  activation_code?: string;
  activationCode?: string;
  activation_url?: string;
  activationUrl?: string;
}

export interface IssuedEsimOrder {
  iccid: string;
  qrCodeUrl: string;
  activationCode?: string;
  activationUrl?: string;
}

export async function issueEsimOrder(payload: CreateOrderPayload): Promise<IssuedEsimOrder> {
  const body = {
    plan_slug: payload.planSlug,
    country_code: payload.countryCode,
    email: payload.email,
    customer_name: payload.customerName,
    iccid: payload.iccid,
    metadata: payload.metadata,
  };

  const response = await esimRequest<RawOrderResponse>(process.env.ESIM_ACCESS_ORDER_PATH ?? "/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const iccid = response.iccid ?? response.sim?.iccid;
  if (!iccid) {
    throw new Error("Order response missing ICCID");
  }

  const qrCodeUrl = response.qrCode ?? response.qr_code ?? response.qr ?? "";
  const activationCode = response.activationCode ?? response.activation_code ?? response.sim?.activation_code;
  const activationUrl = response.activationUrl ?? response.activation_url ?? response.sim?.activation_url;

  return {
    iccid,
    qrCodeUrl,
    activationCode: activationCode ?? undefined,
    activationUrl: activationUrl ?? undefined,
  };
}
