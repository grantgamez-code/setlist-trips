"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1410]/80 p-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm border border-[#1fae72] bg-[#0a1410] p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 text-neutral-500 hover:text-[#f6f3ea]"
        >
          ✕
        </button>

        <span className="inline-block border border-[#1fae72] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Limited offer
        </span>

        <h2 className="mt-4 text-2xl font-black uppercase leading-tight tracking-tighter text-[#f6f3ea]">
          5% off, plus a
          <br />
          shot at a free trip
        </h2>
        <p className="mt-3 text-sm text-neutral-400">
          Add the full day-by-day itinerary to any booking and get 5% off
          your flight and hotel — plus an automatic entry to win a fully
          paid trip for you and 4 friends to see any artist of your choice.
        </p>

        <Link
          href="/book"
          onClick={close}
          className="mt-5 inline-block border border-[#1fae72] bg-[#1fae72] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#0a1410] transition hover:bg-transparent hover:text-[#1fae72]"
        >
          Book and save
        </Link>

        <p className="mt-4 text-left text-[10px] leading-snug text-neutral-600">
          Fine print: sweepstakes entry available with purchase of the full
          itinerary add-on. Prize trip is credited up to $2,000 per person
          (5 people total, $10,000 max); any cost above that amount is the
          winner's responsibility. No cash value. Void where prohibited.
        </p>
      </div>
    </div>
  );
}
