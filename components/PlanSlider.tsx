'use client';

import { useState, useEffect } from 'react';

interface Option {
  slug: string;
  packageCode: string;
  periodNum: number;
  wholesaleCents: number;
}

interface Props {
  availableOptions: Option[];
  markupPct: number;
  currency: string;
  onSelect: (selection: {
    slug: string;
    packageCode: string;
    periodNum: number;
    totalCents: number;
    currency: string;
  }) => void;
}

export default function PlanSlider({ availableOptions, markupPct, currency, onSelect }: Props) {
  if (!availableOptions || availableOptions.length === 0) {
    return <div className="text-center py-8">Loading options…</div>;
  }

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= availableOptions.length) {
      setIndex(0);
    }
  }, [availableOptions, index]);

  const option = availableOptions[index];
  const wholesale = option.wholesaleCents ?? 0;
  const totalCents = Math.round(wholesale * (1 + markupPct / 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIdx = parseInt(e.target.value, 10);
    if (!isNaN(newIdx) && newIdx >= 0 && newIdx < availableOptions.length) {
      setIndex(newIdx);
    }
  };

  const handleSelect = () => {
    onSelect({
      slug: option.slug,
      packageCode: option.packageCode,
      periodNum: option.periodNum,
      totalCents,
      currency,
    });
  };

  return (
    <div className="flex-flex-col space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">How many days of data do you need?</label>
        <input
          type="range"
          min={0}
          max={availableOptions.length - 1}
          value={index}
          onChange={handleChange}
          className="w-full accent-primary"
        />
      </div>
      <div className="text-center">
        <span className="text-2xl font-bold">{option.periodNum}</span> days — {currency}{(totalCents / 100).toFixed(2)}
      </div>
      <button
        onClick={handleSelect}
        className="w-full py-3 bg-primary text-text-light rounded-md hover:bg-accent transition"
      >
        Continue
      </button>
    </div>
  );
}
