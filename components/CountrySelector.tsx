"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  helperTone?: "light" | "dark";
}

export default function CountrySelector({ countries, selected, onSelect, helperTone = "light" }: CountrySelectorProps) {
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

  const helperClassName = helperTone === "dark" ? "text-white/70" : "text-truelyNavy/70";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="country-select">Choose destination</Label>
        {selected ? <Badge className="gap-2 bg-[#ebefff] text-[#1a1f38]">{countryToFlag(selected)} Ready</Badge> : null}
      </div>
      <Select value={selected ?? undefined} onValueChange={onSelect}>
        <SelectTrigger id="country-select">
          <SelectValue placeholder="Search countries & regions" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {countryToFlag(option.code)} {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected ? (
        <p className={`text-xs font-medium ${helperClassName}`}>
          Showing partner plans in {countryToFlag(selected)} {getCountryName(selected) ?? selected}.
        </p>
      ) : (
        <p className={`text-xs font-medium ${helperClassName}`}>Pick where you’re heading to preview tailored packages.</p>
      )}
    </div>
  );
}
