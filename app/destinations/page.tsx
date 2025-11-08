import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import { listAllCountries } from "@/lib/esim";

const fallbackShots = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526481280695-3c4697a1b12b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1200&q=80",
];

function getCountryName(code: string) {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function DestinationsPage() {
  let countries: string[] = [];
  let loadError: string | null = null;

  try {
    countries = await listAllCountries();
  } catch (error) {
    console.error("Failed to list destinations", error);
    loadError = "We couldn’t load destinations right now. Refresh to try again.";
  }

  const normalized = countries
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z]{2}$/.test(code))
    .map((code) => ({ code, name: getCountryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-nurse px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
            Flex destinations directory
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-[3rem]">
            Explore every country Flex covers and pick your plan ahead of time.
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            Tap into curated unlimited data options for each destination. When you find the right fit, jump straight into checkout—no airport kiosks required.
          </p>
        </section>

        {loadError ? (
          <div className="rounded-3xl border border-persian/30 bg-persian/5 p-6 text-sm text-persian">{loadError}</div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {normalized.map((country, index) => (
              <Link
                key={country.code}
                href={`/destinations/${country.code.toLowerCase()}`}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={fallbackShots[index % fallbackShots.length]}
                  alt={country.name}
                  width={640}
                  height={400}
                  className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-1 p-5 text-white">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-white/70">{country.code}</p>
                  <p className="text-lg font-semibold">{country.name}</p>
                  <p className="text-xs text-white/80">Tap to view plans and culture tips →</p>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
