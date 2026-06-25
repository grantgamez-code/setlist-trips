// Thin client for the Amadeus self-service API (flight + hotel pricing).
// Sign up free at https://developers.amadeus.com, create an app, and set
// AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET in .env.local to go live.
// Sandbox data is sparse/randomized — every call site here falls back to
// the simulated pricing model in lib/pricing.ts on any failure or miss.

const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function amadeusConfigured(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const res = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export type RealFlightPrice = { economyTotal: number; currency: string };

export async function fetchFlightPrice(
  originIata: string,
  destinationIata: string,
  departureDate: string
): Promise<RealFlightPrice | null> {
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({
      originLocationCode: originIata,
      destinationLocationCode: destinationIata,
      departureDate,
      adults: "1",
      currencyCode: "USD",
      max: "5",
    });

    const res = await fetch(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const offers = data.data as Array<{ price: { total: string; currency: string } }>;
    if (!offers || offers.length === 0) return null;

    const cheapest = offers.reduce((min, o) =>
      parseFloat(o.price.total) < parseFloat(min.price.total) ? o : min
    );
    return { economyTotal: parseFloat(cheapest.price.total), currency: cheapest.price.currency };
  } catch {
    return null;
  }
}

export type RealHotelPrice = { nightlyLow: number; nightlyHigh: number; currency: string };

export async function fetchHotelPriceRange(
  cityIataCode: string
): Promise<RealHotelPrice | null> {
  try {
    const token = await getAccessToken();
    const listRes = await fetch(
      `${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?cityCode=${cityIataCode}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!listRes.ok) return null;
    const listData = await listRes.json();
    const hotelIds = (listData.data as Array<{ hotelId: string }>)
      ?.slice(0, 20)
      .map((h) => h.hotelId);
    if (!hotelIds || hotelIds.length === 0) return null;

    const offersRes = await fetch(
      `${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(",")}&adults=1&roomQuantity=1&currency=USD`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!offersRes.ok) return null;
    const offersData = await offersRes.json();
    const prices = (offersData.data as Array<{ offers: Array<{ price: { total: string; currency: string } }> }>)
      ?.flatMap((h) => h.offers)
      .map((o) => parseFloat(o.price.total))
      .filter((p) => !isNaN(p));
    if (!prices || prices.length === 0) return null;

    return {
      nightlyLow: Math.min(...prices),
      nightlyHigh: Math.max(...prices),
      currency: "USD",
    };
  } catch {
    return null;
  }
}
