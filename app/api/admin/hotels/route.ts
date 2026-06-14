import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { readJSON, writeJSON, DATA } from '@/lib/json-db';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const hotels = await readJSON<any[]>(DATA.hotels);
  return NextResponse.json(hotels);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { hotel_id, name, location, rating, price_per_night, amenities } = body;

  const hotels = await readJSON<any[]>(DATA.hotels);
  const idx = hotels.findIndex((h: any) => h.hotel_id === hotel_id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  }

  if (name !== undefined) hotels[idx].name = name;
  if (location !== undefined) hotels[idx].location = location;
  if (rating !== undefined) hotels[idx].rating = parseFloat(rating);
  if (price_per_night !== undefined) hotels[idx].price_per_night = parseFloat(price_per_night);
  if (amenities !== undefined) hotels[idx].amenities = amenities;

  await writeJSON(DATA.hotels, hotels);
  return NextResponse.json({ success: true, hotel: hotels[idx] });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const hotels = await readJSON<any[]>(DATA.hotels);
  const idx = hotels.findIndex((h: any) => h.hotel_id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  }

  hotels.splice(idx, 1);
  await writeJSON(DATA.hotels, hotels);
  return NextResponse.json({ success: true });
}
