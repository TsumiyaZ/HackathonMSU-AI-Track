import prisma from "@/lib/prisma";
import BookingsClient from "./BookingsClient";

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const userId = 'u001'; // Mock user

  const flightTickets = await prisma.flightTicket.findMany({
    where: { user_id: userId },
    include: { flight: true }
  });

  const hotelBookings = await prisma.hotelBooking.findMany({
    where: { user_id: userId },
    include: { hotel: true }
  });

  // Normalize data for the table
  const bookings = [
    ...flightTickets.map(t => ({
      id: t.ticket_id,
      type: 'เที่ยวบิน',
      title: `${t.flight.airline} (${t.flight.origin} ✈️ ${t.flight.destination})`,
      date: t.flight.departure_time,
      price: t.flight.price,
      status: t.status
    })),
    ...hotelBookings.map(b => ({
      id: b.booking_id,
      type: 'โรงแรม',
      title: b.hotel.name,
      date: b.check_in,
      price: b.total_price,
      status: b.status
    }))
  ];

  // Sort by date descending
  bookings.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Serialize dates to string
  const serializedBookings = bookings.map(b => ({
    ...b,
    date: b.date.toISOString()
  }));

  return (
    <div className="max-w-6xl mx-auto w-full">
      <h1 className="font-display text-3xl font-black mb-2">ประวัติการจอง</h1>
      <p className="text-on-surface-variant mb-8">จัดการรายการจองตั๋วเครื่องบินและโรงแรมของคุณ</p>
      
      <BookingsClient initialData={serializedBookings} />
    </div>
  );
}
