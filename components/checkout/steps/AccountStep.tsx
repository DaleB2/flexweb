"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { AccountState } from "../types";

const accountSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountStepProps {
  defaultState?: AccountState | null;
  onContinue: (state: AccountState) => void;
}

export function AccountStep({ defaultState, onContinue }: AccountStepProps) {
  const { publish } = useToast();
  const [status, setStatus] = React.useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: defaultState?.email ?? "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (defaultState?.email) {
      form.setValue("email", defaultState.email);
    }
  }, [defaultState, form]);

  const handleForgotPassword = React.useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const email = form.getValues("email");
    if (!email) {
      publish({ title: "Add your email first", description: "Enter your email so we can send the reset link." });
      return;
    }

    if (!supabase) {
      publish({ title: "Supabase isn’t configured", description: "Add your Supabase keys to enable password reset." });
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (resetError) {
      publish({ title: "We couldn’t send that", description: resetError.message ?? "Try again shortly." });
      return;
    }

    publish({ title: "Reset email sent", description: "Check your inbox for the Flex password reset link." });
  }, [form, publish]);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("checking");
    setError(null);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) {
        throw new Error("Unable to verify account");
      }

      const { exists, unavailable } = (await response.json()) as { exists?: boolean; unavailable?: boolean };
      const supabase = createBrowserSupabaseClient();

      if (exists) {
        if (!supabase) {
          publish({
            title: "Supabase keys missing",
            description: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign in.",
          });
          onContinue({ email: values.email, existingAccount: true });
          setStatus("idle");
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) {
          setStatus("idle");
          setError(signInError.message ?? "That password didn’t work.");
          return;
        }

        publish({ title: "Signed in", description: "Welcome back! Your Flex account is active." });
        onContinue({ email: values.email, existingAccount: true });
        setStatus("idle");
        return;
      }

      if (unavailable) {
        publish({
          title: "Account check unavailable",
          description: "We’ll keep going and create your account after payment.",
        });
      } else {
        publish({ title: "New Flex traveller", description: "We’ll create your account right after payment." });
      }

      onContinue({ email: values.email, existingAccount: false });
      setStatus("idle");
    } catch (cause) {
      console.error(cause);
      setStatus("error");
      setError("Something went wrong. Try again in a moment.");
    }
  });

  return (
    <div className="space-y-8">
      <CardHeader className="space-y-3 p-0">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-white/40">Account</div>
        <CardTitle className="text-3xl">Sign in or continue</CardTitle>
        <CardDescription className="text-sm text-white/70">
          Use your Flex account to save receipts and manage eSIMs. New customers can continue and we’ll create your account after payment.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@flexmobile.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-sky-200 transition hover:text-sky-100"
            >
              Forgot password?
            </button>
            <Button type="submit" disabled={status === "checking"} className="min-w-[140px]">
              {status === "checking" ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
