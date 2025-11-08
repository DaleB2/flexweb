'use client';

import { useState, useEffect } from 'react';
import CountrySelector from '../components/CountrySelector';
import PlanSlider from '../components/PlanSlider';

interface PackageData {
  slug: string;
  packageCode: string;
  periodNum: number;
  wholesalePriceCents: number;
  locationCode: string;
}

export default function HomePage() {
  const [country, setCountry] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [markupPct, setMarkupPct] = useState<number>(20);

  const handleCountrySelect = async (code: string) => {
    setCountry(code);
    try {
      const res = await fetch(`/api/catalog?countryCode=${encodeURIComponent(code)}`);
      const data = await res.json();
      const filtered = (data.packages as PackageData[]).filter(p => p.locationCode === code);
      setPackages(filtered);
      if (typeof data.markup_pct === 'number') {
        setMarkupPct(data.markup_pct);
      }
    } catch (err) {
      console.error('Catalog fetch failed', err);
      setPackages([]);
    }
  };

  const handlePlanSelect = (selection: {
    slug: string;
    packageCode: string;
    periodNum: number;
    totalCents: number;
    currency: string;
  }) => {
    console.log('Plan selected:', selection);
    // TODO: navigate to checkout page passing selection
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-hero-overlay text-text-light" style={{ backgroundImage: `var(--clr-bg-hero)` }}>
      <section className="text-center mb-16 px-4">
        <h2 className="text-5xl font-display mb-4">Unlimited Internet That Travels With You</h2>
        <p className="text-lg mb-6">Up to 10× cheaper than roaming</p>
      </section>

      <div className="w-full max-w-3xl p-4 bg-white rounded-lg shadow-lg text-text-dark">
        {!country ? (
          <CountrySelector onSelect={handleCountrySelect} />
        ) : packages.length === 0 ? (
          <div className="py-8 text-center">Loading plans for {country}…</div>
        ) : (
          <PlanSlider
            availableOptions={packages.map(p => ({
              slug: p.slug,
              packageCode: p.packageCode,
              periodNum: p.periodNum,
              wholesaleCents: p.wholesalePriceCents,
            }))}
            markupPct={markupPct}
            currency="USD"
            onSelect={handlePlanSelect}
          />
        )}
      </div>
    </div>
  );
}
