// Pulls real, current dance/electronic show listings from the Ticketmaster
// Discovery API. This is a separate, free, INSTANT-approval signup from the
// Ticketmaster affiliate program — get a key at
// https://developer.ticketmaster.com/products-and-docs/apis/getting-started/
// and set TICKETMASTER_API_KEY in .env.local. Without it, the app falls
// back to the static researched show list in lib/data.ts.

import { findNearestAirport, shows as curatedShows, Show } from "./data";

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
    url.searchParams.set("startDateTime", new Date().toISOString().slice(0, 19) + "Z");

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

async function fetchShowsForArtist(artist: string): Promise<Show[]> {
  try {
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("apikey", process.env.TICKETMASTER_API_KEY!);
    url.searchParams.set("keyword", artist);
    url.searchParams.set("sort", "date,asc");
    url.searchParams.set("size", "3");
    url.searchParams.set("startDateTime", new Date().toISOString().slice(0, 19) + "Z");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    const events = (data._embedded?.events ?? []) as TmEvent[];
    return events.map(tmEventToShow).filter((s): s is Show => s !== null);
  } catch {
    return [];
  }
}

// Runs async tasks with a concurrency cap, respecting Ticketmaster's free-
// tier rate limit (5 req/sec) when looking up ~100 curated artists by name.
async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const item = items[index++];
      await task(item);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
}

// Looks up real, current shows for every artist in our curated roster by
// name, so known headliners surface even if the broad "dance" genre search
// misses them. Runs in batches of 4/sec to stay under the free rate limit.
export async function fetchCuratedArtistShows(): Promise<Show[]> {
  if (!ticketmasterConfigured()) return [];

  const artists = Array.from(new Set(curatedShows.map((s) => s.artist)));
  const results: Show[] = [];

  const batchSize = 4;
  for (let i = 0; i < artists.length; i += batchSize) {
    const batch = artists.slice(i, i + batchSize);
    await runWithConcurrency(batch, batchSize, async (artist) => {
      const found = await fetchShowsForArtist(artist);
      results.push(...found);
    });
    if (i + batchSize < artists.length) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return results;
}

// Combines the broad genre search with the curated-artist name search,
// deduping by event id. Returns null if both come up empty so callers fall
// back to the static show list.
export async function fetchAllLiveShows(): Promise<Show[] | null> {
  if (!ticketmasterConfigured()) return null;

  const [broad, curated] = await Promise.all([
    fetchLiveShows(),
    fetchCuratedArtistShows(),
  ]);

  const byId = new Map<string, Show>();
  for (const show of broad ?? []) byId.set(show.id, show);
  for (const show of curated) byId.set(show.id, show);

  return byId.size > 0 ? Array.from(byId.values()) : null;
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
