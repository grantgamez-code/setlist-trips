// Ticket links route to Ticketmaster search results for the artist + tier
// keyword. These are real, working links today (no API key required).
//
// To monetize via referral, apply to Ticketmaster's affiliate program
// (run through Impact Radius) or a partner network, then set
// NEXT_PUBLIC_TICKETMASTER_AFFILIATE_ID — it gets appended to every link.
// Swapping to the Ticketmaster Discovery API (TICKETMASTER_API_KEY) would
// let this resolve to the exact event + ticket type instead of a search
// page; that requires the same free-signup pattern as the Amadeus keys.

export type TicketTier = "general" | "vip" | "backstage";

const TICKET_TIER_CONFIG: Record<TicketTier, { label: string; description: string; searchKeyword: string }> = {
  general: {
    label: "General Admission",
    description: "Standard entry, no perks",
    searchKeyword: "",
  },
  vip: {
    label: "VIP",
    description: "Priority entry, premium viewing area",
    searchKeyword: "VIP",
  },
  backstage: {
    label: "Backstage / Meet & Greet",
    description: "Artist meet & greet, backstage access",
    searchKeyword: "VIP meet and greet",
  },
};

export function buildTicketLink(artist: string, tier: TicketTier): string {
  const cfg = TICKET_TIER_CONFIG[tier];
  const query = [artist, cfg.searchKeyword].filter(Boolean).join(" ");
  const url = new URL("https://www.ticketmaster.com/search");
  url.searchParams.set("q", query);

  const affiliateId = process.env.NEXT_PUBLIC_TICKETMASTER_AFFILIATE_ID;
  if (affiliateId) {
    url.searchParams.set("camref", affiliateId);
  }
  return url.toString();
}

export function getTicketTiers(): { tier: TicketTier; label: string; description: string }[] {
  return (Object.keys(TICKET_TIER_CONFIG) as TicketTier[]).map((tier) => ({
    tier,
    label: TICKET_TIER_CONFIG[tier].label,
    description: TICKET_TIER_CONFIG[tier].description,
  }));
}
