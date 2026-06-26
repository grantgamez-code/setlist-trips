import { NextResponse } from "next/server";

// Temporary diagnostic route — confirms whether TICKETMASTER_API_KEY is
// set and what Ticketmaster's API actually returns, without exposing the
// key itself. Delete this once live shows are confirmed working.
export async function GET() {
  const key = process.env.TICKETMASTER_API_KEY;

  if (!key) {
    return NextResponse.json({ keyPresent: false });
  }

  const masked = `${key.slice(0, 4)}...${key.slice(-4)} (length ${key.length})`;

  try {
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("apikey", key);
    url.searchParams.set("classificationName", "dance");
    url.searchParams.set("size", "3");

    const res = await fetch(url.toString());
    const bodyText = await res.text();

    return NextResponse.json({
      keyPresent: true,
      maskedKey: masked,
      status: res.status,
      bodySnippet: bodyText.slice(0, 500),
    });
  } catch (err) {
    return NextResponse.json({
      keyPresent: true,
      maskedKey: masked,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
