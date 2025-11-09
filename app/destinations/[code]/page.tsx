import Image from "next/image";
import Link from "next/link";

import DestinationPlans from "@/components/DestinationPlans";
import Header from "@/components/Header";
import { listAllCountries, listPlansByLocation } from "@/lib/esim";

import styles from "./page.module.css";

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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveCountryCode(rawParam: string) {
  const trimmed = rawParam.trim();
  if (!trimmed) return null;
  const directMatch = trimmed.toUpperCase();
  if (/^[A-Z]{2}$/.test(directMatch)) {
    return directMatch;
  }

  try {
    const countries = await listAllCountries();
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    const target = slugify(trimmed);

    for (const code of countries) {
      const name = display.of(code) ?? code;
      if (slugify(name) === target) {
        return code;
      }
    }
  } catch (error) {
    console.error("Failed to resolve destination code", error);
  }

  return null;
}

interface DestinationPageProps {
  params: { code: string };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const param = params.code?.toString() ?? "";
  const resolvedCode = await resolveCountryCode(param);

  if (!resolvedCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight via-plum to-midnight text-white">
        <Header />
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-28 pt-32 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold">Destination not found</h1>
          <p className="text-base text-white/75">Double-check the country code and try again.</p>
          <Link
            href="/destinations"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-iris to-fuchsia px-5 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white shadow-[0_22px_70px_rgba(123,60,237,0.55)]"
          >
            Back to destinations
          </Link>
        </main>
      </div>
    );
  }

  let catalog: Awaited<ReturnType<typeof listPlansByLocation>> | null = null;
  let loadError: string | null = null;

  try {
    catalog = await listPlansByLocation(resolvedCode);
  } catch (error) {
    console.error(`Failed to load plans for ${resolvedCode}`, error);
    loadError = "We couldn’t load plans for this destination right now. Please refresh or try again soon.";
  }

  const countryName = getCountryName(resolvedCode);
  const heroImage = heroShots[resolvedCode.charCodeAt(0) % heroShots.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-plum to-midnight text-white">
      <Header />
      <main className="pb-28 pt-28">
        <section className="border-b border-white/10 bg-white/5">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                Flex destination guide
              </span>
              <h1 className="text-4xl font-semibold sm:text-[3rem]">{countryName}</h1>
              <p className="max-w-xl text-lg text-white/75">
                Unlimited eSIM plans picked for {countryName}. Pricing is shown in full—no surprise fees when you hit checkout.
              </p>
              <Link
                href="/destinations"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold uppercase tracking-[0.32em] text-white/80 transition hover:border-white hover:text-white"
              >
                Browse other countries →
              </Link>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-[0_25px_80px_rgba(18,7,50,0.35)]">
              <Image src={heroImage} alt={countryName} width={800} height={600} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
          {loadError ? (
            <div className="rounded-[32px] border border-fuchsia/40 bg-fuchsia/10 p-6 text-sm text-fuchsia">{loadError}</div>
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
