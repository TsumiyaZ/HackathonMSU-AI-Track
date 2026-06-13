import { NextResponse } from 'next/server';
import { getWeatherForDestination } from '@/lib/weather';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('destination') || '';
  const weather = getWeatherForDestination(destination);
  return NextResponse.json({ success: true, weather });
}
