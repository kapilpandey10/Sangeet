// components/SearchAndFilter.tsx
import React, { ChangeEvent, useState, useEffect } from 'react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  languageFilter: string;
  onLanguageChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  yearFilter: string;
  onYearChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  availableLanguages: string[];
  availableYearRanges: { label: string; min: number; max: number }[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  yearFilter,
  onYearChange,
  availableLanguages,
  availableYearRanges,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300); // Debounce delay of 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <input
        type="text"
        placeholder="Search by artist, lyrics, or writer..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={languageFilter}
        onChange={onLanguageChange}
        className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Languages</option>
        {availableLanguages.map((lang, idx) => (
          <option key={idx} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={yearFilter}
        onChange={onYearChange}
        className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Years</option>
        {availableYearRanges.map((range, idx) => (
          <option key={idx} value={range.label}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(SearchAndFilter);
