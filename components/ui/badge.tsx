"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "inline-flex items-center rounded-full bg-truelyMint/70 px-3 py-1 text-xs font-semibold text-truelyNavy",
  success: "inline-flex items-center rounded-full bg-[#d9fbe6] px-3 py-1 text-xs font-semibold text-[#14643c]",
  warning: "inline-flex items-center rounded-full bg-[#fff3d6] px-3 py-1 text-xs font-semibold text-[#7a5300]",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants[variant], className)} {...props} />
));
Badge.displayName = "Badge";

export { Badge };
