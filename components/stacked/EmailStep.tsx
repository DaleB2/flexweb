"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { mockLookupEmail } from "@/lib/mockServices";
import type { EmailState } from "./types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

interface EmailStepProps {
  emailState?: EmailState;
  onContinue: (state: EmailState) => void;
}

export function EmailStep({ emailState, onContinue }: EmailStepProps) {
  const { publish } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [lookup, setLookup] = React.useState<{ existingUser: boolean; hasSession: boolean } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailState?.email ?? "" },
  });

  React.useEffect(() => {
    if (emailState?.email) {
      form.setValue("email", emailState.email);
    }
  }, [emailState?.email, form]);

  const handleLookup = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const result = await mockLookupEmail(values.email);
      setLookup(result);
      if (result.existingUser) {
        if (result.hasSession) {
          onContinue({ email: values.email, existingUser: true, authenticated: true });
        } else {
          setDialogOpen(true);
        }
      } else {
        onContinue({ email: values.email, existingUser: false });
      }
    } catch {
      publish({
        title: "We hit a snag",
        description: "Something went wrong while checking your email. Try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  });

  const handleMagicLink = async () => {
    publish({
      title: "Magic link sent",
      description: "Check your inbox — we emailed a secure login link.",
    });
    setLookup((current) => (current ? { ...current, hasSession: true } : current));
    setDialogOpen(false);
    const email = form.getValues("email");
    onContinue({ email, existingUser: true, magicLinkRequested: true });
  };

  const handleContinueGuest = () => {
    const email = form.getValues("email");
    onContinue({ email, existingUser: Boolean(lookup?.existingUser) });
    setDialogOpen(false);
  };

  return (
    <div>
      <CardHeader>
        <Label>Email-first gate</Label>
        <CardTitle className="text-3xl">We’ll attach this to your account</CardTitle>
        <CardDescription>
          Enter your email to continue. Existing Flex travellers get a magic link; new travellers can head straight to payment.
        </CardDescription>
      </CardHeader>
      <div className="mt-6 space-y-6">
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleLookup}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-white/60">Email</Label>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-white/50" aria-hidden />
                      <Input {...field} type="email" placeholder="you@example.com" autoComplete="email" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-white/60">We’ll attach your order to your account.</p>
            <Button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </Button>
          </form>
        </Form>
        {lookup ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {lookup.existingUser ? (
              <p>
                Looks like you already have a Flex account. {lookup.hasSession ? "You’re signed in — continuing to payment." : "We can send a magic link so you can log in before paying."}
              </p>
            ) : (
              <p>
                No account yet? No problem. We’ll create one for you after checkout so you can manage this eSIM.
              </p>
            )}
          </div>
        ) : null}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in with a magic link</DialogTitle>
            <DialogDescription>
              We’ll email a secure link to {form.getValues("email")}. Follow it and we’ll drop you right back here to finish
              checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleContinueGuest}>
              Continue without signing in
            </Button>
            <Button type="button" onClick={handleMagicLink}>
              Send magic link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
