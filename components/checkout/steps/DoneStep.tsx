"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DoneStepProps {
  email: string;
  onPlanAnother: () => void;
  onClose: () => void;
}

export function DoneStep({ email, onPlanAnother, onClose }: DoneStepProps) {
  return (
    <div className="space-y-8">
      <CardHeader className="space-y-3 p-0">
        <div className="text-xs font-semibold uppercase tracking-[0.32em] text-white/40">Done</div>
        <CardTitle className="text-3xl">You’re set.</CardTitle>
        <CardDescription className="text-sm text-white/70">
          We’ll email your eSIM QR and setup instructions to {email} shortly.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4 text-sm text-white/70">
        <p>Need another trip? Keep the landing page open and jump back in anytime.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/account">Go to My Orders</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onClose();
            onPlanAnother();
          }}
          className="flex-1 border-white/20 bg-transparent text-white hover:-translate-y-px hover:bg-white/10"
        >
          Plan another trip
        </Button>
      </div>
    </div>
  );
}
