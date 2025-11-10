"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CheckoutFlow } from "./CheckoutFlow";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanAnother: () => void;
}

export function CheckoutSheet({ open, onOpenChange, onPlanAnother }: CheckoutSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        title="Flex Checkout"
        className="w-full max-w-full border-l border-white/10 bg-[#050c1a]/95 text-white backdrop-blur-xl sm:w-[560px] sm:max-w-[560px]"
      >
        <CheckoutFlow
          onClose={() => onOpenChange(false)}
          onPlanAnother={onPlanAnother}
        />
      </SheetContent>
    </Sheet>
  );
}
