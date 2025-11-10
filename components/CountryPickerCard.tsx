"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search, Globe2, Loader2 } from "lucide-react";

import { fetchCountries, type EsimCountry } from "@/lib/esimAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PlanIntent = "unlimited" | "metered";

export interface CountryPickerCardProps {
  intent?: PlanIntent;
  selectedCountry?: EsimCountry;
  onPlanIntent: (country: EsimCountry, intent: PlanIntent) => void;
}

const intentCopy: Record<PlanIntent, { title: string; description: string }> = {
  unlimited: {
    title: "Unlimited data",
    description: "Unlimited usage with soft-fair data policies matching Truely's hero experience.",
  },
  metered: {
    title: "Pay per GB",
    description: "Flexible metered plans that scale with your trip length and usage.",
  },
};

export function CountryPickerCard({
  selectedCountry,
  onPlanIntent,
  intent,
}: CountryPickerCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [countries, setCountries] = useState<EsimCountry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCountries() {
      setIsLoading(true);
      try {
        const data = await fetchCountries();
        if (!cancelled) {
          setCountries(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("We couldn't load countries. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCountries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return countries.slice(0, 12);
    }

    return countries
      .filter((country) =>
        [country.name, country.region, country.code]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term)),
      )
      .slice(0, 12);
  }, [countries, searchTerm]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (filteredCountries.length === 0) return;
    onPlanIntent(filteredCountries[0], intent ?? "unlimited");
  };

  const renderCountryButton = (country: EsimCountry) => {
    const isSelected = country.code === selectedCountry?.code;

    return (
      <button
        key={country.code}
        type="button"
        onClick={() => onPlanIntent(country, intent ?? "unlimited")}
        className={cn(
          "group flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition",
          "border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10",
          isSelected && "border-white/60 bg-white/20",
        )}
      >
        <div className="flex items-center gap-3 text-left">
          <span className="text-2xl" aria-hidden>
            {country.flagEmoji ?? "🌐"}
          </span>
          <div>
            <p className="font-medium text-white">{country.name}</p>
            <p className="text-xs text-white/70">{country.region ?? "Global"}</p>
          </div>
        </div>
        <Globe2 className="h-4 w-4 text-white/60 transition group-hover:text-white" />
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_32px_120px_rgba(4,25,70,0.35)] backdrop-blur">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.36em] text-white/60">Choose destination</p>
        <h2 className="text-2xl font-semibold">Where are you heading?</h2>
        <p className="text-sm text-white/70">
          Search 200+ countries and regions. Plans stack in place just like Truely&apos;s signature checkout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search countries"
          className="w-full rounded-2xl border-white/15 bg-white/10 py-5 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
      </form>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {isLoading && (
          <div className="col-span-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-white/60" />
            <span className="text-sm text-white/70">Loading destinations…</span>
          </div>
        )}
        {error && !isLoading && (
          <div className="col-span-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
        {!isLoading && !error && filteredCountries.map(renderCountryButton)}
      </div>

      <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(intentCopy) as PlanIntent[]).map((key) => {
          const { title, description } = intentCopy[key];
          return (
            <Button
              key={key}
              type="button"
              onClick={() => {
                const country = selectedCountry ?? filteredCountries[0];
                if (!country) return;
                onPlanIntent(country, key);
              }}
              className="h-auto rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-left text-white shadow-none transition hover:border-white/40 hover:bg-white/20"
              variant={intent === key ? "default" : "ghost"}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">{title}</span>
                <span className="text-xs text-white/60">{description}</span>
              </div>
            </Button>
          );
        })}
import { useMemo, useState } from "react";

import type { EsimCountry } from "@/lib/esimAccess";

const PLAN_TYPES = [
  { key: "unlimited", label: "Unlimited Data" },
  { key: "metered", label: "Pay per GB" },
] as const;

type PlanType = (typeof PLAN_TYPES)[number]["key"];

type Props = {
  countries: EsimCountry[];
  selectedCountryCode?: string;
  onCountrySelect: (country: EsimCountry) => void;
  onPlanTypeSelect: (type: PlanType) => void;
};

export default function CountryPickerCard({
  countries,
  selectedCountryCode,
  onCountrySelect,
  onPlanTypeSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return countries;
    return countries.filter((country) =>
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.code.toLowerCase().includes(query.toLowerCase()),
    );
  }, [countries, query]);

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.36em] text-white/60">Destination</p>
        <h2 className="pt-2 text-2xl font-semibold">Where are you heading?</h2>
      </div>

      <div className="relative">
        <input
          className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-truelyLime"
          placeholder="Search countries or regions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-white/5">
        <ul className="divide-y divide-white/5">
          {filtered.map((country) => {
            const isActive = country.code === selectedCountryCode;
            return (
              <li key={country.code}>
                <button
                  type="button"
                  onClick={() => onCountrySelect(country)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-truelyLime/20 text-white"
                      : "hover:bg-white/10 text-white/85"
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span className="text-lg">{country.flagEmoji}</span>
                    {country.name}
                  </span>
                  <span className="text-xs uppercase tracking-[0.36em] text-white/50">
                    {country.code}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-white/60">No destinations found.</li>
          )}
        </ul>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.32em] text-white/50">Plan type</p>
        <div className="grid grid-cols-2 gap-3">
          {PLAN_TYPES.map((plan) => (
            <button
              key={plan.key}
              type="button"
              onClick={() => onPlanTypeSelect(plan.key)}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-truelyLime hover:text-white"
            >
              {plan.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/50">Pick a plan style to preview exact packages like Truely.</p>
      </div>
    </div>
  );
}

export default CountryPickerCard;
