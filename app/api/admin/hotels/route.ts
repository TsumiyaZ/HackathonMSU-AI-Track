import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import prisma from '@/lib/prisma';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const hotels = await prisma.hotel.findMany();
  return NextResponse.json(hotels);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { hotel_id, name, location, rating, price_per_night, amenities } = body;

  try {
    const updated = await prisma.hotel.update({
      where: { hotel_id },
      data: {
        name,
        location,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        price_per_night: price_per_night !== undefined ? parseFloat(price_per_night) : undefined,
        amenities,
      },
    });
    return NextResponse.json({ success: true, hotel: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Hotel not found or validation error' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await prisma.hotel.delete({
      where: { hotel_id: id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  }
}
