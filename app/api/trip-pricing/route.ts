import { NextRequest, NextResponse } from "next/server";
import { amadeusConfigured, fetchFlightPrice, fetchHotelPriceRange } from "@/lib/amadeus";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const originCode = searchParams.get("originCode");
  const destinationCode = searchParams.get("destinationCode");
  const date = searchParams.get("date");

  if (!originCode || !destinationCode || !date) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (!amadeusConfigured()) {
    return NextResponse.json({ live: false });
  }

  const [flight, hotel] = await Promise.all([
    fetchFlightPrice(originCode, destinationCode, date),
    fetchHotelPriceRange(destinationCode),
  ]);

  if (!flight && !hotel) {
    return NextResponse.json({ live: false });
  }

  return NextResponse.json({ live: true, flight, hotel });
}
