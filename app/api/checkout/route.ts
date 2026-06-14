import { NextResponse } from 'next/server';
import { readJSON, DATA } from '@/lib/json-db';
import { createFlightTicket, createHotelBooking } from '@/lib/bookings';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { trip } = await req.json();

    if (!trip || !trip.items) {
      return NextResponse.json({ error: 'Invalid trip data' }, { status: 400 });
    }

    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flightItems = trip.items.filter((i: any) => i.type === 'flight');
    const hotelItems = trip.items.filter((i: any) => i.type === 'hotel');

    const [allFlights, allHotels] = await Promise.all([
      readJSON<any[]>(DATA.flights),
      readJSON<any[]>(DATA.hotels),
    ]);

    const createdFlights: any[] = [];
    for (const item of flightItems) {
      const flightData = item.data || {};
      let flightId = flightData.flight_id || flightData.id;
      if (!flightId) flightId = allFlights[0]?.flight_id;
      if (!flightId) continue;

      const newTicket = await createFlightTicket({
        ticket_id: `ft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        flight_id: flightId,
        seat: '14A',
        status: 'CONFIRMED',
      });
      createdFlights.push(newTicket);
    }

    const createdHotels: any[] = [];
    for (const item of hotelItems) {
      const hotelData = item.data || {};
      let hotelId = hotelData.hotel_id || hotelData.id;
      if (!hotelId) hotelId = allHotels[0]?.hotel_id;
      if (!hotelId) continue;

      const newBooking = await createHotelBooking({
        booking_id: `hb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        hotel_id: hotelId,
        check_in: new Date(),
        check_out: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        guests: 2,
        total_price: item.price,
        status: 'CONFIRMED',
      });
      createdHotels.push(newBooking);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking completed successfully',
      data: { flights: createdFlights, hotels: createdHotels },
    });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
