import { NextResponse } from 'next/server';
import { readJSON, DATA } from '@/lib/json-db';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [allBookings, allTickets, allFoodOrders, hotels, flights, restaurants] = await Promise.all([
      readJSON<any[]>(DATA.hotelBookings),
      readJSON<any[]>(DATA.flightTickets),
      readJSON<any[]>(DATA.foodOrders),
      readJSON<any[]>(DATA.hotels),
      readJSON<any[]>(DATA.flights),
      readJSON<any[]>(DATA.restaurants),
    ]);

    const userBookings = allBookings.filter((b: any) => b.user_id === userId);
    const userTickets = allTickets.filter((t: any) => t.user_id === userId);
    const userFoodOrders = allFoodOrders.filter((o: any) => o.user_id === userId);

    return NextResponse.json({
      success: true,
      data: {
        hotelBookings: userBookings.map((b: any) => {
          const hotel = hotels.find((h: any) => h.hotel_id === b.hotel_id) ?? {};
          return {
            id: b.booking_id,
            type: 'hotel',
            hotelName: hotel.name || '',
            location: hotel.location || '',
            checkIn: b.check_in,
            checkOut: b.check_out,
            guests: b.guests,
            totalPrice: b.total_price,
            status: b.status,
          };
        }),
        flightTickets: userTickets.map((t: any) => {
          const flight = flights.find((f: any) => f.flight_id === t.flight_id) ?? {};
          return {
            id: t.ticket_id,
            type: 'flight',
            airline: flight.airline || '',
            origin: flight.origin || '',
            destination: flight.destination || '',
            departure: flight.departure_time || '',
            seat: t.seat,
            status: t.status,
            price: flight.price || 0,
          };
        }),
        foodOrders: userFoodOrders.map((o: any) => {
          const restaurant = restaurants.find((r: any) => r.res_id === o.restaurant_id) ?? {};
          return {
            id: o.order_id,
            type: 'food',
            restaurantName: restaurant.name || '',
            cuisine: restaurant.cuisine || '',
            createdAt: o.created_at || '',
            status: o.status,
            price: o.total_price || 0,
            menuItems: o.menu_items || [],
          };
        }),
      },
    });
  } catch (error: any) {
    console.error('Bookings API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
