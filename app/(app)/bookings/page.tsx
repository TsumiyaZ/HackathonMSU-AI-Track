import prisma from "@/lib/prisma";
import { BookingsClient, BookingUIItem } from "./_components/BookingsClient";

export default async function BookingsPage() {
  let hotelBookings: any[] = [];
  try {
    hotelBookings = await prisma.hotelBooking.findMany({
      include: { hotel: true },
      orderBy: { check_in: "desc" }
    });
  } catch (err) {
    console.warn("⚠️ Database connection failed. Falling back to mock data.");
    hotelBookings = [
      {
        booking_id: "TRP-2026-0815",
        status: "CONFIRMED",
        total_price: 28300,
        check_in: new Date("2026-08-15"),
        check_out: new Date("2026-08-18"),
        hotel: { name: "Sri Panwa Phuket Luxury Pool Villa", location: "ภูเก็ต, ประเทศไทย" }
      },
      {
        booking_id: "TRP-2026-0910",
        status: "PENDING",
        total_price: 45000,
        check_in: new Date("2026-09-10"),
        check_out: new Date("2026-09-15"),
        hotel: { name: "Tokyo Inn", location: "โตเกียว, ญี่ปุ่น" }
      }
    ];
  }

  const bookings: BookingUIItem[] = hotelBookings.map(b => ({
    id: b.booking_id,
    title: `ทริป ${b.hotel.name}`,
    destination: b.hotel.location,
    date: `${new Date(b.check_in).toLocaleDateString('th-TH')} - ${new Date(b.check_out).toLocaleDateString('th-TH')}`,
    status: b.status, // e.g. CONFIRMED, PENDING, COMPLETED, CANCELLED
    price: b.total_price,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600" // default hotel image since DB doesn't have one
  }));

  return <BookingsClient initialBookings={bookings} />;
}
