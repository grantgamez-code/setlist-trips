import Link from "next/link";
import { DATA_AS_OF, shows as staticShows } from "@/lib/data";
import { fetchAllLiveShows } from "@/lib/ticketmaster";
import ShowsBrowser from "@/app/ShowsBrowser";

export default async function BookPage() {
  const liveShows = await fetchAllLiveShows();
  const shows = liveShows ?? staticShows;
  const isLive = liveShows !== null;

  return (
    <main className="min-h-screen bg-[#0a1410] text-[#f6f3ea]">
      <div className="relative w-full px-6 py-16 text-center">
        <Link
          href="/"
          className="absolute left-6 top-16 border border-neutral-700 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#1fae72] transition hover:border-[#1fae72] hover:bg-[#1fae72] hover:text-[#0a1410]"
        >
          ← Home
        </Link>

        <div className="inline-block border border-[#f6f3ea] px-3 py-1">
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            SetList
          </h1>
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm uppercase tracking-widest text-[#0f6e44]">
          Trips built around the show, not the other way around
        </p>
        <p className="mt-2 text-xs uppercase tracking-wide text-neutral-600">
          {isLive
            ? "Live tour dates from Ticketmaster — refreshed hourly"
            : `Tour dates accurate as of ${DATA_AS_OF} — schedules change, always confirm before booking`}
        </p>

        <div className="mt-4 flex justify-center">
          <SocialLinks />
        </div>
      </div>

      <ShowsBrowser shows={shows} />
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
    <div className="flex gap-3 pt-1">
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
