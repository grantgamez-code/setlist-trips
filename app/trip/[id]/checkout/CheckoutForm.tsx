"use client";

import { useState } from "react";

const fieldClass =
  "mt-1 w-full border border-neutral-700 bg-[#0a1410] px-3 py-2 text-[#f6f3ea] focus:border-[#1fae72] focus:outline-none";
const labelClass = "block text-xs font-bold uppercase tracking-widest text-neutral-400";

export default function CheckoutForm({
  showId,
  tier,
  origin,
  total,
}: {
  showId: string;
  tier: string;
  origin: string;
  total: number;
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
        <p className="mx-auto mt-4 max-w-sm text-xs text-neutral-500">
          This is a prototype checkout — no payment was charged and no real
          flight or hotel was booked. In the full product, this screen hands
          off to live airline and hotel booking APIs.
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
