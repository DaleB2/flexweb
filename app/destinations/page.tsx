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
    <div className={styles.page}>
      <Header />
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <span className={styles.heroBadge}>Flex destinations directory</span>
          <h1>Explore everywhere Flex keeps you connected.</h1>
          <p>
            Tap into curated unlimited data options for each destination. When you find the right fit, jump straight into
            checkout—no airport kiosks required.
          </p>
        </div>
      </section>

      {loadError ? (
        <div className={styles.error}>{loadError}</div>
      ) : (
        <section className={styles.gridSection}>
          <div className={styles.gridHeader}>
            <div>
              <h2>Browse the full list</h2>
              <p>Search by country name to jump directly to its page and view live plan pricing.</p>
            </div>
            <Link href="/" className={styles.linkButton}>
              Back to home
            </Link>
          </div>
          <div className={styles.destinationGrid}>
            {normalized.map((country, index) => (
              <Link key={country.code} href={`/destinations/${country.code.toLowerCase()}`} className={styles.card}>
                <Image
                  src={fallbackShots[index % fallbackShots.length]}
                  alt={country.name}
                  width={640}
                  height={400}
                  className={styles.cardImage}
                />
                <div className={styles.cardBody}>
                  <span>{country.code}</span>
                  <strong>{country.name}</strong>
                  <p>Tap to view plans and travel tips →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
