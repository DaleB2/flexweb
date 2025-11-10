"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CheckoutCountry } from "../types";

export type DestinationStatus = "loading" | "ready" | "error";

interface DestinationStepProps {
  status: DestinationStatus;
  countries: CheckoutCountry[];
  selected?: CheckoutCountry | null;
  onSelect: (country: CheckoutCountry) => void;
  onRetry: () => void;
}

export function DestinationStep({ status, countries, selected, onSelect, onRetry }: DestinationStepProps) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return countries;
    return countries.filter((country) => country.name.toLowerCase().includes(value));
  }, [countries, query]);

  return (
    <div className="space-y-8">
      <CardHeader className="space-y-3 p-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/40">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
            <MapPin className="h-3 w-3" />
          </span>
          Destination
        </div>
        <CardTitle className="text-3xl">Where are you heading next?</CardTitle>
        <CardDescription className="text-sm text-white/70">
          Pick a country to pull live Flex eSIM plans. Your landing view stays open, so you can compare while you decide.
        </CardDescription>
      </CardHeader>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">Search</Label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <MapPin className="h-5 w-5 text-white/50" aria-hidden />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Start typing a country"
              className="border-0 bg-transparent text-base text-white placeholder:text-white/40 focus-visible:ring-0"
            />
          </div>
        </div>

        {status === "loading" ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-2xl border border-white/5 bg-white/10"
              />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div>
              We couldn’t load the destinations right now. Refresh or retry in a moment.
            </div>
            <Button variant="ghost" onClick={onRetry} className="text-red-100 hover:bg-red-500/20">
              Retry
            </Button>
          </div>
        ) : null}

        {status === "ready" ? (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                No countries match that yet. Try another spelling or scroll to explore top picks.
              </p>
            ) : (
              filtered.map((country) => {
                const isSelected = selected?.code === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => onSelect(country)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                      "hover:-translate-y-px hover:border-white/25 hover:bg-white/10",
                      isSelected
                        ? "border-white/30 bg-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flagEmoji ?? "🌍"}</span>
                      <span className="text-sm font-semibold text-white">{country.name}</span>
                    </div>
                    {isSelected ? (
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white">
                        Selected
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
