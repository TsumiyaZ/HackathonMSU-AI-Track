import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const [hotels, flights, restaurants, users, bookings, tickets] = await Promise.all([
    prisma.hotel.findMany(),
    prisma.flight.findMany(),
    prisma.restaurant.findMany(),
    prisma.user.findMany(),
    prisma.hotelBooking.findMany(),
    prisma.flightTicket.findMany(),
  ]);

  const activeBookings = bookings.filter((b: any) => b.status !== 'CANCELLED');
  const revenue = activeBookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
  const totalLoyaltyPoints = users.reduce((sum: number, u: any) => sum + (u.loyalty_points || 0), 0);

  const roleBreakdown = [
    { name: 'MEMBER', value: users.filter((u: any) => u.role === 'MEMBER').length, color: '#3b82f6' },
    { name: 'VIP', value: users.filter((u: any) => u.role === 'VIP').length, color: '#a855f7' },
    { name: 'ADMIN', value: users.filter((u: any) => u.role === 'ADMIN').length, color: '#f59e0b' },
  ];

  const locationStats = Object.entries(
    hotels.reduce((acc: Record<string, number>, h: any) => {
      const loc = h.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const avgHotelPrice = hotels.length > 0
    ? Math.round(hotels.reduce((s: number, h: any) => s + (h.price_per_night || 0), 0) / hotels.length)
    : 0;

  const priceRanges = [
    { range: '≤ 1,000', min: 0, max: 1000 },
    { range: '1,001-2,000', min: 1001, max: 2000 },
    { range: '2,001-3,000', min: 2001, max: 3000 },
    { range: '3,001-5,000', min: 3001, max: 5000 },
    { range: '> 5,000', min: 5001, max: Infinity },
  ].map(r => ({
    ...r,
    count: hotels.filter((h: any) => h.price_per_night >= r.min && h.price_per_night <= r.max).length,
  }));

  const recentBookings = bookings
    .sort((a: any, b: any) => new Date(b.check_in || 0).getTime() - new Date(a.check_in || 0).getTime())
    .slice(0, 10)
    .map((b: any) => ({
      id: b.booking_id,
      hotel_id: b.hotel_id,
      user_id: b.user_id,
      total: b.total_price,
      status: b.status,
      check_in: b.check_in,
      nights: b.check_out && b.check_in
        ? Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000)
        : 0,
    }));

  return NextResponse.json({
    hotels: hotels.length,
    flights: flights.length,
    restaurants: restaurants.length,
    users: users.length,
    bookings: bookings.length,
    tickets: tickets.length,
    totalItems: hotels.length + flights.length + restaurants.length,
    revenue,
    totalRevenue,
    totalLoyaltyPoints,
    avgHotelPrice,
    roleBreakdown,
    locationStats,
    priceRanges,
    recentBookings,
  });
}
