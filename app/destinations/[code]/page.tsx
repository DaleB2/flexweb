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
      <div className={styles.page}>
        <Header />
        <div className={styles.notFound}>
          <div className={styles.notFoundCard}>
            <h1>Destination not found</h1>
            <p>We couldn’t match “{param}” to any supported country. Try searching from the home page.</p>
            <Link href="/destinations" className={styles.backLink}>
              Back to all destinations
            </Link>
          </div>
        </div>
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
    <div className={styles.page}>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.copy}>
            <span className={styles.kicker}>Flex destination guide</span>
            <h1 className={styles.title}>{countryName}</h1>
            <p className={styles.subtitle}>
              Unlimited eSIM plans curated for {countryName}. Pricing is shown in full—no surprise fees when you reach
              checkout.
            </p>
            <Link href="/destinations" className={styles.backLink}>
              Browse other destinations
            </Link>
          </div>
          <div className={styles.heroImageFrame}>
            <Image src={heroImage} alt={countryName} width={1200} height={800} className={styles.heroImage} />
          </div>
        </div>
      </section>

      <div className={styles.mainContent}>
        {loadError ? (
          <div className={styles.errorCard}>{loadError}</div>
        ) : catalog ? (
          <DestinationPlans
            countryCode={resolvedCode}
            countryName={countryName}
            plans={catalog.plans}
            markupPct={catalog.markupPct ?? 18}
            currency={catalog.currency ?? "USD"}
          />
        ) : (
          <div className={styles.emptyState}>Loading plans for {countryName}…</div>
        )}
      </div>
    </div>
  );
}
