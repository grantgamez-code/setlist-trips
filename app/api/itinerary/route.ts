import { NextRequest, NextResponse } from "next/server";
import { anthropicConfigured, fetchItinerary, fallbackItinerary } from "@/lib/itinerary";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const rawDays = parseInt(searchParams.get("days") ?? "", 10);

  if (!city || !country || !rawDays || rawDays < 1) {
    return NextResponse.json({ error: "Missing or invalid params" }, { status: 400 });
  }
  const days = Math.min(rawDays, 28);

  if (!anthropicConfigured()) {
    return NextResponse.json({ live: false, itinerary: fallbackItinerary(city, days) });
  }

  const itinerary = await fetchItinerary(city, country, days);
  if (!itinerary) {
    return NextResponse.json({ live: false, itinerary: fallbackItinerary(city, days) });
  }

  return NextResponse.json({ live: true, itinerary });
}
