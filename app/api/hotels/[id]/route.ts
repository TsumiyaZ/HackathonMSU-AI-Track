import { NextResponse } from "next/server";
import {
  getBookingsForHotel,
  getHotelBookingSummary,
  getHotelById,
  getHotelSentiment,
} from "@/lib/hotels";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  if (!hotel) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  const [bookings, summary, sentiment] = await Promise.all([
    getBookingsForHotel(id),
    getHotelBookingSummary(id),
    getHotelSentiment(id),
  ]);

  return NextResponse.json({
    hotel,
    summary,
    sentiment,
    bookings,
  });
}
