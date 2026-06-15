import { readJSON, DATA } from "@/lib/json-db";
import { getSessionUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import BookingsClient from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/auth/login?redirect=/bookings");
  }

  const [allTickets, allBookings, allFoodOrders, flights, hotels, restaurants] = await Promise.all([
    readJSON<any[]>(DATA.flightTickets),
    readJSON<any[]>(DATA.hotelBookings),
    readJSON<any[]>(DATA.foodOrders),
    readJSON<any[]>(DATA.flights),
    readJSON<any[]>(DATA.hotels),
    readJSON<any[]>(DATA.restaurants),
  ]);

  const userTickets = allTickets.filter((ticket: any) => ticket.user_id === userId);
  const userBookings = allBookings.filter((booking: any) => booking.user_id === userId);
  const userFoodOrders = allFoodOrders.filter((order: any) => order.user_id === userId);

  const list = [
    ...userTickets.map((ticket: any) => {
      const flight = flights.find((item: any) => item.flight_id === ticket.flight_id) ?? {};
      return {
        id: ticket.ticket_id,
        type: "flight",
        title: `${flight.airline || ""} (${flight.origin || ""} → ${flight.destination || ""})`,
        subtitle: `${flight.origin || "-"} → ${flight.destination || "-"}`,
        date: flight.departure_time || "",
        price: flight.price || 0,
        status: ticket.status,
      };
    }),
    ...userBookings.map((booking: any) => {
      const hotel = hotels.find((item: any) => item.hotel_id === booking.hotel_id) ?? {};
      return {
        id: booking.booking_id,
        type: "hotel",
        title: hotel.name || "",
        subtitle: hotel.location || "Hotel booking",
        date: booking.check_in || "",
        price: booking.total_price,
        status: booking.status,
      };
    }),
    ...userFoodOrders.map((order: any) => {
      const restaurant = restaurants.find((item: any) => item.res_id === order.restaurant_id) ?? {};
      return {
        id: order.order_id,
        type: "food",
        title: restaurant.name || "Food Order",
        subtitle: [
          restaurant.cuisine || "Food",
          order.menu_items?.length
            ? `${order.menu_items.slice(0, 2).join(", ")}${order.menu_items.length > 2 ? ` +${order.menu_items.length - 2}` : ""}`
            : null,
        ]
          .filter(Boolean)
          .join(" • "),
        date: order.created_at || "",
        price: order.total_price || 0,
        status: order.status,
      };
    }),
  ];

  list.sort((a: any, b: any) => {
    const leftDate = a.date ? new Date(a.date).getTime() : 0;
    const rightDate = b.date ? new Date(b.date).getTime() : 0;
    return rightDate - leftDate;
  });

  const serializedBookings = list.map((booking: any) => ({
    ...booking,
    date: booking.date ? new Date(booking.date).toISOString() : "",
  }));

  return (
    <div className="max-w-6xl mx-auto w-full">
      <BookingsClient initialData={serializedBookings} />
    </div>
  );
}
