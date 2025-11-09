import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import { listAllCountries } from "@/lib/esim";

import styles from "./page.module.css";

const fallbackShots = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526481280695-3c4697a1b12b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
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
    <div className="min-h-screen bg-gradient-to-br from-midnight via-plum to-midnight text-white">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-28 pt-28 sm:px-6 lg:px-8">
        <section className="rounded-[40px] border border-white/10 bg-white/5 p-10 shadow-[0_25px_80px_rgba(18,7,50,0.35)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
            Flex destinations directory
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-[3rem]">
            Explore everywhere Flex keeps you connected.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80">
            Tap into curated unlimited data options for each destination. When you find the right fit, jump straight into checkout—no airport kiosks required.
          </p>
        </div>
      </section>

        {loadError ? (
          <div className="rounded-[32px] border border-fuchsia/40 bg-fuchsia/10 p-6 text-sm text-fuchsia">{loadError}</div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {normalized.map((country, index) => (
              <Link
                key={country.code}
                href={`/destinations/${country.code.toLowerCase()}`}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_22px_70px_rgba(18,7,50,0.3)] transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(18,7,50,0.5)]"
              >
                <Image
                  src={fallbackShots[index % fallbackShots.length]}
                  alt={country.name}
                  width={640}
                  height={400}
                  className="h-48 w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-1 p-6">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-white/60">{country.code}</p>
                  <p className="text-xl font-semibold">{country.name}</p>
                  <p className="text-xs text-white/70">Tap to view plans and culture tips →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
