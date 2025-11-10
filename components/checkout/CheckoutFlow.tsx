"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { fetchCountries } from "@/lib/esimAccess";
import { cn } from "@/lib/utils";
import { CheckoutStepper } from "./CheckoutStepper";
import { DestinationStep, type DestinationStatus } from "./steps/DestinationStep";
import { PlanStep, type PlanStatus } from "./steps/PlanStep";
import { AccountStep } from "./steps/AccountStep";
import { PaymentStep } from "./steps/PaymentStep";
import { DoneStep } from "./steps/DoneStep";
import type { AccountState, CheckoutCountry, CheckoutPackage, StepId } from "./types";

interface CheckoutFlowProps {
  onClose: () => void;
  onPlanAnother: () => void;
}

interface PackagesResponse {
  packages: CheckoutPackage[];
}

export function CheckoutFlow({ onClose, onPlanAnother }: CheckoutFlowProps) {
  const { publish } = useToast();
  const [countriesStatus, setCountriesStatus] = React.useState<DestinationStatus>("loading");
  const [countries, setCountries] = React.useState<CheckoutCountry[]>([]);
  const [packagesStatus, setPackagesStatus] = React.useState<PlanStatus>("idle");
  const [packages, setPackages] = React.useState<CheckoutPackage[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<CheckoutCountry | null>(null);
  const [selectedPackage, setSelectedPackage] = React.useState<CheckoutPackage | null>(null);
  const [account, setAccount] = React.useState<AccountState | null>(null);
  const [stack, setStack] = React.useState<StepId[]>(["destination"]);
  const [active, setActive] = React.useState<StepId>("destination");

  const abortRef = React.useRef<AbortController | null>(null);

  const loadCountries = React.useCallback(async () => {
    setCountriesStatus("loading");
    try {
      const data = await fetchCountries();
      setCountries(data);
      setCountriesStatus("ready");
    } catch (error) {
      console.error(error);
      setCountriesStatus("error");
      publish({ title: "Unable to load countries", description: "Check your API keys and retry." });
    }
  }, [publish]);

  React.useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const fetchPackagesForCountry = React.useCallback(
    async (country: CheckoutCountry) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setPackagesStatus("loading");
      setPackages([]);
      try {
        const response = await fetch(
          `/api/esim/packages?country=${encodeURIComponent(country.code)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Failed to load packages");
        }
        const data = (await response.json()) as PackagesResponse;
        setPackages(data.packages ?? []);
        setPackagesStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setPackagesStatus("error");
        publish({ title: "Package fetch failed", description: "We couldn’t load plans. Try again." });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [publish],
  );

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const advanceTo = React.useCallback((step: StepId) => {
    setStack((prev) => {
      if (prev[prev.length - 1] === step) {
        return prev;
      }
      if (prev.includes(step)) {
        const index = prev.indexOf(step);
        return prev.slice(0, index + 1);
      }
      return [...prev, step];
    });
    setActive(step);
  }, []);

  const jumpTo = React.useCallback(
    (step: StepId) => {
      if (!stack.includes(step)) return;
      const index = stack.indexOf(step);
      setStack((prev) => prev.slice(0, index + 1));
      setActive(step);
    },
    [stack],
  );

  const handleCountrySelect = React.useCallback(
    (country: CheckoutCountry) => {
      setSelectedCountry(country);
      setSelectedPackage(null);
      setAccount(null);
      fetchPackagesForCountry(country);
      advanceTo("plan");
    },
    [advanceTo, fetchPackagesForCountry],
  );

  const handlePlanContinue = React.useCallback(() => {
    if (!selectedPackage) return;
    advanceTo("account");
  }, [advanceTo, selectedPackage]);

  const handleAccountContinue = React.useCallback(
    (next: AccountState) => {
      setAccount(next);
      advanceTo("payment");
    },
    [advanceTo],
  );

  const handlePaymentSuccess = React.useCallback(() => {
    advanceTo("done");
  }, [advanceTo]);

  const cards = stack.map((step, index) => {
    const isActive = index === stack.length - 1;
    return (
      <div
        key={step}
        className={cn(
          "transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          index > 0 ? "-mt-24" : "",
        )}
        style={{ zIndex: index + 1 }}
      >
        <div
          className={cn(
            "transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            isActive
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-[0.985] translate-y-2 opacity-70 blur-[1px]",
          )}
        >
          <Card className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.25),0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            {step === "destination" ? (
              <DestinationStep
                status={countriesStatus}
                countries={countries}
                selected={selectedCountry}
                onSelect={handleCountrySelect}
                onRetry={loadCountries}
              />
            ) : null}
            {step === "plan" ? (
              <PlanStep
                status={packagesStatus}
                packages={packages}
                selected={selectedPackage}
                onSelect={(pkg) => setSelectedPackage(pkg)}
                onContinue={handlePlanContinue}
                onRetry={() => selectedCountry && fetchPackagesForCountry(selectedCountry)}
                countryName={selectedCountry?.name}
              />
            ) : null}
            {step === "account" ? (
              <AccountStep defaultState={account} onContinue={handleAccountContinue} />
            ) : null}
            {step === "payment" && selectedCountry && selectedPackage && account ? (
              <PaymentStep
                email={account.email}
                country={selectedCountry}
                pkg={selectedPackage}
                onSuccess={handlePaymentSuccess}
              />
            ) : null}
            {step === "done" && account ? (
              <DoneStep email={account.email} onPlanAnother={onPlanAnother} onClose={onClose} />
            ) : null}
          </Card>
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <CheckoutStepper visited={stack} active={active} onSelect={jumpTo} />
      <div className="relative pb-24">{cards}</div>
    </div>
  );
}
