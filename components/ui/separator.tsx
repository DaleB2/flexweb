import * as React from "react";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#d0d5ff]/60",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
