"use client";

import { useEffect, useState } from "react";
import { DayPlan, getItineraryPrice, ITINERARY_DISCOUNT_PERCENT } from "@/lib/itinerary";

export default function FullItinerary({
  city,
  country,
  nights,
  added,
  onToggle,
}: {
  city: string;
  country: string;
  nights: number;
  added: boolean;
  onToggle: (added: boolean) => void;
}) {
  const [exampleDay, setExampleDay] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setExampleDay(null);
    fetch(`/api/itinerary?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&days=1`)
      .then((res) => res.json())
      .then((data) => {
        setExampleDay(data.itinerary?.days?.[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city, country]);

  return (
    <div className="mt-8 border border-[#1fae72]/50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            Full day-by-day itinerary
          </div>
          <p className="mt-1 max-w-md text-sm text-neutral-400">
            One activity, one lunch, and one dinner pick for every day of
            your trip ({nights} {nights === 1 ? "day" : "days"}) — not just
            the show night. Plus {ITINERARY_DISCOUNT_PERCENT}% off the rest
            of your trip.
          </p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 border border-neutral-700 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#f6f3ea] hover:border-[#1fae72]">
          <input
            type="checkbox"
            checked={added}
            onChange={(e) => onToggle(e.target.checked)}
            className="accent-[#1fae72]"
          />
          +${getItineraryPrice(nights)}
        </label>
      </div>

      <div className="relative mt-5 overflow-hidden border border-neutral-800 p-4">
        {loading && (
          <p className="text-xs text-neutral-500">Loading example day…</p>
        )}

        {!loading && exampleDay && (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#f6f3ea]">
                Day {exampleDay.day} example
              </span>
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Free preview
              </span>
            </div>
            <div className="mt-2 space-y-2 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wide text-[#1fae72]">
                  Activity ·{" "}
                </span>
                <span className="text-neutral-300">{exampleDay.activity.name}</span>
                <p className="text-neutral-500">{exampleDay.activity.blurb}</p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wide text-[#1fae72]">
                  Lunch · {exampleDay.lunch.cuisine}{" "}
                </span>
                <span className="text-neutral-300">{exampleDay.lunch.name}</span>
                <p className="text-neutral-500">{exampleDay.lunch.blurb}</p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wide text-[#1fae72]">
                  Dinner · {exampleDay.dinner.cuisine}{" "}
                </span>
                <span className="text-neutral-300">{exampleDay.dinner.name}</span>
                <p className="text-neutral-500">{exampleDay.dinner.blurb}</p>
              </div>
            </div>
            <div className="mt-3 border-t border-neutral-800 pt-2 text-center text-xs text-neutral-500">
              The other {nights - 1 > 0 ? nights - 1 : ""} {nights - 1 === 1 ? "day" : "days"} unlock after purchase
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
