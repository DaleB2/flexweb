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
  countryCode?: string;
}

interface CountriesResponse {
  countries: EsimCountry[];
}

interface PlansResponse {
  plans: EsimPlanVariant[];
}

export interface EsimPackageSummary {
  id: string;
  planCode: string;
  name: string;
  dataLabel: string;
  days: number;
  unlimited: boolean;
  price: {
    amount: number;
    currency: string;
  };
}

interface PackagesResponse {
  packages: EsimPackageSummary[];
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed with ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

export async function fetchCountries(): Promise<EsimCountry[]> {
  const data = await fetchJson<CountriesResponse>("/api/esim/countries");
  return data.countries;
}

export async function fetchPlans(countryCode: string): Promise<EsimPlanVariant[]> {
  if (!countryCode) return [];
  const data = await fetchJson<PlansResponse>(`/api/esim/plans?countryCode=${encodeURIComponent(countryCode)}`);
  return data.plans;
}

export async function fetchPackages(countryCode: string): Promise<EsimPackageSummary[]> {
  if (!countryCode) return [];
  const data = await fetchJson<PackagesResponse>(`/api/esim/packages?country=${encodeURIComponent(countryCode)}`);
  return data.packages;
}
