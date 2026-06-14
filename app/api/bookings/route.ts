import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const hotelBookings = await prisma.hotelBooking.findMany({
      where: { user_id: userId },
      include: { hotel: true },
      orderBy: { check_in: 'desc' }
    });

    const flightTickets = await prisma.flightTicket.findMany({
      where: { user_id: userId },
      include: { flight: true },
      orderBy: { flight: { departure_time: 'desc' } }
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
