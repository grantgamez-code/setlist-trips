import { NextResponse } from "next/server";
import { filterUpcoming, mergeShows, shows as staticShows } from "@/lib/data";
import { fetchAllLiveShows } from "@/lib/ticketmaster";

// Temporary diagnostic route — checks where specific artists are getting
// lost between static data, live fetch, merge, and filter. Delete once
// resolved.
export async function GET() {
  const targets = ["ANOTR", "RÜFÜS DU SOL", "Jimi Jules"];

  const inStatic = staticShows.filter((s) => targets.includes(s.artist));

  const liveShows = await fetchAllLiveShows();
  const inLive = (liveShows ?? []).filter((s) => targets.includes(s.artist));

  const merged = mergeShows(liveShows ?? [], staticShows);
  const inMerged = merged.filter((s) => targets.includes(s.artist));

  const final = filterUpcoming(merged);
  const inFinal = final.filter((s) => targets.includes(s.artist));

  return NextResponse.json({
    isLive: liveShows !== null,
    liveShowsCount: liveShows?.length ?? 0,
    inStatic,
    inLive,
    inMerged,
    inFinal,
  });
}
