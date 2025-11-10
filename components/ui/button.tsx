"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-iris via-indigo-500 to-fuchsia text-white shadow-[0_16px_50px_rgba(91,43,234,0.45)] transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:shadow-[0_20px_60px_rgba(91,43,234,0.55)]",
        subtle:
          "border border-white/20 bg-white/10 text-white backdrop-blur hover:border-white/30 hover:bg-white/15",
        ghost: "text-white/80 hover:bg-white/10",
      },
      size: {
        default: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        sm: "h-9 px-4 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
