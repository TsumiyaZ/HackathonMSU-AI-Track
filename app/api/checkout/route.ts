import { NextResponse } from 'next/server';
import { readJSON, DATA } from '@/lib/json-db';
import { createFlightTicket, createFoodOrder, createHotelBooking } from '@/lib/bookings';
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
    const foodItems = trip.items.filter((i: any) => i.type === 'food');
    const hotelNights = Math.max((trip.days || 1) - 1, 0);

    const [allFlights, allHotels, allRestaurants] = await Promise.all([
      readJSON<any[]>(DATA.flights),
      readJSON<any[]>(DATA.hotels),
      readJSON<any[]>(DATA.restaurants),
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
        check_out: new Date(Date.now() + Math.max(hotelNights, 1) * 24 * 60 * 60 * 1000),
        guests: 2,
        total_price: item.price,
        status: 'CONFIRMED',
      });
      createdHotels.push(newBooking);
    }

    const createdFoods: any[] = [];
    for (const item of foodItems) {
      const foodData = item.data || {};
      let restaurantId = foodData.res_id || foodData.restaurant_id || foodData.id;
      if (!restaurantId) restaurantId = allRestaurants[0]?.res_id;
      if (!restaurantId) continue;

      const restaurant = allRestaurants.find((r: any) => r.res_id === restaurantId);
      const newOrder = await createFoodOrder({
        order_id: `fd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        restaurant_id: restaurantId,
        menu_items: restaurant?.cuisine ? [`${restaurant.cuisine} Signature Set`] : [item.title],
        total_price: item.price,
        status: 'PENDING',
        rider_name: null,
        created_at: new Date().toISOString(),
      });

      createdFoods.push({
        ...newOrder,
        restaurant_name: restaurant?.name || '',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking completed successfully',
      data: { flights: createdFlights, hotels: createdHotels, foods: createdFoods },
    });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
