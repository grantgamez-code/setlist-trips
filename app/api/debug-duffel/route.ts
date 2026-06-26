import { NextResponse } from "next/server";

// Temporary diagnostic route — confirms whether DUFFEL_ACCESS_TOKEN is set
// and what Duffel's API actually returns, without exposing the token.
// Delete once flight pricing is confirmed working.
export async function GET() {
  const token = process.env.DUFFEL_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ tokenPresent: false });
  }

  const masked = `${token.slice(0, 10)}...${token.slice(-4)} (length ${token.length})`;

  try {
    const res = await fetch("https://api.duffel.com/air/offer_requests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin: "JFK", destination: "IBZ", departure_date: "2026-07-02" }],
          passengers: [{ type: "adult" }],
          cabin_class: "economy",
        },
      }),
    });
    const bodyText = await res.text();

    return NextResponse.json({
      tokenPresent: true,
      maskedToken: masked,
      status: res.status,
      bodySnippet: bodyText.slice(0, 800),
    });
  } catch (err) {
    return NextResponse.json({
      tokenPresent: true,
      maskedToken: masked,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
