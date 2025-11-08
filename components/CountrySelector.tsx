"use client";

import { useMemo } from "react";

export type CountryOption = {
  code: string;
  name: string;
};

const regionNames = typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : undefined;

function getCountryName(code: string) {
  if (!code) return code;
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return normalized || code;
  }

  try {
    return regionNames?.of(normalized) ?? normalized;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Unsupported country code", normalized, error);
    }
    return normalized;
  }
}

function countryToFlag(code: string) {
  if (!code || code.length !== 2) return "";
  const base = 127397;
  return String.fromCodePoint(...code.toUpperCase().split("").map((char) => base + char.charCodeAt(0)));
}

interface CountrySelectorProps {
  countries: string[];
  selected?: string | null;
  onSelect: (code: string) => void;
}

export default function CountrySelector({ countries, selected, onSelect }: CountrySelectorProps) {
  const options = useMemo<CountryOption[]>(() => {
    return countries
      .map((code) => {
        const normalized = code.trim().toUpperCase();
        return {
          code: normalized,
          name: getCountryName(normalized),
        } satisfies CountryOption;
      })
      .filter((option) => option.code.length === 2)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  return (
    <div className="space-y-2">
      <label
        htmlFor="country-select"
        className="text-xs font-semibold uppercase tracking-[0.28em] text-bottle/60"
      >
        Choose destination
      </label>
      <div className="relative">
        <select
          id="country-select"
          value={selected ?? ""}
          onChange={(event) => onSelect(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-bottle/10 bg-white px-4 py-3 text-sm font-medium text-bottle shadow-inner focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/40"
        >
          <option value="" disabled>
            Select a destination
          </option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {`${countryToFlag(option.code)} ${option.name}`}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-bottle/40" aria-hidden>
          ▾
        </span>
      </div>
      {selected && (
        <p className="text-xs text-bottle/60">
          Plans priced in local partners for {countryToFlag(selected)} {getCountryName(selected) ?? selected}.
        </p>
      )}
    </div>
  );
}
