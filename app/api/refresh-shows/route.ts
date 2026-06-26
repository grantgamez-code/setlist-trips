import { NextResponse } from "next/server";
import { fetchCuratedArtistShows, fetchLiveShows } from "@/lib/ticketmaster";

// Triggered on a schedule (see vercel.json) to warm the fetch cache for
// every curated artist ahead of time, respecting Ticketmaster's rate
// limit. User-facing requests (lib/ticketmaster.ts fetchAllLiveShows) then
// read from that warmed cache instantly instead of waiting on this slow
// throttled pass themselves.
export const maxDuration = 60;

export async function GET() {
  const [curated, broad] = await Promise.all([
    fetchCuratedArtistShows({ throttle: true }),
    fetchLiveShows(),
  ]);

  return NextResponse.json({
    curatedCount: curated.length,
    broadCount: broad?.length ?? 0,
  });
}
