// Outbound affiliate booking links — flights route to Skyscanner, hotels
// route to Booking.com. These are real, working search links today with no
// signup required. To start earning referral commission:
//
// Flights (Skyscanner): apply at https://www.partners.skyscanner.net/product/affiliates
// (managed through Impact). Once approved, set NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID
// — it gets appended to every flight link as the "associateid" param.
//
// Hotels (Booking.com): apply at https://www.booking.com/affiliate-program/v2/index.html
// (routed through Awin in the US, CJ in Europe). Once approved, set
// NEXT_PUBLIC_BOOKING_AFFILIATE_ID — it gets appended as the "aid" param.
//
// Both require an active, live website to get approved — which this app now
// has once deployed. Without either ID set, links still work, just without
// commission attribution.

export function buildFlightBookingLink(
  originIata: string,
  destinationIata: string,
  departureDate: string
): string {
  // Skyscanner's deep-link format: /transport/flights/{origin}/{dest}/{yymmdd}/
  const yymmdd = departureDate.replace(/-/g, "").slice(2);
  const url = new URL(
    `https://www.skyscanner.net/transport/flights/${originIata.toLowerCase()}/${destinationIata.toLowerCase()}/${yymmdd}/`
  );

  const affiliateId = process.env.NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID;
  if (affiliateId) {
    url.searchParams.set("associateid", affiliateId);
  }
  return url.toString();
}

export function buildHotelBookingLink(
  hotelName: string,
  cityLabel: string,
  checkInDate: string,
  checkOutDate: string
): string {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", `${hotelName}, ${cityLabel}`);
  url.searchParams.set("checkin", checkInDate);
  url.searchParams.set("checkout", checkOutDate);

  const affiliateId = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
  if (affiliateId) {
    url.searchParams.set("aid", affiliateId);
  }
  return url.toString();
}
