import Link from "next/link";
import { notFound } from "next/navigation";
import { airports, shows } from "@/lib/data";
import { getItineraryPrice, ITINERARY_DISCOUNT_PERCENT } from "@/lib/itinerary";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tier?: string;
    origin?: string;
    total?: string;
    hotel?: string;
    nights?: string;
    checkIn?: string;
    itinerary?: string;
  }>;
}) {
  const { id } = await params;
  const { tier, origin, total, hotel, nights, checkIn, itinerary } = await searchParams;
  const show = shows.find((s) => s.id === id);
  if (!show || !tier || !origin || !total) notFound();

  const originAirport = airports.find((a) => a.code === origin);

  return (
    <main className="min-h-screen bg-[#0a1410] text-[#f6f3ea]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href={`/trip/${show.id}`}
          className="text-xs uppercase tracking-widest text-[#1fae72] hover:underline"
        >
          ← Back to trip
        </Link>

        <h1 className="mt-4 text-2xl font-black uppercase tracking-tighter">
          Checkout
        </h1>
        <p className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
          {show.artist} · {show.venue} · {show.city}
        </p>

        <div className="mt-6 border border-neutral-700 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
              {tier} package
            </span>
            <span className="text-xl font-black">
              ${parseInt(total, 10).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
            From {originAirport ? `${originAirport.city} (${originAirport.code})` : origin}
            {checkIn && nights && (
              <>
                {" "}
                ·{" "}
                {new Date(checkIn + "T00:00:00").toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}{" "}
                for {nights} {nights === "1" ? "night" : "nights"}
              </>
            )}
          </div>
          {hotel && (
            <div className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
              Hotel: {hotel}
            </div>
          )}
          {itinerary === "1" && (
            <div className="mt-2 text-xs uppercase tracking-wide text-[#1fae72]">
              + Full day-by-day itinerary (${getItineraryPrice(parseInt(nights ?? "0", 10))}) ·{" "}
              {ITINERARY_DISCOUNT_PERCENT}% trip discount applied
            </div>
          )}
        </div>

        <CheckoutForm
          showId={show.id}
          tier={tier}
          origin={origin}
          total={parseInt(total, 10)}
        />
      </div>
    </main>
  );
}
