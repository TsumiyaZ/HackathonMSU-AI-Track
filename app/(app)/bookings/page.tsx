import { readJSON, DATA } from "@/lib/json-db";
import { getSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import BookingsClient from "./BookingsClient";

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/auth/login?redirect=/bookings");
  }

  const [allTickets, allBookings, flights, hotels] = await Promise.all([
    readJSON<any[]>(DATA.flightTickets),
    readJSON<any[]>(DATA.hotelBookings),
    readJSON<any[]>(DATA.flights),
    readJSON<any[]>(DATA.hotels),
  ]);

  const userTickets = allTickets.filter((t: any) => t.user_id === userId);
  const userBookings = allBookings.filter((b: any) => b.user_id === userId);

  const list = [
    ...userTickets.map((t: any) => {
      const flight = flights.find((f: any) => f.flight_id === t.flight_id) ?? {};
      return {
        id: t.ticket_id,
        type: "เที่ยวบิน",
        title: `${flight.airline || ''} (${flight.origin || ''} ➔ ${flight.destination || ''})`,
        date: flight.departure_time || '',
        price: flight.price || 0,
        status: t.status,
      };
    }),
    ...userBookings.map((b: any) => {
      const hotel = hotels.find((h: any) => h.hotel_id === b.hotel_id) ?? {};
      return {
        id: b.booking_id,
        type: "โรงแรม",
        title: hotel.name || '',
        date: b.check_in || '',
        price: b.total_price,
        status: b.status,
      };
    }),
  ];

  list.sort((a: any, b: any) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  const serializedBookings = list.map((b: any) => ({
    ...b,
    date: b.date ? new Date(b.date).toISOString() : '',
  }));

  return (
    <div className="max-w-6xl mx-auto w-full">
      <BookingsClient initialData={serializedBookings} />
    </div>
  );
}
