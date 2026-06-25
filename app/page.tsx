import Link from "next/link";
import PromoPopup from "./PromoPopup";

const SCENES = [
  {
    src: "https://images.unsplash.com/photo-1632008650337-3b8befff9d75?w=1200&q=80&auto=format&fit=crop",
    caption: "Big room, bigger crowd",
  },
  {
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80&auto=format&fit=crop",
    caption: "Hands up, sun down",
  },
  {
    src: "https://images.unsplash.com/photo-1757439402359-aed14d39fc1b?w=1200&q=80&auto=format&fit=crop",
    caption: "Where you'll actually sleep",
  },
  {
    src: "https://images.unsplash.com/photo-1656423521731-9665583f100c?w=1200&q=80&auto=format&fit=crop",
    caption: "The meal worth the flight",
  },
];

const REVIEWS = [
  {
    quote:
      "I picked the Fisher show, picked an airport, and had a full trip — flights, hotel, hostel option, all of it — in like two minutes. Never going back to ten browser tabs.",
    name: "Maya R.",
    detail: "Brooklyn Mirage, NY",
  },
  {
    quote:
      "Booked the Bunk tier for Boris Brejcha in Denmark on a whim. Hostel bed, budget flight, still made it to front of stage. This is what travel planning should feel like.",
    name: "Devon K.",
    detail: "Odense, Denmark",
  },
  {
    quote:
      "Did Icon tier for my 30th — private villa, first class, the whole thing. The local guide pointed me to a street cart that ended up being the best meal of the trip.",
    name: "Priya S.",
    detail: "Ibiza, Spain",
  },
  {
    quote:
      "The fact that I can filter by country and just see every Charlotte de Witte date in one place is genuinely the only reason I caught this tour at all.",
    name: "Theo M.",
    detail: "Barcelona, Spain",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a1410] text-[#f6f3ea]">
      <PromoPopup />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-800 px-6 py-28 sm:py-36">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=2000&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1410] via-[#0a1410]/80 to-[#0a1410]/40" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-block border border-[#f6f3ea] px-3 py-1">
            <span className="text-2xl font-black uppercase tracking-tighter">
              SetList
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-black uppercase leading-tight tracking-tighter sm:text-6xl">
            Pick the show.
            <br />
            We build the trip.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic text-[#1fae72]">
            Flights, hotels, tickets, and the food worth flying for — all
            built around the artists and dates you actually care about.
          </p>
          <Link
            href="/book"
            className="mt-8 inline-block border border-[#f6f3ea] bg-[#f6f3ea] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#0a1410] transition hover:bg-transparent hover:text-[#f6f3ea]"
          >
            Book
          </Link>
        </div>
      </section>

      {/* Scenes from the road */}
      <section className="border-b border-neutral-800 py-16">
        <div className="text-center text-xs font-bold uppercase tracking-widest text-[#1fae72]">
          Scenes from the road
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4">
          {SCENES.map((scene) => (
            <div key={scene.caption} className="group relative aspect-[3/4] overflow-hidden">
              <img
                src={scene.src}
                alt={scene.caption}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="select-none border border-[#f6f3ea] bg-[#0a1410]/60 px-4 py-2 text-xl font-black uppercase tracking-tighter text-[#f6f3ea]">
                  SetList
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our story */}
      <section className="border-b border-neutral-800 px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-[1fr_2fr]">
          <div className="text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            Our story
          </div>
          <div className="space-y-5 font-serif text-base leading-relaxed text-neutral-300">
            <p>
              This started the way most bad travel plans do — a lineup
              announcement, eleven browser tabs, and a group chat arguing
              about which airport actually saves money once you factor in
              the hotel.
            </p>
            <p>
              Every other travel site treats the destination as the point
              and the show as an afterthought. We flipped it. You&apos;re
              not going to Barcelona — you&apos;re going to see Charlotte
              de Witte, and Barcelona is just where that happens to be
              this year.
            </p>
            <p>
              So we built the thing we wanted: pick the artist, pick the
              date, get a real trip — tiered from a hostel bunk and a
              budget fare up to a private villa and a first class seat —
              with the food and the city handled too, not just the
              flight.
            </p>
            <p className="italic text-[#f6f3ea]">
              Built by people who&apos;d rather plan a trip around a
              setlist than a skyline.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-[#1fae72]">
            What people are saying
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {REVIEWS.map((review) => (
              <div key={review.name} className="border border-neutral-800 p-5">
                <p className="font-serif text-base italic leading-relaxed text-neutral-200">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-[#f6f3ea]">
                  {review.name}
                </div>
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  {review.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-neutral-800 px-6 py-16 text-center">
        <p className="text-sm uppercase tracking-widest text-neutral-400">
          Next show&apos;s already on sale.
        </p>
        <Link
          href="/book"
          className="mt-5 inline-block border border-[#1fae72] bg-[#1fae72] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#0a1410] transition hover:bg-transparent hover:text-[#1fae72]"
        >
          Book
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-4 border-t border-neutral-800 px-6 py-8">
        <SocialLinks />
      </footer>
    </main>
  );
}

function SocialLinks() {
  const links = [
    {
      label: "Instagram",
      href: "https://instagram.com/setlisttrips",
      path: "M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 13 5.5 5.5 0 0 0 12 7.5zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5zM17.8 6a1.2 1.2 0 1 0 1.2 1.2A1.2 1.2 0 0 0 17.8 6z",
    },
    {
      label: "X",
      href: "https://x.com/setlisttrips",
      path: "M3 3h4.6l4 5.4L16 3h4.6l-6.9 8.4L21 21h-4.6l-4.4-5.9L6.4 21H1.8l7.3-8.9L3 3z",
    },
    {
      label: "TikTok",
      href: "https://tiktok.com/@setlisttrips",
      path: "M16.6 2h-3v13.2a3 3 0 1 1-2.2-2.9V9.2A6 6 0 1 0 16.6 15V8.4a7.6 7.6 0 0 0 4.4 1.4V6.7a4.6 4.6 0 0 1-4.4-4.7z",
    },
  ];

  return (
    <div className="flex gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="text-neutral-500 transition hover:text-[#1fae72]"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d={link.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
