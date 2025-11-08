'use client';

import { useState, useEffect } from 'react';

interface Props {
  onSelect: (code: string) => void;
}

export default function CountrySelector({ onSelect }: Props) {
  const [countries, setCountries] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/catalog').then(r => r.json()).then(data => {
      setCountries(data.countries || []);
    }).catch(err => {
      console.error('Failed to fetch countries', err);
      setCountries([]);
    });
  }, []);

  const filtered = countries.filter(c => c.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <input
        type="text"
        placeholder="Search country..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="border-2 border-gray-200 p-2 mb-4 w-full rounded"
      />
      <select
        className="border-2 border-gray-200 p-2 w-full rounded"
        onChange={e => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Select your destination</option>
        {filtered.map(code => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
    </div>
  );
}
