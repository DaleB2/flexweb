"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CheckoutCountry } from "../types";

export type DestinationStatus = "loading" | "ready" | "error";

interface DestinationStepProps {
  status: DestinationStatus;
  countries: CheckoutCountry[];
  selected?: CheckoutCountry | null;
  onSelect: (country: CheckoutCountry) => void;
  onRetry: () => void;
}

const fallbackFlag = "🌍";

export function DestinationStep({ status, countries, selected, onSelect, onRetry }: DestinationStepProps) {
  const options = React.useMemo(
    () => countries.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  );

  const handleSelect = React.useCallback(
    (value: string) => {
      const match = options.find((country) => country.code === value);
      if (match) {
        onSelect(match);
      }
    },
    [onSelect, options],
  );

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
        {status === "error" ? (
          <div className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div>We couldn’t load the destinations right now. Refresh or retry in a moment.</div>
            <Button variant="ghost" onClick={onRetry} className="text-red-100 hover:bg-red-500/20">
              Retry
            </Button>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">Country</Label>
          {status === "loading" ? (
            <div className="h-14 animate-pulse rounded-2xl border border-white/5 bg-white/10" />
          ) : (
            <Select
              value={selected?.code ?? ""}
              onValueChange={handleSelect}
              disabled={status !== "ready" || options.length === 0}
            >
              <SelectTrigger className="h-auto min-h-[3.5rem] w-full justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white shadow-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0 data-[placeholder]:text-white/40">
                <div className="flex w-full items-center gap-3">
                  <span className="text-lg text-white/80">{selected?.flagEmoji ?? fallbackFlag}</span>
                  <SelectValue placeholder="Choose your destination" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0b152a] text-white">
                {options.length > 0 ? (
                  options.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className="flex items-center gap-3 text-sm text-white focus:bg-white/10 focus:text-white"
                    >
                      <span className="text-lg">{country.flagEmoji ?? fallbackFlag}</span>
                      <span className="font-medium">{country.name}</span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-white/60">No destinations available yet.</div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {status === "ready" && countries.length > 0 ? (
          <p className="text-xs text-white/60">
            Tip: You can jump back here anytime to compare another destination without losing your progress.
          </p>
        ) : null}
      </div>
    </div>
  );
}
