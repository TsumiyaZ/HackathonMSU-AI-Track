import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const readJson = (filePath: string) => {
  const fullPath = path.join(__dirname, '../data', filePath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  }
  return [];
};

async function main() {
  console.log('Starting DB Seed...');

  // 1. User
  console.log('Seeding Users...');
  const users = readJson('user/users.json');
  if (users.length > 0) {
    await prisma.user.createMany({ data: users, skipDuplicates: true });
  }

  // 2. Location
  console.log('Seeding Locations...');
  const locations = readJson('common/locations.json');
  if (locations.length > 0) {
    await prisma.location.createMany({ data: locations, skipDuplicates: true });
  }

  // 3. Flight
  console.log('Seeding Flights...');
  const flights = readJson('travel/flights.json');
  if (flights.length > 0) {
    await prisma.flight.createMany({ data: flights, skipDuplicates: true });
  }

  // 4. Hotel
  console.log('Seeding Hotels...');
  const hotels = readJson('hotel/hotels.json');
  if (hotels.length > 0) {
    await prisma.hotel.createMany({ data: hotels, skipDuplicates: true });
  }

  // 5. Restaurant
  console.log('Seeding Restaurants...');
  const restaurants = readJson('food/restaurants.json');
  if (restaurants.length > 0) {
    await prisma.restaurant.createMany({ data: restaurants, skipDuplicates: true });
  }

  // 6. FlightTicket
  console.log('Seeding FlightTickets...');
  const flightTickets = readJson('travel/flight_tickets.json');
  if (flightTickets.length > 0) {
    await prisma.flightTicket.createMany({ data: flightTickets, skipDuplicates: true });
  }

  // 7. HotelBooking
  console.log('Seeding HotelBookings...');
  const hotelBookings = readJson('hotel/hotel_bookings.json');
  if (hotelBookings.length > 0) {
    const formattedBookings = hotelBookings.map((b: any) => ({
      ...b,
      check_in: new Date(b.check_in),
      check_out: new Date(b.check_out)
    }));
    await prisma.hotelBooking.createMany({ data: formattedBookings, skipDuplicates: true });
  }

  // 8. FoodOrder
  console.log('Seeding FoodOrders...');
  const foodOrders = readJson('food/food_orders.json');
  if (foodOrders.length > 0) {
    await prisma.foodOrder.createMany({ data: foodOrders, skipDuplicates: true });
  }

  // 9. Review
  console.log('Seeding Reviews...');
  const reviews = readJson('common/reviews.json');
  if (reviews.length > 0) {
    await prisma.review.createMany({ data: reviews, skipDuplicates: true });
  }

  // 10. Notification
  console.log('Seeding Notifications...');
  const notifications = readJson('common/notifications.json');
  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
  }

  // 11. Chat
  console.log('Seeding Chats...');
  const chats = readJson('common/chats.json');
  if (chats.length > 0) {
    await prisma.chat.createMany({ data: chats, skipDuplicates: true });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
