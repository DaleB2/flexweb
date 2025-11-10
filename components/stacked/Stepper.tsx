"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StepId } from "./types";

const STEP_ORDER: { id: StepId; label: string }[] = [
  { id: "destination", label: "Destination" },
  { id: "email", label: "Email" },
  { id: "payment", label: "Payment" },
  { id: "provision", label: "Provision" },
  { id: "receipt", label: "Receipt" },
];

interface StepperProps {
  stack: StepId[];
  active: StepId;
  onSelect: (step: StepId) => void;
}

export function Stepper({ stack, active, onSelect }: StepperProps) {
  const activeIndex = stack.indexOf(active);

  return (
    <div className="sticky top-0 z-40 -mx-4 mb-6 flex items-center justify-center bg-[#050c1a]/70 px-4 py-4 backdrop-blur lg:-mx-0 lg:rounded-full lg:border lg:border-white/10">
      <nav className="flex flex-wrap justify-center gap-2" aria-label="Checkout steps">
        {STEP_ORDER.map((step, index) => {
          const reached = index <= activeIndex;
          const isActive = step.id === active;
          const disabled = !reached;
          const label = step.label.toUpperCase();
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => (reached && !isActive ? onSelect(step.id) : undefined)}
              disabled={disabled}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "tracking-label border border-transparent px-3 py-2 text-[0.65rem]", // uppercase style
                "transition duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                reached ? "text-white/90" : "text-white/30",
                !isActive && reached ? "hover:bg-white/10" : "",
                isActive
                  ? "bg-white/20 text-white shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                  : "",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
