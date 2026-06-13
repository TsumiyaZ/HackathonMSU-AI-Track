import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { trip } = await req.json();

    if (!trip || !trip.items) {
      return NextResponse.json({ error: 'Invalid trip data' }, { status: 400 });
    }

    const userId = 'u001'; // Mock user

    // Create dummy bookings for flights and hotels found in the trip
    const flightItems = trip.items.filter((i: any) => i.type === 'flight');
    const hotelItems = trip.items.filter((i: any) => i.type === 'hotel');

    const createdFlights = [];
    for (const item of flightItems) {
      const flightData = item.data || {};
      let flightId = flightData.flight_id || flightData.id;
      
      // Fallback if AI didn't provide a valid ID
      if (!flightId) {
        const anyFlight = await prisma.flight.findFirst();
        if (anyFlight) flightId = anyFlight.flight_id;
      }
      
      if (!flightId) continue;
      
      const newTicket = await prisma.flightTicket.create({
        data: {
          ticket_id: `ft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: userId,
          flight_id: flightId,
          seat: '14A', // Mock seat
          status: 'CONFIRMED'
        }
      });
      createdFlights.push(newTicket);
    }

    const createdHotels = [];
    for (const item of hotelItems) {
      const hotelData = item.data || {};
      let hotelId = hotelData.hotel_id || hotelData.id;

      // Fallback if AI didn't provide a valid ID
      if (!hotelId) {
        const anyHotel = await prisma.hotel.findFirst();
        if (anyHotel) hotelId = anyHotel.hotel_id;
      }

      if (!hotelId) continue;

      const newBooking = await prisma.hotelBooking.create({
        data: {
          booking_id: `hb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: userId,
          hotel_id: hotelId,
          check_in: new Date(),
          check_out: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Mock 3 days
          guests: 2,
          total_price: item.price,
          status: 'CONFIRMED'
        }
      });
      createdHotels.push(newBooking);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking completed successfully',
      data: { flights: createdFlights, hotels: createdHotels }
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
