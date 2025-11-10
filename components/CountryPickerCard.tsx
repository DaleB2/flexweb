"use client";

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
