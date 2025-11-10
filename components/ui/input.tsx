"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white placeholder:text-white/40 shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-md transition focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-iris/40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
