"use client";

import { Hotel } from "@/lib/hotels";

export default function HotelDetailsModal({
  hotel,
  onClose,
}: {
  hotel: Hotel;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1410]/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-neutral-700 bg-[#0a1410] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-tight text-[#f6f3ea]">
              {hotel.name}
            </div>
            <div className="mt-1 text-xs text-[#1fae72]">
              {"★".repeat(hotel.stars)}
              {"☆".repeat(5 - hotel.stars)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-neutral-500 hover:text-[#f6f3ea]"
          >
            Close
          </button>
        </div>

        <div className="mt-4 text-xs uppercase tracking-wide text-neutral-500">
          {hotel.distanceFromVenue}
        </div>

        <p className="mt-3 text-sm text-neutral-300">{hotel.description}</p>

        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Amenities
          </div>
          <ul className="mt-2 space-y-1">
            {hotel.amenities.map((a) => (
              <li key={a} className="text-xs text-neutral-400">
                · {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-800 pt-4">
          <span className="text-xs uppercase tracking-widest text-neutral-500">
            Per night
          </span>
          <span className="text-lg font-black text-[#f6f3ea]">
            ${hotel.pricePerNight}
          </span>
        </div>

        <p className="mt-3 text-[10px] text-neutral-600">
          Property details are illustrative for this prototype, not a live
          listing.
        </p>
      </div>
    </div>
  );
}
