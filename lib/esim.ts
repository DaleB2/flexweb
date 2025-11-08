import crypto from "crypto";

const ESIM_BASE_URL = process.env.ESIM_ACCESS_BASE_URL ?? "https://api.esimaccess.com";
const ESIM_ACCESS_CODE = process.env.ESIM_ACCESS_CODE ?? "";
const ESIM_SECRET = process.env.ESIM_SECRET ?? "";
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY ?? "USD";
const DEFAULT_MARKUP = Number(process.env.DEFAULT_MARKUP_PCT ?? 35);

export interface NormalizedPlan {
  slug: string;
  packageCode: string;
  dataGb: number;
  priceCents: number;
  periodDays: number;
  currency: string;
}

export function buildSignatureHeaders(body: unknown) {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID();
  const serializedBody = JSON.stringify(body ?? {});
  const payload = `${timestamp}${requestId}${ESIM_ACCESS_CODE}${serializedBody}`;
  const signature = crypto
    .createHmac("sha256", ESIM_SECRET)
    .update(payload)
    .digest("hex")
    .toLowerCase();

  return {
    "RT-AccessCode": ESIM_ACCESS_CODE,
    "RT-Timestamp": timestamp,
    "RT-RequestID": requestId,
    "RT-Signature": signature,
    "Content-Type": "application/json",
  } satisfies HeadersInit;
}

function parseDataGb(plan: Record<string, unknown>): number {
  const candidateFields = ["dataGb", "flowGb"] as const;
  for (const field of candidateFields) {
    const value = plan[field];
    if (typeof value === "number") return value;
  }

  const mbFields = ["flow", "traffic", "data"] as const;
  for (const field of mbFields) {
    const value = plan[field];
    if (typeof value === "number") return value / 1024;
  }

  const tryExtract = (value?: unknown) => {
    if (typeof value !== "string") return NaN;
    const match = value.match(/(\d+(?:\.\d+)?)\s*(?:gb|GB)/);
    return match ? Number(match[1]) : NaN;
  };

  return (
    tryExtract(plan.packageName as string) ||
    tryExtract(plan.name as string) ||
    tryExtract(plan.title as string) ||
    tryExtract(plan.slug as string) ||
    0
  );
}

function normalizePlans(rawPlans: unknown[]): NormalizedPlan[] {
  return rawPlans
    .map((plan) => (typeof plan === "object" && plan !== null ? plan : {}))
    .map((plan) => {
      const record = plan as Record<string, unknown>;
      const dataGb = Number(parseDataGb(record)) || 0;
      const priceCents = Number(
        record.wholesalePriceCents ?? record.priceCents ?? record.price1e2 ?? 0,
      );
      const periodDays = Number(record.periodNum ?? record.validDays ?? record.days ?? 30);
      const slug = (record.slug ?? record.packageName ?? record.packageCode ?? "plan").toString();
      const packageCode = (record.packageCode ?? record.code ?? slug).toString();

      return {
        slug,
        packageCode,
        dataGb,
        priceCents,
        periodDays,
        currency: (record.currency ?? DEFAULT_CURRENCY).toString(),
      } satisfies NormalizedPlan;
    })
    .filter((plan) => plan.dataGb > 0 && plan.priceCents > 0)
    .sort((a, b) => a.dataGb - b.dataGb);
}

export async function listPlansByLocation(locationCode: string) {
  if (!ESIM_ACCESS_CODE || !ESIM_SECRET) {
    return {
      countryCode: locationCode,
      plans: fallbackPlans(locationCode),
      markupPct: DEFAULT_MARKUP,
      markup_pct: DEFAULT_MARKUP,
      currency: DEFAULT_CURRENCY,
    };
  }

  const body = { locationCode, type: "BASE", slug: "", packageCode: "" };
  const response = await fetch(`${ESIM_BASE_URL}/api/v1/open/package/list`, {
    method: "POST",
    headers: buildSignatureHeaders(body),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch plans for ${locationCode}`);
  }

  const json = await response.json();
  const rawPlans = Array.isArray(json?.obj?.packageList) ? (json.obj.packageList as unknown[]) : [];
  const plans = normalizePlans(rawPlans);

  return {
    countryCode: locationCode,
    plans: plans.length > 0 ? plans : fallbackPlans(locationCode),
    markupPct: DEFAULT_MARKUP,
    markup_pct: DEFAULT_MARKUP,
    currency: DEFAULT_CURRENCY,
  };
}

export async function listAllCountries() {
  if (!ESIM_ACCESS_CODE || !ESIM_SECRET) {
    return fallbackCountries();
  }

  const body = { locationCode: "", type: "BASE", slug: "", packageCode: "" };
  const response = await fetch(`${ESIM_BASE_URL}/api/v1/open/package/list`, {
    method: "POST",
    headers: buildSignatureHeaders(body),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  const json = await response.json();
  const rawList: unknown[] = Array.isArray(json?.obj?.packageList) ? json.obj.packageList : [];
  const codes = Array.from(new Set(rawList.map((entry) => entry.locationCode).filter(Boolean)));
  return codes.sort();
}

function fallbackCountries(): string[] {
  return ["US", "MX", "GB", "ES", "JP", "TH", "BR", "AU", "FR", "IT"];
}

function fallbackPlans(countryCode: string): NormalizedPlan[] {
  return [
    { slug: `${countryCode.toLowerCase()}-5gb`, packageCode: `${countryCode}-5`, dataGb: 5, priceCents: 750, periodDays: 7, currency: DEFAULT_CURRENCY },
    { slug: `${countryCode.toLowerCase()}-10gb`, packageCode: `${countryCode}-10`, dataGb: 10, priceCents: 1150, periodDays: 15, currency: DEFAULT_CURRENCY },
    { slug: `${countryCode.toLowerCase()}-20gb`, packageCode: `${countryCode}-20`, dataGb: 20, priceCents: 1850, periodDays: 30, currency: DEFAULT_CURRENCY },
    { slug: `${countryCode.toLowerCase()}-50gb`, packageCode: `${countryCode}-50`, dataGb: 50, priceCents: 3250, periodDays: 45, currency: DEFAULT_CURRENCY },
  ];
}
