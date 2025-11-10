"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { mockProvisionEsim } from "@/lib/mockServices";
import type { DestinationSelection, EmailState, JourneyState, PaymentState, StepId } from "./types";
import { DestinationStep } from "./DestinationStep";
import { EmailStep } from "./EmailStep";
import { PaymentStep } from "./PaymentStep";
import { ProvisionStep } from "./ProvisionStep";
import { ReceiptStep } from "./ReceiptStep";
import { Stepper } from "./Stepper";

export function StackedJourney() {
  const { publish } = useToast();
  const [state, setState] = React.useState<JourneyState>({});
  const [stack, setStack] = React.useState<StepId[]>(["destination"]);
  const [active, setActive] = React.useState<StepId>("destination");

  const advanceTo = React.useCallback(
    (step: StepId) => {
      setStack((prev) => {
        const next = prev.includes(step) ? [...prev] : [...prev, step];
        const targetIndex = next.indexOf(step);
        return next.slice(0, targetIndex + 1);
      });
      setActive(step);
    },
    [],
  );

  React.useEffect(() => {
    const shouldProvision = state.payment && stack.includes("provision") && state.esim?.status !== "active";
    if (!shouldProvision || !state.payment) return;
    let cancelled = false;
    async function run() {
      const next = await mockProvisionEsim(state.payment!);
      if (!cancelled) {
        setState((current) => ({ ...current, esim: next }));
        advanceTo("receipt");
      }
    }
    if (!state.esim || state.esim.status === "provisioning") {
      run();
    }
    return () => {
      cancelled = true;
    };
  }, [state.payment, state.esim, stack, advanceTo]);

  const jumpTo = (step: StepId) => {
    if (!stack.includes(step)) return;
    const targetIndex = stack.indexOf(step);
    setStack((prev) => prev.slice(0, targetIndex + 1));
    setActive(step);
  };

  const handleSelectionChange = (selection: DestinationSelection) => {
    setState((current) => ({ ...current, selection, payment: undefined, esim: undefined }));
  };

  const handleDestinationContinue = () => {
    advanceTo("email");
  };

  const handleEmail = (email: EmailState) => {
    setState((current) => ({ ...current, email }));
    advanceTo("payment");
  };

  const handlePayment = (payment: PaymentState) => {
    setState((current) => ({ ...current, payment, esim: { status: "provisioning", activationCode: "", iccid: "", qrSvg: "" } }));
    advanceTo("provision");
  };

  const handleProvisionResend = () => {
    // No-op placeholder for server call in this demo.
  };

  const handlePlanAnother = () => {
    setStack(["destination"]);
    setState((current) => ({ ...current, payment: undefined, esim: undefined }));
    setActive("destination");
  };

  return (
    <div className="pb-24">
      <div className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 pb-16 pt-14 sm:px-6">
        <header className="space-y-4 text-center sm:text-left">
          <p className="tracking-label text-xs text-white/60">Flex Traveller</p>
          <h1 className="text-4xl font-semibold leading-tight">Truely-inspired eSIM checkout</h1>
          <p className="text-sm text-white/70">
            A stacked card journey with email-first auth, secure payments, and instant provisioning — all without losing sight of
            your previous steps.
          </p>
        </header>
        <Stepper stack={stack} active={active} onSelect={jumpTo} />
        <div className="relative">
          {stack.map((step, index) => {
            const isActive = index === stack.length - 1;
            const elevation = index + 1;
            return (
              <div
                key={step}
                className={`transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${index > 0 ? "-mt-24" : ""}`}
                style={{ zIndex: elevation }}
              >
                <div
                  className={`transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${isActive ? "scale-100 opacity-100" : "pointer-events-none scale-[0.985] translate-y-2 opacity-70 blur-[1px]"}`}
                >
                  <Card>
                    {step === "destination" ? (
                      <DestinationStep
                        selection={state.selection}
                        onSelectionChange={handleSelectionChange}
                        onContinue={handleDestinationContinue}
                      />
                    ) : null}
                    {step === "email" ? (
                      <EmailStep emailState={state.email} onContinue={handleEmail} />
                    ) : null}
                    {step === "payment" ? (
                      <PaymentStep
                        selection={state.selection}
                        email={state.email}
                        onSuccess={handlePayment}
                        onError={(message) => publish({ title: message, description: "Please try again." })}
                      />
                    ) : null}
                    {step === "provision" ? (
                      <ProvisionStep
                        payment={state.payment}
                        esim={state.esim}
                        onResend={handleProvisionResend}
                        onViewAccount={() => publish({ title: "Coming soon", description: "Account view is not wired up in the demo." })}
                      />
                    ) : null}
                    {step === "receipt" ? (
                      <ReceiptStep
                        selection={state.selection}
                        email={state.email}
                        payment={state.payment}
                        onPlanAnother={handlePlanAnother}
                      />
                    ) : null}
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
