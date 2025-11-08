import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import DestinationPlanShowcase from "@/components/DestinationPlanShowcase";
import { listPlansByLocation } from "@/lib/esim";

const heroShots = [
  "https://images.unsplash.com/photo-1526481280695-3c4697a1b12b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
];

function getCountryName(code: string) {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(code) ?? code;
  } catch {
    return code;
  }
}

interface DestinationPageProps {
  params: { code: string };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const normalizedCode = params.code?.toString().toUpperCase();

  if (!normalizedCode || !/^[A-Z]{2}$/.test(normalizedCode)) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Header />
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold">Destination not found</h1>
          <p className="text-base text-slate-600">Double-check the country code and try again.</p>
          <Link href="/destinations" className="inline-flex w-fit items-center gap-2 rounded-full bg-coal px-5 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white">
            Back to destinations
          </Link>
        </main>
      </div>
    );
  }

  let catalog: Awaited<ReturnType<typeof listPlansByLocation>> | null = null;
  let loadError: string | null = null;

  try {
    catalog = await listPlansByLocation(normalizedCode);
  } catch (error) {
    console.error(`Failed to load plans for ${normalizedCode}`, error);
    loadError = "We couldn’t load plans for this destination right now. Please refresh or try again soon.";
  }

  const countryName = getCountryName(normalizedCode);
  const heroImage = heroShots[normalizedCode.charCodeAt(0) % heroShots.length];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="pb-24 pt-28">
        <section className="border-b border-slate-200 bg-nurse/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex-1 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                Flex destination guide
              </span>
              <h1 className="text-4xl font-semibold sm:text-[3rem]">{countryName}</h1>
              <p className="max-w-xl text-lg text-slate-600">
                Unlimited eSIM plans picked for {countryName}. Pricing is shown in full—no surprise fees when you hit checkout.
              </p>
              <Link
                href="/destinations"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-600 transition hover:border-coal hover:text-coal"
              >
                Browse other countries →
              </Link>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
              <Image src={heroImage} alt={countryName} width={800} height={600} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
          {loadError ? (
            <div className="rounded-3xl border border-persian/30 bg-persian/5 p-6 text-sm text-persian">{loadError}</div>
          ) : catalog ? (
            <DestinationPlanShowcase
              countryCode={normalizedCode}
              countryName={countryName}
              plans={catalog.plans}
              markupPct={catalog.markupPct ?? 18}
              currency={catalog.currency ?? "USD"}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
