// Calls the Claude API to generate a Bourdain-voiced single food + activity
// teaser for a show's city. This is the free preview — kept deliberately
// thin (one pick each) since the full day-by-day breakdown is the paid
// itinerary add-on (lib/itinerary.ts). Sign up free at
// https://console.anthropic.com, create an API key, and set
// ANTHROPIC_API_KEY in .env.local to go live. Without it, this returns
// null and the UI falls back to a generic static guide.

export type FoodPick = {
  name: string;
  cuisine: string;
  neighborhood: string;
  blurb: string;
};

export type ActivityPick = {
  name: string;
  blurb: string;
};

export type LocalGuide = {
  intro: string;
  mustEat: FoodPick;
  mustDo: ActivityPick;
};

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `You write short, voicey city teasers in the spirit of Anthony Bourdain — curious, a little irreverent, plainspoken, no food-blog cliches ("hidden gem", "must-try", "foodie paradise").

You have a web_search tool. USE IT. Search for the single best, most-talked-about food spot in the city right now and the single best specific thing to do (e.g. "best restaurant [city] 2025", "iconic food [city]", "best thing to do [city]") before answering. The restaurant/food spot and the activity must be real, currently-operating, named places you found via search — not invented.

This is a teaser, not a full guide — give exactly ONE food pick and ONE activity, the single best can't-miss option for each, not a list.

After searching, output ONLY valid JSON matching this shape as your final message, no markdown fences, no commentary:
{
  "intro": "1-2 sentences setting the scene for this city, in voice",
  "mustEat": { "name": "real restaurant/vendor name", "cuisine": "...", "neighborhood": "...", "blurb": "1-2 sentences on why this is THE one, in voice" },
  "mustDo": { "name": "a real, specific, named place or thing to do", "blurb": "1-2 sentences on why this is THE one, in voice" }
}`;

export async function fetchLocalGuide(
  city: string,
  country: string
): Promise<LocalGuide | null> {
  if (!anthropicConfigured()) return null;

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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
        messages: [
          {
            role: "user",
            content: `City: ${city}, ${country}. Search for the single best food spot and the single best activity, give me the teaser.`,
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
    if (!parsed.mustEat || !parsed.mustDo) return null;
    return parsed as LocalGuide;
  } catch {
    return null;
  }
}

// Static fallback so the feature still demos without an API key.
export function fallbackGuide(city: string): LocalGuide {
  return {
    intro: `${city} will feed you well if you know where to look — the trick is not eating the same meal three times just because it's the one you found first.`,
    mustEat: {
      name: "The spot every local brings up unprompted",
      cuisine: "Local specialty",
      neighborhood: "City center",
      blurb: "Not flashy, just correct — order what the regulars are having and say thank you on the way out.",
    },
    mustDo: {
      name: "The thing that's actually worth rearranging your day for",
      blurb: "Everything else on the list is optional. This one isn't.",
    },
  };
}
