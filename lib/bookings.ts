import { readJSON, writeJSON, DATA } from "./json-db";
import type { Hotel, HotelBooking, Review } from "./types";

export interface RawHotelBooking {
  booking_id: string;
  user_id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
}

export interface RawFlightTicket {
  ticket_id: string;
  user_id: string;
  flight_id: string;
  seat: string;
  status: string;
}

export interface RawFlight {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  price: number;
}

export interface RawHotel {
  hotel_id: string;
  name: string;
  location: string;
  rating: number;
  price_per_night: number;
  amenities: string[];
}

export interface RawRestaurant {
  res_id: string;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time_min: number;
}

export interface RawFoodOrder {
  order_id: string;
  user_id: string;
  restaurant_id: string;
  menu_items: string[];
  total_price: number;
  status: string;
  rider_name: string | null;
  created_at?: string;
}

// ── Hotel Bookings ──

export async function getAllHotelBookings(): Promise<RawHotelBooking[]> {
  return readJSON<RawHotelBooking[]>(DATA.hotelBookings);
}

export async function getUserHotelBookings(
  userId: string,
): Promise<RawHotelBooking[]> {
  const all = await getAllHotelBookings();
  return all.filter((b) => b.user_id === userId);
}

export async function getHotelBookingById(
  bookingId: string,
): Promise<(RawHotelBooking & { hotel: RawHotel; user: any }) | null> {
  const bookings = await getAllHotelBookings();
  const booking = bookings.find((b) => b.booking_id === bookingId);
  if (!booking) return null;
  const [hotels, users] = await Promise.all([
    readJSON<RawHotel[]>(DATA.hotels),
    readJSON<any[]>(DATA.users),
  ]);
  const hotel = hotels.find((h) => h.hotel_id === booking.hotel_id) ?? ({} as RawHotel);
  const user = users.find((u: any) => u.user_id === booking.user_id) ?? {};
  return { ...booking, hotel, user };
}

export async function createHotelBooking(data: {
  booking_id: string;
  user_id: string;
  hotel_id: string;
  check_in: Date;
  check_out: Date;
  guests: number;
  total_price: number;
  status: string;
}): Promise<RawHotelBooking> {
  const bookings = await getAllHotelBookings();
  const newBooking: RawHotelBooking = {
    booking_id: data.booking_id,
    user_id: data.user_id,
    hotel_id: data.hotel_id,
    check_in: data.check_in.toISOString().split("T")[0],
    check_out: data.check_out.toISOString().split("T")[0],
    guests: data.guests,
    total_price: data.total_price,
    status: data.status,
  };
  bookings.push(newBooking);
  await writeJSON(DATA.hotelBookings, bookings);
  return newBooking;
}

// ── Flight Tickets ──

export async function getAllFlightTickets(): Promise<RawFlightTicket[]> {
  return readJSON<RawFlightTicket[]>(DATA.flightTickets);
}

export async function getUserFlightTickets(
  userId: string,
): Promise<RawFlightTicket[]> {
  const all = await getAllFlightTickets();
  return all.filter((t) => t.user_id === userId);
}

export async function getFlightTicketById(
  ticketId: string,
): Promise<(RawFlightTicket & { flight: RawFlight; user: any }) | null> {
  const tickets = await getAllFlightTickets();
  const ticket = tickets.find((t) => t.ticket_id === ticketId);
  if (!ticket) return null;
  const [flights, users] = await Promise.all([
    readJSON<RawFlight[]>(DATA.flights),
    readJSON<any[]>(DATA.users),
  ]);
  const flight = flights.find((f) => f.flight_id === ticket.flight_id) ?? ({} as RawFlight);
  const user = users.find((u: any) => u.user_id === ticket.user_id) ?? {};
  return { ...ticket, flight, user };
}

export async function createFlightTicket(data: {
  ticket_id: string;
  user_id: string;
  flight_id: string;
  seat: string;
  status: string;
}): Promise<RawFlightTicket> {
  const tickets = await getAllFlightTickets();
  const newTicket: RawFlightTicket = {
    ticket_id: data.ticket_id,
    user_id: data.user_id,
    flight_id: data.flight_id,
    seat: data.seat,
    status: data.status,
  };
  tickets.push(newTicket);
  await writeJSON(DATA.flightTickets, tickets);
  return newTicket;
}

// —— Food Orders ——

export async function getAllFoodOrders(): Promise<RawFoodOrder[]> {
  return readJSON<RawFoodOrder[]>(DATA.foodOrders);
}

export async function getUserFoodOrders(
  userId: string,
): Promise<RawFoodOrder[]> {
  const all = await getAllFoodOrders();
  return all.filter((o) => o.user_id === userId);
}

export async function getFoodOrderById(
  orderId: string,
): Promise<(RawFoodOrder & { restaurant: RawRestaurant; user: any }) | null> {
  const orders = await getAllFoodOrders();
  const order = orders.find((o) => o.order_id === orderId);
  if (!order) return null;

  const [restaurants, users] = await Promise.all([
    readJSON<RawRestaurant[]>(DATA.restaurants),
    readJSON<any[]>(DATA.users),
  ]);

  const restaurant = restaurants.find((r) => r.res_id === order.restaurant_id) ?? ({} as RawRestaurant);
  const user = users.find((u: any) => u.user_id === order.user_id) ?? {};
  return { ...order, restaurant, user };
}

export async function createFoodOrder(data: {
  order_id: string;
  user_id: string;
  restaurant_id: string;
  menu_items: string[];
  total_price: number;
  status: string;
  rider_name?: string | null;
  created_at?: string;
}): Promise<RawFoodOrder> {
  const orders = await getAllFoodOrders();
  const newOrder: RawFoodOrder = {
    order_id: data.order_id,
    user_id: data.user_id,
    restaurant_id: data.restaurant_id,
    menu_items: data.menu_items,
    total_price: data.total_price,
    status: data.status,
    rider_name: data.rider_name ?? null,
    created_at: data.created_at ?? new Date().toISOString(),
  };
  orders.push(newOrder);
  await writeJSON(DATA.foodOrders, orders);
  return newOrder;
}
