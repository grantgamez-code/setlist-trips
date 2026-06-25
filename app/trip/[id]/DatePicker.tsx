"use client";

import { useState } from "react";

const MAX_NIGHTS = 28; // 4 weeks

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

export default function DatePicker({
  showDate,
  checkInDate,
  nights,
  onChange,
}: {
  showDate: string;
  checkInDate: string;
  nights: number;
  onChange: (checkInDate: string, nights: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(checkInDate);
  const [rangeEnd, setRangeEnd] = useState<string | null>(addDays(checkInDate, nights));
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const showDateObj = new Date(showDate + "T00:00:00");
  const [viewYear, setViewYear] = useState(showDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(showDateObj.getMonth());

  const checkOutDate = rangeEnd ?? rangeStart ?? checkInDate;
  const effectiveNights = rangeStart && rangeEnd ? diffDays(rangeStart, rangeEnd) : nights;

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateForDay(day: number): string {
    return toISODate(new Date(viewYear, viewMonth, day));
  }

  function changeMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function handleDayClick(iso: string) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Starting a fresh selection.
      setRangeStart(iso);
      setRangeEnd(null);
      return;
    }
    if (iso <= rangeStart) {
      // Clicked before (or on) the current start — restart from here.
      setRangeStart(iso);
      setRangeEnd(null);
      return;
    }
    const cappedNights = Math.min(diffDays(rangeStart, iso), MAX_NIGHTS);
    const cappedEnd = addDays(rangeStart, cappedNights);
    setRangeEnd(cappedEnd);
    onChange(rangeStart, cappedNights);
    setOpen(false);
  }

  const previewEnd = rangeStart && !rangeEnd && hoverDate && hoverDate > rangeStart ? hoverDate : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 w-full border border-neutral-700 bg-[#0a1410] px-3 py-2 text-left text-sm text-[#f6f3ea] hover:border-[#1fae72]"
      >
        {new Date(checkInDate + "T00:00:00").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}{" "}
        →{" "}
        {new Date(checkOutDate + "T00:00:00").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}{" "}
        · {effectiveNights} {effectiveNights === 1 ? "night" : "nights"}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full border border-neutral-700 bg-[#0a1410] p-4 shadow-xl sm:w-80">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="px-2 text-neutral-500 hover:text-[#f6f3ea]"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#f6f3ea]">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="px-2 text-neutral-500 hover:text-[#f6f3ea]"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] uppercase tracking-wide text-neutral-500">
            {!rangeStart || (rangeStart && rangeEnd)
              ? "Pick a check-in date"
              : "Now pick a check-out date"}
          </p>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] uppercase text-neutral-500">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const iso = dateForDay(day);
              const isShowDate = iso === showDate;
              const isStart = iso === rangeStart;
              const isEnd = iso === rangeEnd;
              const isConfirmedRange =
                rangeStart && rangeEnd && iso > rangeStart && iso < rangeEnd;
              const isPreviewRange = previewEnd && iso > rangeStart! && iso < previewEnd;
              const isPreviewEnd = iso === previewEnd;

              const isEndpoint = isStart || isEnd || isPreviewEnd;
              const isInRange = isConfirmedRange || isPreviewRange;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(iso)}
                  onMouseEnter={() => setHoverDate(iso)}
                  className={`aspect-square text-xs transition ${
                    isEndpoint
                      ? "bg-[#f6f3ea] font-bold text-black"
                      : isShowDate
                        ? "border border-[#1fae72] font-bold text-[#1fae72]"
                        : isInRange
                          ? "bg-[#1fae72]/20 text-[#f6f3ea]"
                          : "text-neutral-400 hover:bg-neutral-800"
                  }`}
                  title={isShowDate ? "Show date" : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3 text-[10px] uppercase tracking-wide text-neutral-500">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 border border-[#1fae72]" />
              Show date
            </span>
            <span>Max {MAX_NIGHTS} nights</span>
          </div>
        </div>
      )}
    </div>
  );
}
