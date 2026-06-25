// Generates a full day-by-day itinerary (one activity + lunch + dinner per
// day) for the trip. This is the paid add-on — the free "Eat & do" guide in
// lib/local-guide.ts stays free. Same Claude API key as that feature
// (ANTHROPIC_API_KEY) powers this; without it, a deterministic sample
// itinerary is shown instead.

// $50 covers trips up to a week; longer trips (8+ nights) are $80 flat,
// since the per-day research cost doesn't scale linearly with trip length.
export function getItineraryPrice(nights: number): number {
  return nights <= 7 ? 50 : 80;
}

export const ITINERARY_DISCOUNT_PERCENT = 5;

export type DayPlan = {
  day: number;
  activity: { name: string; blurb: string };
  lunch: { name: string; cuisine: string; blurb: string };
  dinner: { name: string; cuisine: string; blurb: string };
};

export type Itinerary = {
  days: DayPlan[];
};

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `You write short, voicey day-by-day trip itineraries in the spirit of Anthony Bourdain — curious, plainspoken, specific, no travel-blog cliches.

You have a web_search tool. USE IT. Search for real, currently-operating restaurants and real, specific things to do in the city (e.g. "best lunch spots [city]", "best dinner restaurants [city]", "things to do [city]") before answering. Every place you name — activity, lunch, dinner — must be a real place you found via search, not invented. Vary the kind of place across days (don't repeat the same vibe every day) and don't repeat the exact same place twice across the days you're given.

For each day give exactly one activity, one lunch spot, and one dinner spot.

After searching, output ONLY valid JSON matching this shape as your final message, no markdown fences, no commentary:
{
  "days": [
    {
      "day": <day number, use the exact day numbers given in the request>,
      "activity": { "name": "real, specific, named place or thing to do", "blurb": "1 sentence, in voice" },
      "lunch": { "name": "real restaurant/stall name", "cuisine": "...", "blurb": "1 sentence, in voice" },
      "dinner": { "name": "real restaurant name", "cuisine": "...", "blurb": "1 sentence, in voice" }
    }
  ]
}
Generate exactly the days requested, using exactly the day numbers given.`;

const CHUNK_SIZE = 7;

async function fetchItineraryChunk(
  city: string,
  country: string,
  startDay: number,
  endDay: number
): Promise<DayPlan[] | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 15 }],
        messages: [
          {
            role: "user",
            content: `City: ${city}, ${country}. Generate days numbered ${startDay} through ${endDay} (that's ${endDay - startDay + 1} days). Search for real, current spots and give me the itinerary for exactly those day numbers.`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const textBlocks = (data.content ?? []).filter(
      (block: { type: string }) => block.type === "text"
    );
    const text = textBlocks[textBlocks.length - 1]?.text;
    if (!text) return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.days) return null;
    return parsed.days as DayPlan[];
  } catch {
    return null;
  }
}

const MAX_DAYS = 28;

export async function fetchItinerary(
  city: string,
  country: string,
  days: number
): Promise<Itinerary | null> {
  if (!anthropicConfigured()) return null;

  const totalDays = Math.min(days, MAX_DAYS);
  const chunkRanges: [number, number][] = [];
  for (let start = 1; start <= totalDays; start += CHUNK_SIZE) {
    chunkRanges.push([start, Math.min(start + CHUNK_SIZE - 1, totalDays)]);
  }

  const chunks = await Promise.all(
    chunkRanges.map(([start, end]) => fetchItineraryChunk(city, country, start, end))
  );

  if (chunks.some((c) => c === null)) return null;

  const allDays = (chunks as DayPlan[][]).flat().sort((a, b) => a.day - b.day);
  return { days: allDays };
}

const ACTIVITY_TEMPLATES = [
  "Walk the old quarter before the heat or the crowds show up",
  "Find the market locals actually shop at, not the tourist one",
  "Spend the afternoon somewhere with water — river, coast, doesn't matter",
  "Track down the neighborhood with the best wall art and just wander",
  "Sleep in. You're not here to be a tourist all day, you're here for tonight",
  "Take the long way to the venue and see what's actually around it",
  "Find a rooftop, a hill, anywhere with a view, and watch the city for a while",
];

const LUNCH_TEMPLATES = [
  { name: "The counter spot with the line at noon", cuisine: "Local fast-casual" },
  { name: "Whatever's good at the market hall", cuisine: "Market food" },
  { name: "The sandwich place every local has an opinion about", cuisine: "Casual" },
];

const DINNER_TEMPLATES = [
  { name: "The room everyone says you have to book ahead for", cuisine: "Upscale local" },
  { name: "The neighborhood spot with no sign out front", cuisine: "Hidden local" },
  { name: "Whatever smells best near the venue at 9pm", cuisine: "Street/casual" },
];

export function fallbackItinerary(city: string, days: number): Itinerary {
  return {
    days: Array.from({ length: days }, (_, i) => {
      const lunch = LUNCH_TEMPLATES[i % LUNCH_TEMPLATES.length];
      const dinner = DINNER_TEMPLATES[i % DINNER_TEMPLATES.length];
      return {
        day: i + 1,
        activity: {
          name: ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length],
          blurb: `Day ${i + 1} in ${city} — pace yourself, you've got a show to get to eventually.`,
        },
        lunch: { ...lunch, blurb: "Cheap, fast, and better than whatever's in the hotel." },
        dinner: { ...dinner, blurb: "Sit down, take your time, this one's worth the wait." },
      };
    }),
  };
}
