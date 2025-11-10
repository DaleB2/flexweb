"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormField = ({ ...props }) => {
  return <Controller {...props} />;
};

const FormItemContext = React.createContext<{ id?: string }>({});

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const useFormItemContext = () => {
  const context = React.useContext(FormItemContext);
  if (!context) {
    throw new Error("useFormItemContext must be used within a FormItem");
  }
  return context;
};

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ className, ...props }, ref) => {
  const { id } = useFormItemContext();
  return <Slot ref={ref} className={className} htmlFor={id} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ className, ...props }, ref) => {
  const { id } = useFormItemContext();
  return <Slot ref={ref} id={id} className={className} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-white/60", className)} {...props} />
  ),
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const body = children ? String(children) : null;
    return (
      <p
        ref={ref}
        className={cn("text-xs font-medium text-rose-300", className)}
        {...props}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

const useFormField = () => {
  const fieldContext = useFormContext();
  const itemContext = useFormItemContext();
  return {
    formItemId: itemContext.id,
    ...fieldContext,
  };
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
