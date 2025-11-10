"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { catalog } from "@/lib/mockCatalog";
import type { CountryOption, DestinationSelection, PlanOption } from "./types";

interface DestinationStepProps {
  selection?: DestinationSelection;
  onSelectionChange: (selection: DestinationSelection) => void;
  onContinue: () => void;
}

export function DestinationStep({ selection, onSelectionChange, onContinue }: DestinationStepProps) {
  const [query, setQuery] = React.useState("");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetCountry, setSheetCountry] = React.useState<CountryOption | null>(null);
  const featured = React.useMemo(() => catalog.filter((country) => country.featured), []);

  const filteredCountries = React.useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return catalog;
    return catalog.filter((country) => country.name.toLowerCase().includes(lower));
  }, [query]);

  const handlePlanSelect = React.useCallback(
    (country: CountryOption, plan: PlanOption) => {
      onSelectionChange({ country, plan });
      setSheetOpen(false);
    },
    [onSelectionChange],
  );

  const openSheetForCountry = (country: CountryOption) => {
    setSheetCountry(country);
    setSheetOpen(true);
  };

  React.useEffect(() => {
    if (!sheetOpen) {
      setSheetCountry(null);
    }
  }, [sheetOpen]);

  const renderPlans = (country: CountryOption, plans: PlanOption[]) => {
    return (
      <div className="mt-4 grid gap-3">
        {plans.map((plan) => {
          const isSelected =
            selection?.country.code === country.code && selection?.plan.id === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handlePlanSelect(country, plan)}
              className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:border-white/25 hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-semibold text-white/90">{plan.name}</p>
                <p className="text-xs text-white/60">
                  {plan.dataLabel} • {plan.periodDays} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white/90">
                  {formatPrice(plan.priceCents, plan.currency)}
                </p>
                {plan.badge ? <span className="text-[0.65rem] uppercase tracking-label text-white/50">{plan.badge}</span> : null}
              </div>
              {isSelected ? (
                <span className="ml-3 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-label text-white">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <CardHeader>
        <Label>Destination & Plan</Label>
        <CardTitle className="text-3xl">Where are you headed?</CardTitle>
        <CardDescription>
          Choose a destination to see curated plans built for Truely-style travellers. You can browse now and pay later — we keep
          your picks ready.
        </CardDescription>
      </CardHeader>
      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-white/60">Search destinations</Label>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-white/50" aria-hidden />
            <Input
              placeholder="Try “Japan”, “United States”, …"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-white/60">Featured hotspots</Label>
          <div className="flex flex-wrap gap-3">
            {featured.map((country) => (
              <Button
                key={country.code}
                type="button"
                variant="subtle"
                className="flex items-center gap-2 border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80"
                onClick={() => openSheetForCountry(country)}
              >
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {filteredCountries.map((country) => (
            <div key={country.code} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-label text-white/60">{country.flag}</p>
                  <p className="text-lg font-semibold text-white">{country.name}</p>
                  {country.spotlight ? (
                    <p className="text-xs text-white/60">{country.spotlight}</p>
                  ) : null}
                </div>
                {country.plans.length > 2 ? (
                  <Button variant="subtle" className="px-3 py-2 text-xs" onClick={() => openSheetForCountry(country)}>
                    View all plans
                  </Button>
                ) : null}
              </div>
              {renderPlans(country, country.plans.slice(0, 2))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {selection ? (
            <p className="text-sm text-white/70">
              Selected {selection.country.flag} {selection.country.name} • {selection.plan.name}
            </p>
          ) : (
            <p className="text-sm text-white/50">Pick a plan to continue</p>
          )}
          <Button type="button" disabled={!selection} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          title={sheetCountry ? `${sheetCountry.flag} ${sheetCountry.name} plans` : "Plans"}
        >
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Pick the plan that matches your trip. We surface Unlimited, Large bucket, and Weekend options for each destination.
            </p>
            {sheetCountry ? renderPlans(sheetCountry, sheetCountry.plans) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
