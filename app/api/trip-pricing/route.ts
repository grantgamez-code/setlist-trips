import { NextRequest, NextResponse } from "next/server";
import { duffelConfigured, fetchFlightPrice, fetchHotelPriceRange } from "@/lib/duffel";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const originCode = searchParams.get("originCode");
  const destinationCode = searchParams.get("destinationCode");
  const date = searchParams.get("date");
  const checkIn = searchParams.get("checkIn") ?? date;
  const checkOut = searchParams.get("checkOut");

  if (!originCode || !destinationCode || !date || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (!duffelConfigured()) {
    return NextResponse.json({ live: false });
  }

  const [flight, hotel] = await Promise.all([
    fetchFlightPrice(originCode, destinationCode, date),
    fetchHotelPriceRange(destinationCode, checkIn, checkOut),
  ]);

  if (!flight && !hotel) {
    return NextResponse.json({ live: false });
  }

  return NextResponse.json({ live: true, flight, hotel });
}
