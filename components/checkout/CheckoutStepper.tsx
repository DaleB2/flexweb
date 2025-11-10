"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StepId } from "./types";

const STEPS: { id: StepId; label: string }[] = [
  { id: "destination", label: "Destination" },
  { id: "plan", label: "Plan" },
  { id: "account", label: "Account" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Done" },
];

interface CheckoutStepperProps {
  visited: StepId[];
  active: StepId;
  onSelect: (step: StepId) => void;
}

export function CheckoutStepper({ visited, active, onSelect }: CheckoutStepperProps) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Checkout progress">
      {STEPS.map((step) => {
        const index = visited.indexOf(step.id);
        const reached = index !== -1;
        const isActive = active === step.id;
        return (
          <button
            key={step.id}
            type="button"
            disabled={!reached}
            onClick={() => (reached && !isActive ? onSelect(step.id) : undefined)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
              reached ? "text-white" : "cursor-not-allowed text-white/30",
              isActive ? "shadow-[0_0_25px_rgba(255,255,255,0.25)] text-white" : "hover:-translate-y-px hover:bg-white/10",
            )}
            aria-current={isActive ? "step" : undefined}
          >
            <span className="tracking-tight">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
