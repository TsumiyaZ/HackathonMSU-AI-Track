import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import BookingsClient from "./BookingsClient";

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/auth/login?redirect=/bookings");
  }

  const [flightTickets, hotelBookings] = await Promise.all([
    prisma.flightTicket.findMany({
      where: { user_id: userId },
      include: { flight: true },
    }),
    prisma.hotelBooking.findMany({
      where: { user_id: userId },
      include: { hotel: true },
    }),
  ]);

  const serializedFlightBookings = flightTickets
    .map((ticket) => ({
      id: ticket.ticket_id,
      type: "เที่ยวบิน" as const,
      title: ticket.flight.airline,
      subtitle: `${ticket.flight.origin} → ${ticket.flight.destination} • ${ticket.flight.flight_id.toUpperCase()}`,
      date: ticket.flight.departure_time.toISOString(),
      price: ticket.flight.price,
      status: ticket.status,
      href: `/explore/flight/${ticket.flight.flight_id}`,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const serializedHotelBookings = hotelBookings
    .map((booking) => ({
      id: booking.booking_id,
      type: "โรงแรม" as const,
      title: booking.hotel.name,
      subtitle: `${booking.hotel.location} • เช็คเอาท์ ${booking.check_out.toLocaleDateString("th-TH")}`,
      date: booking.check_in.toISOString(),
      price: booking.total_price,
      status: booking.status,
      href: `/bookings/${booking.booking_id}`,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto w-full">
      <h1 className="font-display text-3xl font-black mb-2">ประวัติการจอง</h1>
      <p className="text-on-surface-variant mb-8">จัดการรายการจองตั๋วเครื่องบินและโรงแรมของคุณ</p>
      
      <BookingsClient
        flightBookings={serializedFlightBookings}
        hotelBookings={serializedHotelBookings}
      />
    </div>
  );
}
