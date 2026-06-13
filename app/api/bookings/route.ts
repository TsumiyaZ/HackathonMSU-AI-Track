import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const hotelBookings = await prisma.hotelBooking.findMany({
      include: { hotel: true },
      orderBy: { check_in: 'desc' }
    });

    const flightTickets = await prisma.flightTicket.findMany({
      include: { flight: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        hotelBookings: hotelBookings.map(b => ({
          id: b.booking_id,
          type: 'hotel',
          hotelName: b.hotel.name,
          location: b.hotel.location,
          checkIn: b.check_in,
          checkOut: b.check_out,
          guests: b.guests,
          totalPrice: b.total_price,
          status: b.status
        })),
        flightTickets: flightTickets.map(t => ({
          id: t.ticket_id,
          type: 'flight',
          airline: t.flight.airline,
          origin: t.flight.origin,
          destination: t.flight.destination,
          departure: t.flight.departure_time,
          seat: t.seat,
          status: t.status,
          price: t.flight.price
        }))
      }
    });
  } catch (error: any) {
    console.error('Bookings API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
