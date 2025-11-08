"use client";

import { useMemo, useState } from "react";

export type CountryOption = {
  code: string;
  name: string;
};

const regionNames = typeof Intl !== "undefined"
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : undefined;

function getCountryName(code: string) {
  if (!code) return code;
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return normalized || code;
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
  const [query, setQuery] = useState("");

  const options = useMemo<CountryOption[]>(() => {
    return countries
      .map((code) => {
        const normalized = code.trim().toUpperCase();
        return {
          code: normalized,
          name: getCountryName(normalized),
        };
      })
      .filter((option) => option.code.length === 2);
  }, [countries]);

  const filtered = useMemo(() => {
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter(
      (option) => option.name.toLowerCase().includes(lower) || option.code.toLowerCase().includes(lower),
    );
  }, [options, query]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/90 p-4 shadow-inner shadow-white/40 backdrop-blur">
        <label htmlFor="country-search" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-bottle/70">
          Search destination
        </label>
        <input
          id="country-search"
          type="search"
          autoComplete="off"
          placeholder="Try Mexico, Japan, Spain…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-xl border border-white/40 bg-white/70 px-4 py-3 text-sm font-medium text-bottle placeholder:text-bottle/40 focus:border-mint focus:outline-none"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/40 bg-white/70 p-2 backdrop-blur">
        <ul className="space-y-1">
          {filtered.map((option) => {
            const active = option.code === selected;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => onSelect(option.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                    active ? "bg-mint/90 text-bottle shadow-sm" : "hover:bg-white/80 hover:text-bottle"
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <span className="text-xl" aria-hidden>
                      {countryToFlag(option.code)}
                    </span>
                    <span>
                      {option.name}
                      <span className="ml-2 text-xs uppercase tracking-widest text-bottle/50">{option.code}</span>
                    </span>
                  </span>
                  {active && <span className="text-xs font-bold uppercase tracking-wide text-bottle">Selected</span>}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-bottle/60">No destinations match “{query}”.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
