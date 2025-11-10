"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 bg-[#01081c]/60 backdrop-blur-sm", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right";
  }
>(({ className, side = "right", children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex w-full flex-col border border-l-0 border-truelySky/30 bg-white shadow-[0_32px_120px_rgba(5,25,71,0.25)] focus:outline-none sm:max-w-xl",
        side === "right" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
        <div className="flex items-center justify-between border-b border-truelySky/30 px-6 py-4">
          <DialogPrimitive.Title className="text-xs font-semibold uppercase tracking-[0.34em] text-truelyNavy/70">
            Checkout
          </DialogPrimitive.Title>
        <SheetClose className="rounded-full p-2 text-truelyNavy/60 transition hover:bg-truelyMint/60 hover:text-truelyNavy">
          <X className="h-5 w-5" />
        </SheetClose>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1 text-left", className)} {...props} />
);

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-8 flex flex-col gap-3", className)} {...props} />
);

export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter };
