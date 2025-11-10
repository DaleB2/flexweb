import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-truelySky/40 bg-white px-4 text-sm font-medium text-truelyNavy placeholder:text-truelyNavy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-truelySky/40",
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
