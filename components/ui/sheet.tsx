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
    className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right";
    title?: React.ReactNode;
  }
>(({ className, side = "right", title, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex w-full flex-col border border-white/10 bg-[#0b1424]/95 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl focus:outline-none sm:max-w-lg",
        side === "right" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <DialogPrimitive.Title className="text-base font-semibold tracking-wide text-white/90">
          {title}
        </DialogPrimitive.Title>
        <SheetClose className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </SheetClose>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2 text-left", className)} {...props} />
);

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-8 flex flex-col gap-3", className)} {...props} />
);

export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter };
