export type Airport = {
  code: string;
  city: string;
  lat: number;
  lon: number;
};

export type Show = {
  id: string;
  artist: string;
  genre: "House" | "Techno" | "EDM" | "Bass";
  venue: string;
  city: string;
  country: string;
  airportCode: string; // nearest airport to the venue
  date: string; // ISO date
  ticketUrl?: string; // direct Ticketmaster event page, only set for live shows
  description?: string; // real event info from Ticketmaster, when available
  venueAddress?: string; // street address/state/postal code, when available
};

const GENRE_BLURBS: Record<Show["genre"], string> = {
  House: "expect a deep, groove-driven house set built for dancing all night",
  Techno: "expect a relentless, peak-time techno set with no room to breathe",
  EDM: "expect a big-room, festival-energy set built for raised hands and drops",
  Bass: "expect heavy low-end, bass-forward selections that hit hard on a real rig",
};

// Generates a sensible description when a show doesn't have a real,
// hand-written or API-sourced one (lib/ticketmaster.ts pulls real event
// info when Ticketmaster provides it). Keeps the trip page from ever
// showing a blank description.
export function describeShow(show: Show): string {
  if (show.description) return show.description;
  return `${show.artist} live at ${show.venue} in ${show.city} — ${GENRE_BLURBS[show.genre]}.`;
}

// Tour data researched from official artist sites, Songkick, Ticketmaster,
// and Resident Advisor. Schedules shift constantly — see DATA_AS_OF below.
// This static list is the fallback when live Ticketmaster data isn't
// configured (see lib/ticketmaster.ts).
export const DATA_AS_OF = "June 25, 2026";

// Drops any show whose date has already passed (compares by calendar date,
// not time, so "today" still counts as upcoming).
export function filterUpcoming(shows: Show[]): Show[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  return shows.filter((s) => s.date >= todayIso);
}

// Blends live Ticketmaster results with our hand-researched static list,
// rather than one replacing the other. Niche/underground artists we've
// researched by hand often aren't listed on Ticketmaster at all — without
// this merge, they'd silently vanish from the listing whenever live data
// is active. Prefers the live entry (it carries a real ticketUrl) when
// both sources have the same artist on the same date.
export function mergeShows(live: Show[], staticList: Show[]): Show[] {
  const byKey = new Map<string, Show>();
  for (const show of staticList) {
    byKey.set(`${show.artist.toLowerCase()}|${show.date}`, show);
  }
  for (const show of live) {
    byKey.set(`${show.artist.toLowerCase()}|${show.date}`, show);
  }
  return Array.from(byKey.values());
}

// Picks the closest airport in our curated list to a venue's coordinates.
// Used to map live Ticketmaster venues (which give lat/lon, not airport
// codes) onto the existing distance/pricing model.

export function findNearestAirport(lat: number, lon: number): Airport {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const distance = (a: Airport) => {
    const R = 3958.8;
    const dLat = toRad(lat - a.lat);
    const dLon = toRad(lon - a.lon);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  };
  return airports.reduce((closest, a) =>
    distance(a) < distance(closest) ? a : closest
  );
}

export const airports: Airport[] = [
  { code: "JFK", city: "New York", lat: 40.6413, lon: -73.7781 },
  { code: "LAX", city: "Los Angeles", lat: 33.9416, lon: -118.4085 },
  { code: "ORD", city: "Chicago", lat: 41.9742, lon: -87.9073 },
  { code: "MIA", city: "Miami", lat: 25.7959, lon: -80.287 },
  { code: "ATL", city: "Atlanta", lat: 33.6407, lon: -84.4277 },
  { code: "DFW", city: "Dallas", lat: 32.8998, lon: -97.0403 },
  { code: "DEN", city: "Denver", lat: 39.8561, lon: -104.6737 },
  { code: "SFO", city: "San Francisco", lat: 37.6213, lon: -122.379 },
  { code: "LAS", city: "Las Vegas", lat: 36.084, lon: -115.1537 },
  { code: "SEA", city: "Seattle", lat: 47.4502, lon: -122.3088 },
  { code: "AMS", city: "Amsterdam", lat: 52.3105, lon: 4.7683 },
  { code: "BCN", city: "Barcelona", lat: 41.2974, lon: 2.0833 },
  { code: "IBZ", city: "Ibiza", lat: 38.8729, lon: 1.3731 },
  { code: "LHR", city: "London", lat: 51.47, lon: -0.4543 },
  { code: "BRU", city: "Brussels", lat: 50.9014, lon: 4.4844 },
  { code: "BLQ", city: "Bologna", lat: 44.5354, lon: 11.2887 },
  { code: "FRA", city: "Frankfurt", lat: 50.0379, lon: 8.5622 },
  { code: "AUS", city: "Austin", lat: 30.1975, lon: -97.6664 },
  { code: "DXB", city: "Dubai", lat: 25.2532, lon: 55.3657 },
  { code: "SAN", city: "San Diego", lat: 32.7338, lon: -117.1933 },
  { code: "IAD", city: "Washington, D.C.", lat: 38.9531, lon: -77.4565 },
  { code: "BOG", city: "Bogotá", lat: 4.7016, lon: -74.1469 },
  { code: "OSL", city: "Oslo", lat: 60.1939, lon: 11.1004 },
  { code: "CDG", city: "Paris", lat: 49.0097, lon: 2.5479 },
  { code: "ICN", city: "Seoul", lat: 37.4602, lon: 126.4407 },
  { code: "LCG", city: "A Coruña", lat: 43.3021, lon: -8.3772 },
  { code: "YEG", city: "Edmonton", lat: 53.3097, lon: -113.5801 },
  { code: "CMI", city: "Champaign", lat: 40.0392, lon: -88.2779 },
  { code: "CPH", city: "Copenhagen", lat: 55.618, lon: 12.6476 },
  { code: "MAD", city: "Madrid", lat: 40.4983, lon: -3.5676 },
  { code: "MAN", city: "Manchester", lat: 53.3537, lon: -2.275 },
  { code: "YVR", city: "Vancouver", lat: 49.1947, lon: -123.1792 },
  { code: "ATH", city: "Athens", lat: 37.9364, lon: 23.9445 },
  { code: "VIE", city: "Vienna", lat: 48.1103, lon: 16.5697 },
  { code: "AYT", city: "Antalya", lat: 36.8987, lon: 30.8005 },
  { code: "BKK", city: "Bangkok", lat: 13.69, lon: 100.7501 },
  { code: "MNL", city: "Manila", lat: 14.5086, lon: 121.0194 },
  { code: "BER", city: "Berlin", lat: 52.3667, lon: 13.5033 },
  { code: "YYZ", city: "Toronto", lat: 43.6777, lon: -79.6248 },
  { code: "WAW", city: "Warsaw", lat: 52.1657, lon: 20.9671 },
  { code: "MTY", city: "Monterrey", lat: 25.7785, lon: -100.1069 },
];

export const shows: Show[] = [
  { id: "1", artist: "David Guetta", genre: "EDM", venue: "[UNVRS] – Galactic Circus", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-06-19" },
  { id: "2", artist: "Martin Garrix", genre: "EDM", venue: "Ushuaïa Ibiza", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-07-02" },
  { id: "3", artist: "Alok", genre: "EDM", venue: "O2 Academy Brixton", city: "London, UK", country: "United Kingdom", airportCode: "LHR", date: "2026-06-05" },
  { id: "4", artist: "Dimitri Vegas & Like Mike", genre: "EDM", venue: "Ushuaïa Ibiza", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-07-08" },
  { id: "5", artist: "Armin van Buuren", genre: "EDM", venue: "Ultra Music Festival", city: "Miami, FL", country: "United States", airportCode: "MIA", date: "2026-03-27" },
  { id: "6", artist: "Timmy Trumpet", genre: "EDM", venue: "Exchange LA", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-03-14" },
  { id: "7", artist: "FISHER", genre: "House", venue: "Adriatic Sound Festival", city: "Vasto, Italy", country: "Italy", airportCode: "BLQ", date: "2026-06-14" },
  { id: "8", artist: "Afrojack", genre: "EDM", venue: "Amsterdam Dance Event", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-10-24" },
  { id: "9", artist: "Charlotte de Witte", genre: "Techno", venue: "Barcelona Club Residency", city: "Barcelona, Spain", country: "Spain", airportCode: "BCN", date: "2026-06-18" },
  { id: "10", artist: "Anyma", genre: "EDM", venue: "ÆDEN World Tour", city: "Brussels, Belgium", country: "Belgium", airportCode: "BRU", date: "2026-06-06" },
  { id: "11", artist: "Vintage Culture", genre: "House", venue: "Amsterdam Dance Event Showcase", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-08-08" },
  { id: "12", artist: "Peggy Gou", genre: "House", venue: "Primavera Sound", city: "Barcelona, Spain", country: "Spain", airportCode: "BCN", date: "2026-06-06" },
  { id: "13", artist: "Don Diablo", genre: "EDM", venue: "Free Your Mind Festival", city: "Arnhem, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-06-06" },
  { id: "14", artist: "Steve Aoki", genre: "EDM", venue: "Omnia Nightclub", city: "Las Vegas, NV", country: "United States", airportCode: "LAS", date: "2026-07-03" },
  { id: "15", artist: "Hardwell", genre: "EDM", venue: "The Junkyard", city: "Denver, CO", country: "United States", airportCode: "DEN", date: "2026-06-13" },
  { id: "16", artist: "Calvin Harris", genre: "House", venue: "Manchester Arena", city: "Manchester, UK", country: "United Kingdom", airportCode: "MAN", date: "2026-06-21" },
  { id: "17", artist: "Black Coffee", genre: "House", venue: "DC-10 Ibiza", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-05-09" },
  { id: "18", artist: "W&W", genre: "EDM", venue: "Hockenheimring", city: "Hockenheim, Germany", country: "Germany", airportCode: "FRA", date: "2026-09-04" },
  { id: "19", artist: "Lost Frequencies", genre: "EDM", venue: "The Concourse Project", city: "Austin, TX", country: "United States", airportCode: "AUS", date: "2026-06-05" },
  { id: "20", artist: "Keinemusik", genre: "House", venue: "Bab Al Shams Arena", city: "Dubai, UAE", country: "United Arab Emirates", airportCode: "DXB", date: "2026-11-21" },
  { id: "21", artist: "Tiësto", genre: "EDM", venue: "Waterfront Park", city: "San Diego, CA", country: "United States", airportCode: "SAN", date: "2026-06-27" },
  { id: "22", artist: "Reinier Zonneveld", genre: "Techno", venue: "SILO Dallas", city: "Dallas, TX", country: "United States", airportCode: "DFW", date: "2026-07-02" },
  { id: "23", artist: "KSHMR", genre: "EDM", venue: "Hollywood Palladium", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-05-23" },
  { id: "24", artist: "Alan Walker", genre: "EDM", venue: "Red Rocks Amphitheatre", city: "Morrison, CO", country: "United States", airportCode: "DEN", date: "2026-05-30" },
  { id: "25", artist: "Carl Cox", genre: "Techno", venue: "Echostage", city: "Washington, DC", country: "United States", airportCode: "IAD", date: "2026-03-20" },
  { id: "26", artist: "Oliver Heldens", genre: "House", venue: "Brooklyn Mirage", city: "New York, NY", country: "United States", airportCode: "JFK", date: "2026-06-19" },
  { id: "27", artist: "Jamie Jones", genre: "House", venue: "Paradise – DC-10", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-08-14" },
  { id: "28", artist: "R3hab", genre: "EDM", venue: "Exchange LA", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-07-11" },
  { id: "29", artist: "Nicky Romero", genre: "EDM", venue: "Ziggo Dome", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-03-07" },
  { id: "30", artist: "Claptone", genre: "House", venue: "The Midway", city: "San Francisco, CA", country: "United States", airportCode: "SFO", date: "2026-06-27" },
  { id: "31", artist: "Skrillex", genre: "Bass", venue: "Estéreo Picnic", city: "Bogotá, Colombia", country: "Colombia", airportCode: "BOG", date: "2026-03-22" },
  { id: "32", artist: "Vini Vici", genre: "EDM", venue: "Oslo Festival", city: "Oslo, Norway", country: "Norway", airportCode: "OSL", date: "2026-06-20" },
  { id: "33", artist: "Fred again..", genre: "House", venue: "Alexandra Palace", city: "London, UK", country: "United Kingdom", airportCode: "LHR", date: "2026-02-12" },
  { id: "34", artist: "Swedish House Mafia", genre: "House", venue: "Bill Graham Civic Auditorium", city: "San Francisco, CA", country: "United States", airportCode: "SFO", date: "2026-09-26" },
  { id: "35", artist: "Joel Corry", genre: "House", venue: "Isle of Wight Festival", city: "Newport, UK", country: "United Kingdom", airportCode: "LHR", date: "2026-06-19" },
  { id: "36", artist: "Indira Paganotto", genre: "Techno", venue: "The Concourse Project", city: "Austin, TX", country: "United States", airportCode: "AUS", date: "2026-12-14" },
  { id: "37", artist: "Eric Prydz", genre: "EDM", venue: "HOLO", city: "Paris, France", country: "France", airportCode: "CDG", date: "2026-05-22" },
  { id: "38", artist: "Amelie Lens", genre: "Techno", venue: "Seoul Festival", city: "Seoul, South Korea", country: "South Korea", airportCode: "ICN", date: "2026-06-13" },
  { id: "39", artist: "Paul van Dyk", genre: "EDM", venue: "Las Vegas Club Residency", city: "Las Vegas, NV", country: "United States", airportCode: "LAS", date: "2026-05-15" },
  { id: "40", artist: "DJ Snake", genre: "EDM", venue: "O Son do Camiño", city: "A Coruña, Spain", country: "Spain", airportCode: "LCG", date: "2026-06-20" },
  { id: "41", artist: "Dom Dolla", genre: "House", venue: "FVDED in the Park", city: "Surrey, BC", country: "Canada", airportCode: "YVR", date: "2026-07-04" },
  { id: "42", artist: "Marshmello", genre: "EDM", venue: "XS Nightclub", city: "Las Vegas, NV", country: "United States", airportCode: "LAS", date: "2026-04-18" },
  { id: "43", artist: "The Martinez Brothers", genre: "House", venue: "SummerStage", city: "New York, NY", country: "United States", airportCode: "JFK", date: "2026-06-13" },
  { id: "44", artist: "Zedd", genre: "EDM", venue: "Omnia Las Vegas", city: "Las Vegas, NV", country: "United States", airportCode: "LAS", date: "2026-07-31" },
  { id: "45", artist: "Bassjackers", genre: "EDM", venue: "Pawn Shop Live", city: "Edmonton, Canada", country: "Canada", airportCode: "YEG", date: "2026-02-13" },
  { id: "46", artist: "John Summit", genre: "House", venue: "State Farm Center", city: "Champaign, IL", country: "United States", airportCode: "CMI", date: "2026-10-01" },
  { id: "47", artist: "Quintino", genre: "EDM", venue: "De Schorre", city: "Boom, Belgium", country: "Belgium", airportCode: "BRU", date: "2026-06-06" },
  { id: "48", artist: "Michael Bibi", genre: "House", venue: "Paris Club Show", city: "Paris, France", country: "France", airportCode: "CDG", date: "2026-05-22" },
  { id: "49", artist: "Boris Brejcha", genre: "Techno", venue: "Odense Festival", city: "Odense, Denmark", country: "Denmark", airportCode: "CPH", date: "2026-06-25" },
  { id: "50", artist: "Korolova", genre: "Techno", venue: "Madrid Club Show", city: "Madrid, Spain", country: "Spain", airportCode: "MAD", date: "2026-06-19" },
  { id: "51", artist: "Alesso", genre: "EDM", venue: "Tomorrowland", city: "Boom, Belgium", country: "Belgium", airportCode: "BRU", date: "2026-07-17" },
  { id: "52", artist: "James Hype", genre: "House", venue: "Zouk Nightclub", city: "Las Vegas, NV", country: "United States", airportCode: "LAS", date: "2026-03-14" },
  { id: "53", artist: "Maddix", genre: "EDM", venue: "Hollywood Palladium", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-08-21" },
  { id: "54", artist: "HUGEL", genre: "House", venue: "Ibiza Club Show", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-06-25" },
  { id: "55", artist: "Solomun", genre: "House", venue: "Pacha Ibiza", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-06-21" },
  { id: "56", artist: "Mochakk", genre: "House", venue: "Under the K Bridge Park", city: "Brooklyn, NY", country: "United States", airportCode: "JFK", date: "2026-08-29" },
  { id: "57", artist: "Lilly Palmer", genre: "EDM", venue: "Ultra Music Festival", city: "Miami, FL", country: "United States", airportCode: "MIA", date: "2026-03-27" },
  { id: "58", artist: "Nora En Pure", genre: "House", venue: "SummerStage", city: "New York, NY", country: "United States", airportCode: "JFK", date: "2026-07-10" },
  { id: "59", artist: "ATB", genre: "EDM", venue: "The Final Chapter Tour", city: "Dubai, UAE", country: "United Arab Emirates", airportCode: "DXB", date: "2026-09-05" },
  { id: "60", artist: "Deborah De Luca", genre: "Techno", venue: "Barcelona Festival", city: "Barcelona, Spain", country: "Spain", airportCode: "BCN", date: "2026-08-07" },
  { id: "61", artist: "Above & Beyond", genre: "EDM", venue: "Brooklyn Mirage", city: "Brooklyn, NY", country: "United States", airportCode: "JFK", date: "2026-06-19" },
  { id: "62", artist: "Sara Landry", genre: "Techno", venue: "Barcelona Festival", city: "Barcelona, Spain", country: "Spain", airportCode: "BCN", date: "2026-06-18" },
  { id: "63", artist: "Nervo", genre: "EDM", venue: "Tomorrowland", city: "Boom, Belgium", country: "Belgium", airportCode: "BRU", date: "2026-07-17" },
  { id: "64", artist: "Sub Zero Project", genre: "EDM", venue: "Avalon Hollywood", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-04-17" },
  { id: "65", artist: "Kölsch", genre: "Techno", venue: "Le Trianon", city: "Paris, France", country: "France", airportCode: "CDG", date: "2026-04-14" },
  { id: "66", artist: "Lucas & Steve", genre: "House", venue: "Tomorrowland", city: "Boom, Belgium", country: "Belgium", airportCode: "BRU", date: "2026-07-18" },
  { id: "67", artist: "Nico Moreno", genre: "Techno", venue: "Chicago Club Show", city: "Chicago, IL", country: "United States", airportCode: "ORD", date: "2026-09-04" },
  { id: "68", artist: "GORDO", genre: "House", venue: "The Concourse Project", city: "Austin, TX", country: "United States", airportCode: "AUS", date: "2026-06-19" },
  { id: "69", artist: "PAWSA", genre: "House", venue: "DC10 Ibiza", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-06-18" },
  { id: "70", artist: "The Chainsmokers", genre: "EDM", venue: "Lollapalooza", city: "Chicago, IL", country: "United States", airportCode: "ORD", date: "2026-07-30" },
  { id: "71", artist: "Liu", genre: "Techno", venue: "Brucknerhaus", city: "Linz, Austria", country: "Austria", airportCode: "VIE", date: "2026-09-01" },
  { id: "72", artist: "Mike Williams", genre: "EDM", venue: "Amsterdam Dance Event", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-08-15" },
  { id: "73", artist: "ARTBAT", genre: "Techno", venue: "Amsterdam Dance Event", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-10-24" },
  { id: "74", artist: "KAAZE", genre: "EDM", venue: "Q Nightclub", city: "Seattle, WA", country: "United States", airportCode: "SEA", date: "2026-05-01" },
  { id: "75", artist: "Miss Monique", genre: "Techno", venue: "Barcelona Festival", city: "Barcelona, Spain", country: "Spain", airportCode: "BCN", date: "2026-08-07" },
  { id: "76", artist: "Burak Yeter", genre: "EDM", venue: "Aspendos Theater", city: "Antalya, Turkey", country: "Turkey", airportCode: "AYT", date: "2026-09-23" },
  { id: "77", artist: "Mau P", genre: "House", venue: "Los Angeles Club Show", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-08-01" },
  { id: "78", artist: "Le Twins", genre: "House", venue: "Paris Club Show", city: "Paris, France", country: "France", airportCode: "CDG", date: "2026-07-01" },
  { id: "79", artist: "I Hate Models", genre: "Techno", venue: "Paris Festival", city: "Paris, France", country: "France", airportCode: "CDG", date: "2026-06-26" },
  { id: "80", artist: "Marnik", genre: "EDM", venue: "Void Club", city: "Bangkok, Thailand", country: "Thailand", airportCode: "BKK", date: "2026-03-06" },
  { id: "81", artist: "Chris Stussy", genre: "House", venue: "Alexandra Palace", city: "London, UK", country: "United Kingdom", airportCode: "LHR", date: "2026-04-04" },
  { id: "82", artist: "Deadmau5", genre: "EDM", venue: "Brooklyn Mirage", city: "Brooklyn, NY", country: "United States", airportCode: "JFK", date: "2026-06-19" },
  { id: "83", artist: "WUKONG", genre: "EDM", venue: "Okada Manila", city: "Manila, Philippines", country: "Philippines", airportCode: "MNL", date: "2026-06-19" },
  { id: "84", artist: "Fedde Le Grand", genre: "House", venue: "We Love Ibiza Weekender", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-06-05" },
  { id: "85", artist: "Ferry Corsten", genre: "EDM", venue: "Amnesia Ibiza", city: "Ibiza, Spain", country: "Spain", airportCode: "IBZ", date: "2026-06-10" },
  { id: "86", artist: "Plastik Funk", genre: "House", venue: "Berlin Club Show", city: "Berlin, Germany", country: "Germany", airportCode: "BER", date: "2026-08-01" },
  { id: "87", artist: "DubVision", genre: "EDM", venue: "Dprtmnt", city: "Toronto, Canada", country: "Canada", airportCode: "YYZ", date: "2026-08-15" },
  { id: "88", artist: "B Jones", genre: "EDM", venue: "Dubai Club Show", city: "Dubai, UAE", country: "United Arab Emirates", airportCode: "DXB", date: "2026-07-19" },
  { id: "89", artist: "Giuseppe Ottaviani", genre: "EDM", venue: "Warsaw Club Show", city: "Warsaw, Poland", country: "Poland", airportCode: "WAW", date: "2026-06-20" },
  { id: "90", artist: "Cuebrick", genre: "House", venue: "Amsterdam Club Show", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-08-01" },
  { id: "91", artist: "Mariana Bo", genre: "Techno", venue: "Parque Fundidora", city: "Monterrey, Mexico", country: "Mexico", airportCode: "MTY", date: "2026-03-27" },
  { id: "92", artist: "MEDUZA", genre: "House", venue: "Zouk Nightclub", city: "Las Vegas, NV", country: "United States", airportCode: "LAS", date: "2026-03-28" },
  { id: "93", artist: "Fantasm", genre: "Techno", venue: "The Concourse Project", city: "Austin, TX", country: "United States", airportCode: "AUS", date: "2026-03-28" },
  { id: "94", artist: "VINAI", genre: "EDM", venue: "Brescia Club Show", city: "Brescia, Italy", country: "Italy", airportCode: "BLQ", date: "2026-08-01" },
  { id: "95", artist: "Chris Lake", genre: "House", venue: "Under the K Bridge Park", city: "Brooklyn, NY", country: "United States", airportCode: "JFK", date: "2026-06-07" },
  { id: "96", artist: "Faustix", genre: "Bass", venue: "Espelunden", city: "Rødovre, Denmark", country: "Denmark", airportCode: "CPH", date: "2026-08-01" },
  { id: "97", artist: "Honey Dijon", genre: "House", venue: "Fillmore Auditorium", city: "Denver, CO", country: "United States", airportCode: "DEN", date: "2026-06-26" },
  { id: "98", artist: "Nils van Zandt", genre: "EDM", venue: "Amsterdam Dance Event", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-10-24" },
  { id: "99", artist: "Topic", genre: "EDM", venue: "Berlin Club Show", city: "Berlin, Germany", country: "Germany", airportCode: "BER", date: "2026-08-01" },
  { id: "100", artist: "Marlon Hoffstadt", genre: "House", venue: "Manchester Club Show", city: "Manchester, UK", country: "United Kingdom", airportCode: "MAN", date: "2026-06-20" },
  { id: "101", artist: "KETTAMA", genre: "House", venue: "Miami Club Show", city: "Miami, FL", country: "United States", airportCode: "MIA", date: "2026-10-16" },
  { id: "102", artist: "Josh Baker", genre: "House", venue: "Chicago Club Show", city: "Chicago, IL", country: "United States", airportCode: "ORD", date: "2026-09-04" },
  { id: "103", artist: "Prospa", genre: "House", venue: "Mission Ballroom", city: "Denver, CO", country: "United States", airportCode: "DEN", date: "2026-09-25" },
  { id: "104", artist: "&ME", genre: "House", venue: "Amsterdam Club Show", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-09-05" },
  { id: "105", artist: "Adam Port", genre: "House", venue: "London Club Show", city: "London, UK", country: "United Kingdom", airportCode: "LHR", date: "2026-08-09" },
  { id: "106", artist: "Rampa", genre: "House", venue: "Athens Club Show", city: "Athens, Greece", country: "Greece", airportCode: "ATH", date: "2026-06-27" },
  { id: "107", artist: "Reznik", genre: "House", venue: "KEINEMUSIK | PACHA ICONS", city: "Dubai, UAE", country: "United Arab Emirates", airportCode: "DXB", date: "2026-11-21" },
  { id: "108", artist: "Sammy Virji", genre: "House", venue: "Red Rocks Amphitheatre", city: "Morrison, CO", country: "United States", airportCode: "DEN", date: "2026-10-16" },
  { id: "109", artist: "Interplanetary Criminal", genre: "Bass", venue: "Chicago Club Show", city: "Chicago, IL", country: "United States", airportCode: "ORD", date: "2026-09-04" },
  { id: "110", artist: "Patrick Topping", genre: "House", venue: "Eastern Electrics", city: "London, UK", country: "United Kingdom", airportCode: "LHR", date: "2026-08-09" },
  { id: "111", artist: "Hot Since 82", genre: "House", venue: "Amsterdam Club Show", city: "Amsterdam, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-08-08" },
  { id: "112", artist: "Solardo", genre: "House", venue: "Chester Festival", city: "Chester, UK", country: "United Kingdom", airportCode: "MAN", date: "2026-07-24" },
  { id: "113", artist: "CamelPhat", genre: "House", venue: "Barcelona Club Show", city: "Barcelona, Spain", country: "Spain", airportCode: "BCN", date: "2026-08-07" },
  { id: "114", artist: "Eli Brown", genre: "House", venue: "Awakenings Festival", city: "Hilvarenbeek, Netherlands", country: "Netherlands", airportCode: "AMS", date: "2026-07-10" },
  { id: "115", artist: "ANOTR", genre: "House", venue: "Playa Pacha", city: "Dubai, UAE", country: "United Arab Emirates", airportCode: "DXB", date: "2026-11-13" },
  { id: "116", artist: "RÜFÜS DU SOL", genre: "House", venue: "Kia Forum", city: "Los Angeles, CA", country: "United States", airportCode: "LAX", date: "2026-08-06" },
  { id: "117", artist: "Jimi Jules", genre: "House", venue: "Grimbergen Club Show", city: "Grimbergen, Belgium", country: "Belgium", airportCode: "BRU", date: "2026-09-13" },
  { id: "118", artist: "ANOTR", genre: "House", venue: "Pacha New York", city: "New York, NY", country: "United States", airportCode: "JFK", date: "2026-07-10" },
  { id: "119", artist: "ANOTR", genre: "House", venue: "Pacha New York", city: "New York, NY", country: "United States", airportCode: "JFK", date: "2026-07-11" },
];
