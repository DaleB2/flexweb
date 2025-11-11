import "server-only";

import crypto from "node:crypto";

import type { EsimCountry, EsimPlanVariant, PlanCategory } from "@/lib/esimAccess";

const baseUrl = (process.env.ESIM_API_BASE ?? "https://api.esimaccess.com").replace(/\/$/, "");
const accessCode = process.env.ESIM_ACCESS_CODE?.trim();
const secret = process.env.ESIM_SECRET?.trim();
const partnerId = process.env.ESIM_ACCESS_PARTNER_ID?.trim();
const defaultMarkupPct = Number.parseFloat(process.env.DEFAULT_MARKUP_PCT ?? "20");

function requireConfig() {
  if (!baseUrl) {
    throw new Error("ESIM_API_BASE is not configured");
  }
  if (!accessCode) {
    throw new Error("ESIM_ACCESS_CODE is not configured");
  }
  if (!secret) {
    throw new Error("ESIM_SECRET is not configured");
  }
}

interface EsimRequestInit extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function buildSignatureHeaders(body: string): HeadersInit {
  if (!accessCode || !secret) {
    throw new Error("eSIM Access credentials are not configured");
  }

  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID();
  const signData = `${timestamp}${requestId}${accessCode}${body}`;
  const signature = crypto.createHmac("sha256", secret).update(signData).digest("hex").toLowerCase();

  const headers: Record<string, string> = {
    "RT-AccessCode": accessCode,
    "RT-Timestamp": timestamp,
    "RT-RequestID": requestId,
    "RT-Signature": signature,
  };

  if (partnerId) {
    headers["RT-PartnerID"] = partnerId;
  }

  return headers;
}

async function esimRequest<T>(path: string, init: EsimRequestInit = {}): Promise<T> {
  requireConfig();
  const url = `${baseUrl}/${path.replace(/^\//, "")}`;
  const { body: rawBody, headers: initHeaders, cache, ...rest } = init;

  const hasBody = typeof rawBody !== "undefined";
  const serializedBody =
    typeof rawBody === "string"
      ? rawBody
      : hasBody
        ? JSON.stringify(rawBody ?? {})
        : undefined;
  const authCode = accessCode!;
  const signatureHeaders = buildSignatureHeaders(serializedBody ?? "");
  const authorization = authCode.startsWith("Bearer ") ? authCode : `Bearer ${authCode}`;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(serializedBody ? { "Content-Type": "application/json" } : {}),
    Authorization: authorization,
    "X-API-Key": authCode,
    ...signatureHeaders,
    ...(initHeaders ?? {}),
  };

  const response = await fetch(url, {
    ...rest,
    headers,
    body: serializedBody,
    cache: cache ?? "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`eSIM Access request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

interface ApiEnvelope {
  success?: boolean | string;
  errorCode?: string | number | null;
  errorMessage?: string | null;
  errorMsg?: string | null;
}

function ensureSuccess(envelope: ApiEnvelope) {
  if (typeof envelope.success === "undefined") return;
  const isSuccess = typeof envelope.success === "string" ? envelope.success === "true" : envelope.success;
  if (isSuccess) return;

  const code = envelope.errorCode ? ` ${envelope.errorCode}` : "";
  const message = envelope.errorMessage ?? envelope.errorMsg ?? "Unknown error";
  throw new Error(`eSIM Access responded with${code}: ${message}`);
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

interface RawCountriesResponse extends ApiEnvelope {
  countries?: RawCountry[];
  data?: RawCountry[];
  result?: RawCountry[];
  obj?: { countryList?: RawCountry[] } | RawCountry[];
  countryList?: RawCountry[];
}

export async function loadEsimCountries(): Promise<EsimCountry[]> {
  const data = await esimRequest<RawCountriesResponse>("api/v1/open/location/country/list", {
    method: "POST",
    body: {},
  });
  ensureSuccess(data);
  const countries =
    data.countries ??
    data.data ??
    data.result ??
    data.countryList ??
    (Array.isArray(data.obj) ? data.obj : data.obj?.countryList) ??
    [];
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
  currencyCode?: string;
  validity_days?: number;
  validityDays?: number;
  periodDays?: number;
  duration?: number;
  duration_unit?: string;
  durationUnit?: string;
  data_gb?: number;
  dataGb?: number;
  data?: number;
  data_label?: string;
  dataLabel?: string;
  volume?: number;
  volume_unit?: string;
  volumeUnit?: string;
  volumeLabel?: string;
  volume_label?: string;
  category?: PlanCategory;
  type?: string;
  activeType?: string;
}

interface RawPlansResponse extends ApiEnvelope {
  plans?: RawPlan[];
  data?: RawPlan[];
  packages?: RawPlan[];
  packageList?: RawPlan[];
  obj?: { packageList?: RawPlan[] } | RawPlan[];
}

function buildPlanVariant(countryCode: string, plan: RawPlan): EsimPlanVariant | null {
  const slug = plan.slug ?? plan.planSlug ?? plan.packageCode ?? plan.package_code ?? plan.package;
  if (!slug) return null;

  const currency = (plan.currency ?? plan.currency_code ?? plan.currencyCode ?? "USD").toUpperCase();
  const wholesaleField =
    plan.wholesaleCents ?? plan.wholesale_cents ?? plan.price ?? plan.wholesale ?? plan.retailPrice ?? plan.retail_price ?? 0;
  const wholesaleCents = Math.round(wholesaleField > 100 ? wholesaleField : wholesaleField * 100);

  if (!wholesaleCents || wholesaleCents <= 0) {
    return null;
  }

  let periodDays = plan.periodDays ?? plan.validityDays ?? plan.validity_days ?? 0;
  const rawDuration = plan.duration;
  const durationUnit = plan.durationUnit ?? plan.duration_unit;
  if (!periodDays && rawDuration && durationUnit) {
    const normalized = durationUnit.toLowerCase();
    if (normalized.startsWith("day")) {
      periodDays = rawDuration;
    } else if (normalized.startsWith("hour")) {
      periodDays = Math.max(1, Math.ceil(rawDuration / 24));
    } else if (normalized.startsWith("week")) {
      periodDays = rawDuration * 7;
    } else if (normalized.startsWith("month")) {
      periodDays = rawDuration * 30;
    }
  }
  if (!periodDays) {
    periodDays = 30;
  }

  let dataGb = plan.dataGb ?? plan.data_gb ?? (typeof plan.data === "number" ? plan.data : undefined);
  const volumeUnit = plan.volumeUnit ?? plan.volume_unit;
  if (typeof plan.volume === "number") {
    if (volumeUnit?.toLowerCase().startsWith("mb")) {
      dataGb = plan.volume / 1024;
    } else if (volumeUnit?.toLowerCase().startsWith("gb")) {
      dataGb = plan.volume;
    }
  }

  const formattedVolume = (() => {
    if (plan.volumeLabel ?? plan.volume_label) {
      return plan.volumeLabel ?? plan.volume_label;
    }
    if (typeof plan.volume === "number") {
      if (volumeUnit?.toLowerCase().startsWith("mb")) {
        const gbValue = plan.volume / 1024;
        return gbValue >= 1 ? `${gbValue.toFixed(gbValue >= 10 ? 0 : 1)} GB` : `${plan.volume} MB`;
      }
      if (volumeUnit?.toLowerCase().startsWith("gb")) {
        return `${plan.volume} GB`;
      }
    }
    return undefined;
  })();

  const dataLabel =
    plan.dataLabel ??
    plan.data_label ??
    formattedVolume ??
    plan.display_name ??
    plan.title ??
    plan.name ??
    (typeof dataGb === "number" && dataGb > 0 ? `${dataGb} GB` : "Unlimited");

  const planCategory: PlanCategory = (() => {
    if (plan.category) return plan.category;
    const type = (plan.type ?? plan.activeType ?? "").toLowerCase();
    if (type.includes("unlimit")) return "unlimited";
    return dataLabel.toLowerCase().includes("unlimit") ? "unlimited" : "metered";
  })();

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
  const data = await esimRequest<RawPlansResponse>("api/v1/open/package/list", {
    method: "POST",
    body: { locationCode: countryCode },
  });
  ensureSuccess(data);
  const plans =
    data.plans ??
    data.packages ??
    data.data ??
    data.packageList ??
    (Array.isArray(data.obj) ? data.obj : data.obj?.packageList) ??
    [];
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

interface RawOrderResponse extends ApiEnvelope {
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
    packageCode: payload.planSlug,
    package_code: payload.planSlug,
    country_code: payload.countryCode,
    locationCode: payload.countryCode,
    email: payload.email,
    customer_name: payload.customerName,
    iccid: payload.iccid,
    metadata: payload.metadata,
  };

  const response = await esimRequest<RawOrderResponse>("api/v1/open/esim/order", {
    method: "POST",
    body,
  });
  ensureSuccess(response);

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
