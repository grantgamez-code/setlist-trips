"use client";

import { useState } from "react";
import { LocalGuide as LocalGuideType } from "@/lib/local-guide";

export default function LocalGuide({ city, country }: { city: string; country: string }) {
  const [guide, setGuide] = useState<LocalGuideType | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  function handleRequest() {
    setRequested(true);
    setLoading(true);
    fetch(`/api/local-guide?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`)
      .then((res) => res.json())
      .then((data) => {
        setGuide(data.guide);
        setIsLive(Boolean(data.live));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  if (!requested) {
    return (
      <div className="mt-8 border border-neutral-700 p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Eat & do · {city}
        </div>
        <p className="mt-2 max-w-md text-sm text-neutral-400">
          One can't-miss meal, one can't-miss thing to do — the rest of the
          city's worth is in the full itinerary.
        </p>
        <button
          type="button"
          onClick={handleRequest}
          className="mt-4 border border-[#f6f3ea] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#f6f3ea] transition hover:bg-[#f6f3ea] hover:text-[#0a1410]"
        >
          Get the local guide
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-8 border border-neutral-700 p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Eat & do · {city}
        </div>
        <p className="mt-2 text-sm text-neutral-500">Scouting the city…</p>
      </div>
    );
  }

  if (!guide) return null;

  return (
    <div className="mt-8 border border-neutral-700 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Eat & do · {city}
        </div>
        <span
          className={`text-xs font-bold uppercase tracking-widest ${
            isLive ? "text-emerald-400" : "text-neutral-600"
          }`}
        >
          {isLive ? "AI-generated" : "Sample guide"}
        </span>
      </div>

      <p className="mt-3 text-sm italic text-neutral-300">{guide.intro}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="border border-neutral-800 p-3">
          <span className="inline-block bg-[#f6f3ea] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0a1410]">
            Can't-miss food
          </span>
          <div className="mt-2 text-sm font-bold text-[#f6f3ea]">{guide.mustEat.name}</div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            {guide.mustEat.cuisine} · {guide.mustEat.neighborhood}
          </div>
          <p className="mt-2 text-xs text-neutral-400">{guide.mustEat.blurb}</p>
        </div>

        <div className="border border-neutral-800 p-3">
          <span className="inline-block bg-[#1fae72] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0a1410]">
            Can't-miss activity
          </span>
          <div className="mt-2 text-sm font-bold text-[#f6f3ea]">{guide.mustDo.name}</div>
          <p className="mt-2 text-xs text-neutral-400">{guide.mustDo.blurb}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-neutral-600">
        Want the rest of the trip mapped out — every meal, every day? That's
        the full itinerary add-on below.
      </p>
    </div>
  );
}
