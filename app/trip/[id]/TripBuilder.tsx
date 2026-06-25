"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { airports, Show } from "@/lib/data";
import { generateHotelOptions, Hotel } from "@/lib/hotels";
import { getItineraryPrice, ITINERARY_DISCOUNT_PERCENT } from "@/lib/itinerary";
import { applyLivePricing, CostTier, DEFAULT_NIGHTS, planTrip, TierBreakdown } from "@/lib/pricing";
import DatePicker from "./DatePicker";
import FullItinerary from "./FullItinerary";
import HotelDetailsModal from "./HotelDetailsModal";

const TIER_STYLES: Record<
  TierBreakdown["tier"],
  { ring: string; badge: string }
> = {
  bunk: { ring: "border-neutral-800", badge: "bg-neutral-900 text-neutral-500" },
  basic: { ring: "border-neutral-700", badge: "bg-neutral-800 text-neutral-300" },
  premium: { ring: "border-[#1fae72]/50", badge: "bg-[#1fae72]/15 text-[#1fae72]" },
  luxury: { ring: "border-[#f6f3ea]", badge: "bg-[#f6f3ea] text-black" },
  icon: { ring: "border-[#1fae72]", badge: "bg-[#1fae72] text-black" },
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function TripBuilder({ show }: { show: Show }) {
  const [originCode, setOriginCode] = useState(
    airports.find((a) => a.code !== show.airportCode)?.code ?? airports[0].code
  );
  const [checkInDate, setCheckInDate] = useState(addDays(show.date, -1));
  const [nights, setNights] = useState(DEFAULT_NIGHTS);
  const [selectedHotelByTier, setSelectedHotelByTier] = useState<
    Partial<Record<CostTier, string>>
  >({});
  const [showAllHotelsByTier, setShowAllHotelsByTier] = useState<
    Partial<Record<CostTier, boolean>>
  >({});
  const [detailHotel, setDetailHotel] = useState<Hotel | null>(null);
  const [itineraryAdded, setItineraryAdded] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveData, setLiveData] = useState<{
    flight?: { economyTotal: number } | null;
    hotel?: { nightlyLow: number; nightlyHigh: number } | null;
  } | null>(null);

  const simulatedPlan = useMemo(
    () => planTrip(originCode, show, nights),
    [originCode, show, nights]
  );
  const plan = liveData ? applyLivePricing(simulatedPlan, liveData) : simulatedPlan;

  useEffect(() => {
    setIsLive(false);
    setLiveData(null);
    const controller = new AbortController();
    fetch(
      `/api/trip-pricing?originCode=${originCode}&destinationCode=${show.airportCode}&date=${show.date}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.live) {
          setIsLive(true);
          setLiveData({ flight: data.flight, hotel: data.hotel });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [originCode, show.airportCode, show.date]);

  return (
    <div className="mt-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            Departing from
          </label>
          <select
            value={originCode}
            onChange={(e) => setOriginCode(e.target.value)}
            className="mt-2 w-full border border-neutral-700 bg-[#0a1410] px-3 py-2 text-[#f6f3ea] uppercase tracking-wide focus:border-[#1fae72] focus:outline-none"
          >
            {airports.map((a) => (
              <option key={a.code} value={a.code}>
                {a.city} ({a.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            Trip dates
          </label>
          <DatePicker
            showDate={show.date}
            checkInDate={checkInDate}
            nights={nights}
            onChange={(newCheckIn, newNights) => {
              setCheckInDate(newCheckIn);
              setNights(newNights);
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {plan.distanceMiles} miles to {show.city}
        </p>
        <span
          className={`text-xs font-bold uppercase tracking-widest ${
            isLive ? "text-emerald-400" : "text-neutral-600"
          }`}
        >
          {isLive ? "Live pricing" : "Estimated pricing"}
        </span>
      </div>

      <FullItinerary
        city={show.city}
        country={show.country}
        nights={nights}
        added={itineraryAdded}
        onToggle={setItineraryAdded}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {plan.tiers.map((tier) => {
          const allHotelOptions = generateHotelOptions(
            show.id,
            show.city,
            tier.tier,
            tier.hotelCostPerNight
          );
          const showAll = showAllHotelsByTier[tier.tier] ?? false;
          const visibleHotelOptions = showAll ? allHotelOptions : allHotelOptions.slice(0, 4);
          const selectedHotelId = selectedHotelByTier[tier.tier] ?? allHotelOptions[1].id;
          const selectedHotel =
            allHotelOptions.find((h) => h.id === selectedHotelId) ?? allHotelOptions[1];
          const hotelTotal = selectedHotel.pricePerNight * tier.nights;
          const tripSubtotal = tier.flightCost + hotelTotal;
          const itineraryPrice = getItineraryPrice(tier.nights);
          const discount = itineraryAdded
            ? Math.round(tripSubtotal * (ITINERARY_DISCOUNT_PERCENT / 100))
            : 0;
          const totalCost = tripSubtotal - discount + (itineraryAdded ? itineraryPrice : 0);

          return (
            <div
              key={tier.tier}
              className={`border bg-[#0a1410] p-5 ${TIER_STYLES[tier.tier].ring}`}
            >
              <span
                className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${TIER_STYLES[tier.tier].badge}`}
              >
                {tier.label}
              </span>

              <div className="mt-3 text-2xl font-black">
                ${totalCost.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                estimated total
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm text-[#f6f3ea]">
                  <span className="uppercase tracking-wide">Flight</span>
                  <span>${tier.flightCost.toLocaleString()}</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {tier.flightDescription}
                </div>
                {itineraryAdded && (
                  <>
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span className="uppercase tracking-wide">
                        {ITINERARY_DISCOUNT_PERCENT}% trip discount
                      </span>
                      <span>−${discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#1fae72]">
                      <span className="uppercase tracking-wide">Full itinerary</span>
                      <span>+${itineraryPrice}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Choose a hotel · {tier.nights} {tier.nights === 1 ? "night" : "nights"}
                </div>
                <div className="mt-2 space-y-2">
                  {visibleHotelOptions.map((hotel) => {
                    const isSelected = hotel.id === selectedHotelId;
                    return (
                      <div
                        key={hotel.id}
                        className={`border px-2 py-1.5 text-xs ${
                          isSelected
                            ? "border-[#1fae72] bg-[#1fae72]/10"
                            : "border-neutral-800 hover:border-neutral-600"
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-2">
                          <input
                            type="radio"
                            name={`hotel-${tier.tier}`}
                            checked={isSelected}
                            onChange={() =>
                              setSelectedHotelByTier((prev) => ({
                                ...prev,
                                [tier.tier]: hotel.id,
                              }))
                            }
                            className="mt-0.5 accent-[#1fae72]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[#f6f3ea]">
                              {hotel.name} · {"★".repeat(hotel.stars)}
                            </span>
                            <span className="block truncate text-neutral-500">
                              {hotel.distanceFromVenue}
                            </span>
                          </span>
                        </label>
                        <div className="mt-1.5 flex items-center justify-between pl-5">
                          <span className="text-[#f6f3ea]">
                            ${hotel.pricePerNight}/night
                          </span>
                          <button
                            type="button"
                            onClick={() => setDetailHotel(hotel)}
                            className="text-neutral-500 underline hover:text-[#1fae72]"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {allHotelOptions.length > 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAllHotelsByTier((prev) => ({
                        ...prev,
                        [tier.tier]: !showAll,
                      }))
                    }
                    className="mt-2 text-xs uppercase tracking-widest text-[#1fae72] hover:underline"
                  >
                    {showAll ? "Show fewer hotels" : "Show more hotels"}
                  </button>
                )}
              </div>

              <Link
                href={`/trip/${show.id}/checkout?tier=${tier.tier}&origin=${originCode}&total=${totalCost}&hotel=${encodeURIComponent(selectedHotel.name)}&nights=${tier.nights}&checkIn=${checkInDate}&itinerary=${itineraryAdded ? "1" : "0"}`}
                className="mt-5 block w-full border border-[#f6f3ea] px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-[#f6f3ea] transition hover:bg-[#f6f3ea] hover:text-black"
              >
                Book this trip
              </Link>
            </div>
          );
        })}
      </div>

      {detailHotel && (
        <HotelDetailsModal hotel={detailHotel} onClose={() => setDetailHotel(null)} />
      )}
    </div>
  );
}
