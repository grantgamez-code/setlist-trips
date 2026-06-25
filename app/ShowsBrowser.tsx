"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Show } from "@/lib/data";

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export default function ShowsBrowser({ shows }: { shows: Show[] }) {
  const artists = useMemo(
    () => Array.from(new Set(shows.map((s) => s.artist))).sort(),
    [shows]
  );
  const countries = useMemo(
    () => Array.from(new Set(shows.map((s) => s.country))).sort(),
    [shows]
  );

  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(
    new Set()
  );
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(
    new Set()
  );
  const [query, setQuery] = useState("");

  const filteredShows = shows.filter((show) => {
    const artistMatch =
      selectedArtists.size === 0 || selectedArtists.has(show.artist);
    const countryMatch =
      selectedCountries.size === 0 || selectedCountries.has(show.country);
    const q = query.trim().toLowerCase();
    const queryMatch =
      q === "" ||
      show.artist.toLowerCase().includes(q) ||
      show.venue.toLowerCase().includes(q) ||
      show.city.toLowerCase().includes(q) ||
      show.country.toLowerCase().includes(q);
    return artistMatch && countryMatch && queryMatch;
  });

  const hasFilters =
    selectedArtists.size > 0 || selectedCountries.size > 0 || query !== "";

  return (
    <div className="mt-10">
      <div className="px-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artist, venue, or city"
          className="mx-auto block w-full max-w-2xl border border-neutral-700 bg-[#0a1410] px-4 py-3 text-center text-sm uppercase tracking-wide text-[#f6f3ea] placeholder:text-neutral-600 focus:border-[#1fae72] focus:outline-none"
        />
      </div>

      <div className="mt-10 grid gap-10 pl-6 sm:grid-cols-[200px_1fr] sm:pl-10">
        <aside className="space-y-8">
          <FilterGroup
            title="Artists"
            options={artists}
            selected={selectedArtists}
            onToggle={(value) =>
              setSelectedArtists((prev) => toggle(prev, value))
            }
          />
          <FilterGroup
            title="Countries"
            options={countries}
            selected={selectedCountries}
            onToggle={(value) =>
              setSelectedCountries((prev) => toggle(prev, value))
            }
          />
          {hasFilters && (
            <button
              onClick={() => {
                setSelectedArtists(new Set());
                setSelectedCountries(new Set());
                setQuery("");
              }}
              className="text-xs font-bold uppercase tracking-widest text-[#1fae72] hover:underline"
            >
              Clear filters
            </button>
          )}
        </aside>

        <div className="space-y-px bg-[#1a2620]">
          {filteredShows.length === 0 && (
            <div className="bg-[#0a1410] p-5 text-xs uppercase tracking-wide text-neutral-500">
              No shows match those filters
            </div>
          )}
          {filteredShows.map((show) => (
            <Link
              key={show.id}
              href={`/trip/${show.id}`}
              className="group block bg-[#0a1410] p-5 transition hover:bg-[#102018]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold uppercase tracking-tight group-hover:text-[#1fae72]">
                    {show.artist}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                    {show.venue} · {show.city}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
                    {show.genre}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                    {new Date(show.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#f6f3ea]">
        {title}
      </h2>
      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 text-xs uppercase tracking-wide text-neutral-400 hover:text-[#f6f3ea]"
          >
            <input
              type="checkbox"
              checked={selected.has(option)}
              onChange={() => onToggle(option)}
              className="h-3.5 w-3.5 border-neutral-600 bg-[#0a1410] accent-[#1fae72]"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
