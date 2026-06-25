import { CostTier } from "./pricing";

export type Hotel = {
  id: string;
  name: string;
  stars: number;
  distanceFromVenue: string;
  pricePerNight: number;
  description: string;
  amenities: string[];
};

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const x = Math.sin(h) * 10000;
  return x - Math.floor(x);
}

const NAME_POOL: Record<CostTier, { stars: number; names: string[] }[]> = {
  bunk: [
    { stars: 1, names: ["{city} Hostel", "Backpackers {city}"] },
    { stars: 1, names: ["{city} Bunkhouse", "Crash Pad {city}"] },
    { stars: 2, names: ["{city} Social Hostel", "The {city} Bunk House"] },
    { stars: 2, names: ["{city} Dorm Co.", "Wanderer's {city}"] },
  ],
  basic: [
    { stars: 2, names: ["{city} Budget Inn", "Traveler's Lodge {city}"] },
    { stars: 2, names: ["{city} Hostel & Suites", "EasyStay {city}"] },
    { stars: 3, names: ["{city} Central Hotel", "{city} Transit Inn"] },
    { stars: 3, names: ["Quick Stay {city}", "{city} Express Hotel"] },
  ],
  premium: [
    { stars: 3, names: ["{city} Plaza Hotel", "Hotel {city} Central"] },
    { stars: 4, names: ["The {city} Collective", "{city} Boutique Hotel"] },
    { stars: 4, names: ["{city} Loft Hotel", "The Yard {city}"] },
    { stars: 4, names: ["{city} Skyline Hotel", "Hotel Nine {city}"] },
  ],
  luxury: [
    { stars: 4, names: ["{city} Grand Hotel", "The {city} Residences"] },
    { stars: 5, names: ["{city} Ritz Quarter", "Le Palace {city}"] },
    { stars: 5, names: ["The {city} Imperial", "{city} Crown Suites"] },
    { stars: 5, names: ["{city} Estate Hotel", "The Reserve {city}"] },
  ],
  icon: [
    { stars: 5, names: ["{city} Penthouse Suites", "The {city} Private Villa"] },
    { stars: 5, names: ["{city} Sky Residence", "The Sovereign {city}"] },
    { stars: 5, names: ["{city} Bespoke Estate", "The {city} Atelier Suite"] },
    { stars: 5, names: ["{city} Signature Villa", "The {city} Crown Penthouse"] },
  ],
};

const AMENITY_POOL: Record<CostTier, string[]> = {
  bunk: ["Free Wi-Fi", "Shared kitchen", "Lockers", "Common room", "Laundry (paid)"],
  basic: ["Free Wi-Fi", "24-hour front desk", "Shared lounge", "Self check-in"],
  premium: ["Free Wi-Fi", "Rooftop bar", "Fitness center", "Airport shuttle", "Breakfast included"],
  luxury: ["Free Wi-Fi", "Spa & wellness center", "Concierge service", "Valet parking", "In-room dining", "Rooftop pool"],
  icon: ["Private chef on request", "Dedicated butler", "Private pool or terrace", "Helicopter transfer available", "24/7 personal concierge", "Backstage/VIP show access"],
};

const DESCRIPTIONS: Record<CostTier, string[]> = {
  bunk: [
    "A bunk in a shared dorm room — built for travelers who'd rather put their money toward the ticket and the flight.",
    "Social hostel vibe with a common room and shared kitchen, a quick ride from the venue.",
  ],
  basic: [
    "A no-frills stay close to transit, built for travelers who'd rather spend on the show than the room.",
    "Clean, simple rooms a short ride from the venue — in and out without the markup.",
  ],
  premium: [
    "A well-located stay with a bit of style, walking distance to nightlife and food.",
    "Comfortable rooms with a lively in-house bar scene, popular with festival crowds.",
  ],
  luxury: [
    "A high-end property with full amenities, for travelers who want the trip to feel like part of the show.",
    "Elevated rooms and service minutes from the venue, with a dedicated late-night concierge.",
  ],
  icon: [
    "A private suite or villa with dedicated staff — for travelers who treat the trip like the headline act.",
    "The top of the market: full privacy, white-glove service, and a stay built around the show, not around you working around it.",
  ],
};

const DISTANCES = [
  "0.2 mi from venue",
  "0.5 mi from venue",
  "0.8 mi from venue",
  "1.1 mi from venue",
  "1.4 mi from venue",
  "1.8 mi from venue",
  "2.3 mi from venue",
  "3.0 mi from venue",
];

// Generates mock hotel options around a tier's base nightly price. `count`
// controls how many to return — TripBuilder shows 4 by default and can
// request more via "show more hotels".
export function generateHotelOptions(
  showId: string,
  cityLabel: string,
  tier: CostTier,
  basePricePerNight: number,
  count: number = 8
): Hotel[] {
  const city = cityLabel.split(",")[0];
  const groups = NAME_POOL[tier];
  const amenities = AMENITY_POOL[tier];
  const descriptions = DESCRIPTIONS[tier];

  const priceMultipliers = [0.82, 0.92, 1.0, 1.08, 1.16, 1.24, 1.34, 1.45];

  return Array.from({ length: count }, (_, i) => {
    const group = groups[i % groups.length];
    const nameTemplate = group.names[Math.floor(i / groups.length) % group.names.length];
    const jitter = 0.95 + seededRandom(`${showId}-${tier}-hotel-${i}`) * 0.1;
    const maxAmenities = amenities.length;
    const amenityCount = Math.min(
      maxAmenities,
      3 + Math.floor(seededRandom(`${showId}-${tier}-amen-${i}`) * (maxAmenities - 2))
    );

    return {
      id: `${tier}-hotel-${i}`,
      name: nameTemplate.replace("{city}", city),
      stars: group.stars,
      distanceFromVenue: DISTANCES[i % DISTANCES.length],
      pricePerNight: Math.round(basePricePerNight * priceMultipliers[i % priceMultipliers.length] * jitter),
      description: descriptions[i % descriptions.length],
      amenities: amenities.slice(0, amenityCount),
    };
  });
}
