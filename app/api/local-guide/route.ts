import { NextRequest, NextResponse } from "next/server";
import { anthropicConfigured, fetchLocalGuide, fallbackGuide } from "@/lib/local-guide";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");

  if (!city || !country) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (!anthropicConfigured()) {
    return NextResponse.json({ live: false, guide: fallbackGuide(city) });
  }

  const guide = await fetchLocalGuide(city, country);
  if (!guide) {
    return NextResponse.json({ live: false, guide: fallbackGuide(city) });
  }

  return NextResponse.json({ live: true, guide });
}
