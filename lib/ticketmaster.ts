// Pulls real, current dance/electronic show listings from the Ticketmaster
// Discovery API. This is a separate, free, INSTANT-approval signup from the
// Ticketmaster affiliate program — get a key at
// https://developer.ticketmaster.com/products-and-docs/apis/getting-started/
// and set TICKETMASTER_API_KEY in .env.local. Without it, the app falls
// back to the static researched show list in lib/data.ts.

import { findNearestAirport, Show } from "./data";

export function ticketmasterConfigured(): boolean {
  return Boolean(process.env.TICKETMASTER_API_KEY);
}

type TmEvent = {
  id: string;
  name: string;
  dates?: { start?: { localDate?: string } };
  classifications?: { genre?: { name?: string }; subGenre?: { name?: string } }[];
  url?: string;
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
      country?: { name?: string };
      location?: { latitude?: string; longitude?: string };
    }[];
    attractions?: { name?: string }[];
  };
};

function mapGenre(subGenre?: string): Show["genre"] {
  const s = (subGenre ?? "").toLowerCase();
  if (s.includes("house")) return "House";
  if (s.includes("techno")) return "Techno";
  if (s.includes("dubstep") || s.includes("bass") || s.includes("drum")) return "Bass";
  return "EDM";
}

function tmEventToShow(event: TmEvent): Show | null {
  const venue = event._embedded?.venues?.[0];
  const lat = parseFloat(venue?.location?.latitude ?? "");
  const lon = parseFloat(venue?.location?.longitude ?? "");
  const date = event.dates?.start?.localDate;
  const city = venue?.city?.name;
  const country = venue?.country?.name;

  if (!venue || isNaN(lat) || isNaN(lon) || !date || !city || !country) return null;

  const artist = event._embedded?.attractions?.[0]?.name ?? event.name;
  const subGenre = event.classifications?.[0]?.subGenre?.name;
  const nearestAirport = findNearestAirport(lat, lon);

  return {
    id: `tm-${event.id}`,
    artist,
    genre: mapGenre(subGenre),
    venue: venue.name ?? "Venue TBA",
    city: `${city}, ${country}`,
    country,
    airportCode: nearestAirport.code,
    date,
  };
}

// Fetches upcoming dance/electronic events, sorted by date. Returns null on
// any failure so callers can fall back to the static show list.
export async function fetchLiveShows(size: number = 100): Promise<Show[] | null> {
  if (!ticketmasterConfigured()) return null;

  try {
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("apikey", process.env.TICKETMASTER_API_KEY!);
    url.searchParams.set("classificationName", "dance");
    url.searchParams.set("sort", "date,asc");
    url.searchParams.set("size", String(size));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const events = (data._embedded?.events ?? []) as TmEvent[];
    const shows = events
      .map(tmEventToShow)
      .filter((s): s is Show => s !== null);

    return shows.length > 0 ? shows : null;
  } catch {
    return null;
  }
}

// Fetches a single event by its Ticketmaster ID (the part after "tm-" in
// the Show.id we generate above) for the trip detail page.
export async function fetchLiveShowById(tmEventId: string): Promise<Show | null> {
  if (!ticketmasterConfigured()) return null;

  try {
    const url = new URL(`https://app.ticketmaster.com/discovery/v2/events/${tmEventId}.json`);
    url.searchParams.set("apikey", process.env.TICKETMASTER_API_KEY!);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const event = (await res.json()) as TmEvent;
    return tmEventToShow(event);
  } catch {
    return null;
  }
}
