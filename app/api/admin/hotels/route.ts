import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getSessionUser } from '@/lib/session';

const DATA_ROOT = path.join(process.cwd(), 'data');
const HOTELS_PATH = path.join(DATA_ROOT, 'hotel', 'hotels.json');

async function readHotels() {
  const raw = await fs.readFile(HOTELS_PATH, 'utf8');
  return JSON.parse(raw);
}

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const hotels = await readHotels();
  return NextResponse.json(hotels);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const hotels = await readHotels();
  const idx = hotels.findIndex((h: any) => h.hotel_id === body.hotel_id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  hotels[idx] = { ...hotels[idx], ...body };
  await fs.writeFile(HOTELS_PATH, JSON.stringify(hotels, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const hotels = await readHotels();
  const filtered = hotels.filter((h: any) => h.hotel_id !== id);
  if (filtered.length === hotels.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await fs.writeFile(HOTELS_PATH, JSON.stringify(filtered, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}
