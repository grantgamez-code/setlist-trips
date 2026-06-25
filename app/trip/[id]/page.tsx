import Link from "next/link";
import { notFound } from "next/navigation";
import { shows } from "@/lib/data";
import { fetchLiveShowById } from "@/lib/ticketmaster";
import { buildTicketLink, getTicketTiers } from "@/lib/ticketing";
import LocalGuide from "./LocalGuide";
import TripBuilder from "./TripBuilder";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = id.startsWith("tm-")
    ? await fetchLiveShowById(id.slice(3))
    : shows.find((s) => s.id === id);
  if (!show) notFound();

  return (
    <main className="min-h-screen bg-[#0a1410] text-[#f6f3ea]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link
          href="/book"
          className="text-xs uppercase tracking-widest text-[#1fae72] hover:underline"
        >
          ← All shows
        </Link>

        <h1 className="mt-4 text-3xl font-black uppercase tracking-tighter">
          {show.artist}
        </h1>
        <p className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
          {show.venue} · {show.city} ·{" "}
          {new Date(show.date).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            Get tickets
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {getTicketTiers().map(({ tier, label, description }) => (
              <a
                key={tier}
                href={buildTicketLink(show.artist, tier)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="border border-neutral-700 p-3 transition hover:border-[#1fae72]"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-[#f6f3ea]">
                  {label} →
                </div>
                <div className="mt-1 text-xs text-neutral-500">{description}</div>
              </a>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-neutral-600">
            Opens Ticketmaster search results for this show. We may earn a
            referral fee on bookings made through these links.
          </p>
        </div>

        <LocalGuide city={show.city} country={show.country} />

        <TripBuilder show={show} />
      </div>
    </main>
  );
}
