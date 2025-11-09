"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { NormalizedPlan } from "@/lib/esim";

import styles from "./PlanSearch.module.css";

interface CatalogResponse {
  countries?: string[];
  plans?: NormalizedPlan[];
  markup_pct?: number;
  markupPct?: number;
  currency?: string;
  error?: string;
}

interface CountryOption {
  code: string;
  name: string;
  searchKey: string;
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

function formatData(gb: number) {
  if (gb >= 100) {
    return `${Math.round(gb)} GB`;
  }
  if (Number.isInteger(gb)) {
    return `${gb} GB`;
  }
  return `${gb.toFixed(1)} GB`;
}

function formatPeriod(days: number) {
  if (days === 1) return "1 day";
  if (days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "1 month" : `${months} months`;
  }
  return `${days} days`;
}

function normalizeCountryList(codes: string[]): CountryOption[] {
  const display = typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
  return codes
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z]{2}$/.test(code))
    .map((code) => {
      const name = display?.of(code) ?? code;
      const searchKey = name.toLowerCase();
      return { code, name, searchKey } satisfies CountryOption;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PlanSearch() {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<NormalizedPlan[]>([]);
  const [markupPct, setMarkupPct] = useState<number>(Number(process.env.NEXT_PUBLIC_DEFAULT_MARKUP_PCT ?? 18));
  const [currency, setCurrency] = useState<string>(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "USD");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Unable to load destinations");
        }
        if (cancelled) return;
        const normalized = Array.isArray(json.countries) ? normalizeCountryList(json.countries) : [];
        setCountries(normalized);
        const markupFromResponse = json.markup_pct ?? json.markupPct;
        if (typeof markupFromResponse === "number") {
          setMarkupPct(markupFromResponse);
        }
        if (json.currency) {
          setCurrency(json.currency);
        }
      } catch (err) {
        console.error("Failed to fetch countries", err);
        if (!cancelled) {
          setError("We couldn’t reach the catalog. Refresh and try again.");
        }
      }
    };

    void fetchCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCode) {
      setPlans([]);
      return;
    }

    let aborted = false;
    setIsLoading(true);
    setError(null);

    const loadPlans = async () => {
      try {
        const response = await fetch(`/api/catalog?countryCode=${selectedCode}`, { cache: "no-store" });
        const json: CatalogResponse = await response.json();
        if (!response.ok) {
          throw new Error(json.error ?? "Unable to load plans");
        }
        if (aborted) return;
        if (!Array.isArray(json.plans) || json.plans.length === 0) {
          throw new Error("We don’t have plans for that destination yet.");
        }
        setPlans(json.plans);
        const markupFromResponse = json.markup_pct ?? json.markupPct;
        if (typeof markupFromResponse === "number") {
          setMarkupPct(markupFromResponse);
        }
        if (json.currency) {
          setCurrency(json.currency);
        }
      } catch (err) {
        console.error("Failed to load plans", err);
        if (!aborted) {
          setError(err instanceof Error ? err.message : "Couldn’t load plans just now.");
          setPlans([]);
        }
      } finally {
        if (!aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadPlans();

    return () => {
      aborted = true;
    };
  }, [selectedCode]);

  const activeCountry = useMemo(() => {
    return countries.find((option) => option.code === selectedCode) ?? null;
  }, [countries, selectedCode]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return countries.slice(0, 6);
    }
    return countries
      .filter((country) => country.searchKey.includes(normalizedQuery) || slugify(country.name).includes(slugify(normalizedQuery)))
      .slice(0, 6);
  }, [countries, query]);

  const handleSelect = useCallback(
    (code: string) => {
      const match = countries.find((option) => option.code === code);
      if (!match) return;
      setSelectedCode(match.code);
      setQuery(match.name);
    },
    [countries],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (selectedCode) return;
      const bestMatch = suggestions[0];
      if (bestMatch) {
        handleSelect(bestMatch.code);
      }
    },
    [handleSelect, selectedCode, suggestions],
  );

  const handleCheckout = useCallback(
    (plan: NormalizedPlan) => {
      if (!activeCountry) return;
      const params = new URLSearchParams({
        countryCode: activeCountry.code,
        country: activeCountry.name,
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
    [activeCountry, currency, markupPct, router],
  );

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.kicker}>Build your esim</span>
          <h2 className={styles.title}>Search any country to view live pricing.</h2>
          <p className={styles.subtitle}>
            Type where you’re heading. We’ll surface every compatible plan with the markup already applied so you know the exact
            checkout price.
          </p>
        </header>

        <form className={styles.search} onSubmit={handleSubmit}>
          <div className={styles.searchControl}>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={query}
                placeholder="Search destinations, e.g. Austria"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedCode(null);
                }}
                aria-label="Search for a destination"
              />
              <button type="submit" className={styles.searchButton} disabled={countries.length === 0}>
                Search
              </button>
            </div>
            <div className={styles.suggestions} role="list">
              {suggestions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`${styles.suggestion} ${option.code === selectedCode ? styles.suggestionActive : ""}`}
                  onClick={() => handleSelect(option.code)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className={styles.results}>
          {isLoading ? (
            <div className={styles.loadingSkeleton}>
              <div className={styles.loadingBar} />
              <div className={styles.loadingBar} style={{ width: "80%" }} />
              <div className={styles.loadingBar} style={{ width: "60%" }} />
            </div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : plans.length === 0 ? (
            <div className={styles.emptyState}>Pick a destination to view compatible plans.</div>
          ) : (
            plans.map((plan) => (
              <article key={plan.packageCode} className={styles.planCard}>
                <div className={styles.planHeader}>
                  <h3 className={styles.planTitle}>
                    {formatData(plan.dataGb)} · {formatPeriod(plan.periodDays)}
                  </h3>
                  <p className={styles.planPrice}>{formatCurrency(plan.retailPriceCents, currency)}</p>
                </div>
                <p className={styles.planMeta}>
                  Includes taxes, activation, and {markupPct}% Flex service margin. Wholesale: {formatCurrency(plan.wholesalePriceCents, currency)}.
                </p>
                <div className={styles.planActions}>
                  <span className={styles.supportingCopy}>Instant QR delivery · works in phones & hotspots</span>
                  <button type="button" className={styles.planButton} onClick={() => handleCheckout(plan)}>
                    Continue
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
