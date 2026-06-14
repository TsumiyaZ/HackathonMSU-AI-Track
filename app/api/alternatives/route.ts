import { NextResponse } from 'next/server';
import { readJSON, DATA } from '@/lib/json-db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 });
    }

    let alternatives = [];

    if (type === 'hotel') {
      const hotels = await readJSON<any[]>(DATA.hotels);
      const sorted = hotels.sort((a: any, b: any) => b.rating - a.rating).slice(0, 5);
      alternatives = sorted.map((h: any) => ({
        id: `alt-${h.hotel_id}`,
        type: 'hotel',
        title: h.name,
        description: `พักหรูที่ ${h.location} • เรตติ้ง ${h.rating} ดาว`,
        price: h.price_per_night,
        data: h,
      }));
    } else if (type === 'flight') {
      const flights = await readJSON<any[]>(DATA.flights);
      alternatives = flights.slice(0, 5).map((f: any) => ({
        id: `alt-${f.flight_id}`,
        type: 'flight',
        title: `บินสู่ ${f.destination} (${f.airline})`,
        description: `เที่ยวบินจาก ${f.origin}`,
        price: f.price,
        data: f,
      }));
    } else if (type === 'food') {
      const food = await readJSON<any[]>(DATA.restaurants);
      const sorted = food.sort((a: any, b: any) => b.rating - a.rating).slice(0, 5);
      alternatives = sorted.map((r: any) => ({
        id: `alt-${r.res_id}`,
        type: 'food',
        title: `มื้ออร่อยที่ ${r.name}`,
        description: `อาหารแนว ${r.cuisine} • เรตติ้ง ${r.rating} ดาว`,
        price: Math.floor(Math.random() * 500) + 200,
        data: r,
      }));
    } else {
       // Activity mockup
       alternatives = [
         { id: 'alt-act-1', type: 'activity', title: 'เดินเล่นย่านเมืองเก่า', description: 'ชมสถาปัตยกรรมคลาสสิก', price: 0, data: {} },
         { id: 'alt-act-2', type: 'activity', title: 'สปาและนวดแผนไทย', description: 'ผ่อนคลายความเมื่อยล้า', price: 1200, data: {} },
         { id: 'alt-act-3', type: 'activity', title: 'ทัวร์ล่องเรือ', description: 'ชมวิวทะเลและพระอาทิตย์ตก', price: 2500, data: {} },
       ];
    }

    return NextResponse.json({ success: true, alternatives });
  } catch (error: any) {
    console.error('Alternatives Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
