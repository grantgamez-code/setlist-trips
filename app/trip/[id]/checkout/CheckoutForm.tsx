"use client";

import { useState } from "react";
import { buildFlightBookingLink, buildHotelBookingLink } from "@/lib/booking-links";

const fieldClass =
  "mt-1 w-full border border-neutral-700 bg-[#0a1410] px-3 py-2 text-[#f6f3ea] focus:border-[#1fae72] focus:outline-none";
const labelClass = "block text-xs font-bold uppercase tracking-widest text-neutral-400";

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function CheckoutForm({
  showId,
  tier,
  origin,
  destination,
  city,
  total,
  hotel,
  nights,
  checkIn,
}: {
  showId: string;
  tier: string;
  origin: string;
  destination: string;
  city: string;
  total: number;
  hotel?: string;
  nights?: string;
  checkIn?: string;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // No real charge happens here — this is a mock checkout UI only.
    setTimeout(() => {
      const code = `ST-${showId}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setConfirmationCode(code);
      setConfirmed(true);
      setSubmitting(false);
    }, 900);
  }

  if (confirmed) {
    const checkOutDate =
      checkIn && nights ? addDays(checkIn, parseInt(nights, 10)) : undefined;

    return (
      <div className="mt-8 border border-emerald-500/40 bg-[#0a1410] p-6 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Trip reserved
        </div>
        <div className="mt-3 text-2xl font-black uppercase tracking-tight">
          ${total.toLocaleString()} · {tier} package
        </div>
        <div className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
          Confirmation code: {confirmationCode}
        </div>

        <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">
          <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            Finish booking
          </div>
          <a
            href={buildFlightBookingLink(origin, destination, checkIn ?? new Date().toISOString().slice(0, 10))}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block border border-neutral-700 p-3 text-xs font-bold uppercase tracking-widest text-[#f6f3ea] transition hover:border-[#1fae72]"
          >
            Book your flight on Skyscanner →
          </a>
          {hotel && checkIn && checkOutDate && (
            <a
              href={buildHotelBookingLink(hotel, city, checkIn, checkOutDate)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block border border-neutral-700 p-3 text-xs font-bold uppercase tracking-widest text-[#f6f3ea] transition hover:border-[#1fae72]"
            >
              Book {hotel} on Booking.com →
            </a>
          )}
        </div>

        <p className="mx-auto mt-4 max-w-sm text-xs text-neutral-500">
          This reservation isn&apos;t charged yet — finish your flight and
          hotel through the links above to lock in your trip. We may earn a
          referral fee on bookings made through these links.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Traveler info
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full name</label>
            <input required className={fieldClass} placeholder="Jane Doe" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input required type="email" className={fieldClass} placeholder="jane@email.com" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input required type="tel" className={fieldClass} placeholder="(555) 555-5555" />
          </div>
          <div>
            <label className={labelClass}>Departure airport</label>
            <input disabled className={`${fieldClass} opacity-60`} value={origin} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Payment
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Card number</label>
            <input
              required
              inputMode="numeric"
              maxLength={19}
              className={fieldClass}
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div>
            <label className={labelClass}>Expiry</label>
            <input required className={fieldClass} placeholder="MM/YY" />
          </div>
          <div>
            <label className={labelClass}>CVC</label>
            <input required className={fieldClass} placeholder="123" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Billing ZIP</label>
            <input required className={fieldClass} placeholder="90210" />
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-600">
          Prototype only — this form does not transmit or store any real
          payment information.
        </p>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-[#f6f3ea] bg-[#f6f3ea] px-3 py-3 text-xs font-bold uppercase tracking-widest text-black transition hover:bg-transparent hover:text-[#f6f3ea] disabled:opacity-60"
      >
        {submitting ? "Reserving…" : `Reserve trip — $${total.toLocaleString()}`}
      </button>
    </form>
  );
}
