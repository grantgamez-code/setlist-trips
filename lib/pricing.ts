import { airports, Show } from "./data";

export type CostTier = "bunk" | "basic" | "premium" | "luxury" | "icon";

export type TierBreakdown = {
  tier: CostTier;
  label: string;
  flightCost: number;
  hotelCostPerNight: number;
  nights: number;
  hotelTotal: number;
  totalCost: number;
  flightDescription: string;
  hotelDescription: string;
};

export type TripPlan = {
  show: Show;
  originCode: string;
  destinationCode: string;
  distanceMiles: number;
  nights: number;
  tiers: TierBreakdown[];
};

// Haversine distance between two airports, in miles.
function distanceMiles(aCode: string, bCode: string): number {
  const a = airports.find((x) => x.code === aCode);
  const b = airports.find((x) => x.code === bCode);
  if (!a || !b) return 0;
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Deterministic pseudo-random in [0, 1) seeded by a string, so the same
// show + origin always renders the same mock price instead of jittering
// on every reload.
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const x = Math.sin(h) * 10000;
  return x - Math.floor(x);
}

const TIER_CONFIG: Record<
  CostTier,
  {
    label: string;
    flightMultiplier: number;
    flightDescription: string;
    hotelPerNightBase: number;
    hotelDescription: string;
  }
> = {
  bunk: {
    label: "Bunk",
    flightMultiplier: 0.5,
    flightDescription: "Economy, budget carrier, basic fare",
    hotelPerNightBase: 42,
    hotelDescription: "Hostel dorm bed or shared room",
  },
  basic: {
    label: "Basic",
    flightMultiplier: 0.7,
    flightDescription: "Economy, basic/no-flex fare",
    hotelPerNightBase: 90,
    hotelDescription: "2–3 star hotel or hostel",
  },
  premium: {
    label: "Premium",
    flightMultiplier: 1.3,
    flightDescription: "Premium economy, flexible fare",
    hotelPerNightBase: 190,
    hotelDescription: "3–4 star hotel, central location",
  },
  luxury: {
    label: "Luxury",
    flightMultiplier: 2.3,
    flightDescription: "Business class, fully flexible fare",
    hotelPerNightBase: 380,
    hotelDescription: "4–5 star hotel near the venue",
  },
  icon: {
    label: "Icon",
    flightMultiplier: 3.4,
    flightDescription: "First class, fully flexible fare",
    hotelPerNightBase: 850,
    hotelDescription: "5-star suite or private villa",
  },
};

export const DEFAULT_NIGHTS = 3;

export function planTrip(
  originCode: string,
  show: Show,
  nights: number = DEFAULT_NIGHTS
): TripPlan {
  const distance = distanceMiles(originCode, show.airportCode);

  // Same-airport trips (no flight needed) get a small distance floor
  // so the cost model doesn't divide-by-zero-flavor break down.
  const effectiveDistance = Math.max(distance, 50);

  const baseFlightCost = 60 + effectiveDistance * 0.16;
  const cityCostFactor = cityCostOfLivingFactor(show.city);

  const tiers: TierBreakdown[] = (Object.keys(TIER_CONFIG) as CostTier[]).map(
    (tier) => {
      const cfg = TIER_CONFIG[tier];
      const jitter = 0.9 + seededRandom(`${originCode}-${show.id}-${tier}`) * 0.2;
      const flightCost = Math.round(baseFlightCost * cfg.flightMultiplier * jitter);
      const hotelCostPerNight = Math.round(
        cfg.hotelPerNightBase * cityCostFactor * jitter
      );
      const hotelTotal = hotelCostPerNight * nights;
      return {
        tier,
        label: cfg.label,
        flightCost,
        hotelCostPerNight,
        nights,
        hotelTotal,
        totalCost: flightCost + hotelTotal,
        flightDescription: cfg.flightDescription,
        hotelDescription: cfg.hotelDescription,
      };
    }
  );

  return {
    show,
    originCode,
    destinationCode: show.airportCode,
    distanceMiles: Math.round(distance),
    nights,
    tiers,
  };
}

// Overlays real Duffel pricing onto the simulated tiers when available.
// Flight: real economy price anchors "premium"; basic/luxury scale off it.
// Hotel: real nightly low/high anchor basic/luxury; premium is the midpoint.
export function applyLivePricing(
  plan: TripPlan,
  live: { flight?: { economyTotal: number } | null; hotel?: { nightlyLow: number; nightlyHigh: number } | null }
): TripPlan {
  const tiers = plan.tiers.map((tier) => {
    let flightCost = tier.flightCost;
    let hotelCostPerNight = tier.hotelCostPerNight;

    if (live.flight) {
      const base = live.flight.economyTotal;
      const multiplier =
        tier.tier === "bunk"
          ? 0.55
          : tier.tier === "basic"
            ? 0.75
            : tier.tier === "premium"
              ? 1.3
              : tier.tier === "luxury"
                ? 2.3
                : tier.tier === "icon"
                  ? 3.6
                  : 1;
      flightCost = Math.round(base * multiplier);
    }
    if (live.hotel) {
      hotelCostPerNight = Math.round(
        tier.tier === "bunk"
          ? live.hotel.nightlyLow * 0.6
          : tier.tier === "basic"
            ? live.hotel.nightlyLow
            : tier.tier === "luxury"
              ? live.hotel.nightlyHigh
              : tier.tier === "icon"
                ? live.hotel.nightlyHigh * 1.7
                : (live.hotel.nightlyLow + live.hotel.nightlyHigh) / 2
      );
    }
    const hotelTotal = hotelCostPerNight * tier.nights;
    return { ...tier, flightCost, hotelCostPerNight, hotelTotal, totalCost: flightCost + hotelTotal };
  });
  return { ...plan, tiers };
}

// Rough relative cost-of-living multiplier per destination city, so hotel
// estimates aren't flat across e.g. Las Vegas vs. Amsterdam.
function cityCostOfLivingFactor(city: string): number {
  const table: Record<string, number> = {
    "New York, NY": 1.4,
    "Los Angeles, CA": 1.2,
    "Chicago, IL": 1.0,
    "Miami, FL": 1.25,
    "Denver, CO": 0.95,
    "Morrison, CO": 0.95,
    "San Francisco, CA": 1.35,
    "Las Vegas, NV": 1.15,
    "Amsterdam, Netherlands": 1.3,
    "Arnhem, Netherlands": 1.1,
    "Barcelona, Spain": 1.05,
    "Madrid, Spain": 1.05,
    "A Coruña, Spain": 0.95,
    "Ibiza, Spain": 1.5,
    "London, UK": 1.45,
    "Newport, UK": 1.1,
    "Manchester, UK": 1.05,
    "Brussels, Belgium": 1.15,
    "Boom, Belgium": 1.0,
    "Vasto, Italy": 0.9,
    "Hockenheim, Germany": 1.0,
    "Austin, TX": 1.05,
    "Dubai, UAE": 1.4,
    "San Diego, CA": 1.2,
    "Dallas, TX": 1.0,
    "Washington, DC": 1.25,
    "Bogotá, Colombia": 0.8,
    "Oslo, Norway": 1.4,
    "Paris, France": 1.35,
    "Seoul, South Korea": 1.15,
    "Surrey, BC": 1.05,
    "Edmonton, Canada": 0.95,
    "Champaign, IL": 0.85,
    "Odense, Denmark": 1.15,
  };
  return table[city] ?? 1.0;
}
