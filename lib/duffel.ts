// Thin client for the Duffel API (flight + hotel/stay pricing). Amadeus's
// self-service developer portal paused new signups and shuts down entirely
// on July 17, 2026, so this replaces it. Sign up free, instantly, at
// https://app.duffel.com/join, create a test access token under
// Developers → Access tokens, and set DUFFEL_ACCESS_TOKEN in .env.local
// to go live. Sandbox data is limited — every call site here falls back to
// the simulated pricing model in lib/pricing.ts on any failure or miss.

import { airports } from "./data";

const DUFFEL_BASE_URL = "https://api.duffel.com";

export function duffelConfigured(): boolean {
  return Boolean(process.env.DUFFEL_ACCESS_TOKEN);
}

function duffelHeaders() {
  return {
    Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
    "Duffel-Version": "v2",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export type RealFlightPrice = { economyTotal: number; currency: string };

export async function fetchFlightPrice(
  originIata: string,
  destinationIata: string,
  departureDate: string
): Promise<RealFlightPrice | null> {
  try {
    const res = await fetch(`${DUFFEL_BASE_URL}/air/offer_requests`, {
      method: "POST",
      headers: duffelHeaders(),
      body: JSON.stringify({
        data: {
          slices: [{ origin: originIata, destination: destinationIata, departure_date: departureDate }],
          passengers: [{ type: "adult" }],
          cabin_class: "economy",
        },
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const offers = data.data?.offers as Array<{ total_amount: string; total_currency: string }>;
    if (!offers || offers.length === 0) return null;

    const cheapest = offers.reduce((min, o) =>
      parseFloat(o.total_amount) < parseFloat(min.total_amount) ? o : min
    );
    return { economyTotal: parseFloat(cheapest.total_amount), currency: cheapest.total_currency };
  } catch {
    return null;
  }
}

export type RealHotelPrice = { nightlyLow: number; nightlyHigh: number; currency: string };

export async function fetchHotelPriceRange(
  destinationAirportCode: string,
  checkInDate: string,
  checkOutDate: string
): Promise<RealHotelPrice | null> {
  try {
    const airport = airports.find((a) => a.code === destinationAirportCode);
    if (!airport) return null;

    const res = await fetch(`${DUFFEL_BASE_URL}/stays/search`, {
      method: "POST",
      headers: duffelHeaders(),
      body: JSON.stringify({
        data: {
          location: {
            radius: 15,
            geographic_coordinates: { latitude: airport.lat, longitude: airport.lon },
          },
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          guests: [{ type: "adult" }],
          rooms: 1,
        },
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const results = data.data?.results as Array<{ cheapest_rate_total_amount?: string }>;
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000
      )
    );
    // cheapest_rate_total_amount is for the whole stay, not per night.
    const nightlyPrices = (results ?? [])
      .map((r) => parseFloat(r.cheapest_rate_total_amount ?? "") / nights)
      .filter((p) => !isNaN(p));
    if (nightlyPrices.length === 0) return null;

    return {
      nightlyLow: Math.min(...nightlyPrices),
      nightlyHigh: Math.max(...nightlyPrices),
      currency: "USD",
    };
  } catch {
    return null;
  }
}
