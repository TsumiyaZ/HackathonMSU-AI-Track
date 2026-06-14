import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DATA_ROOT = path.join(process.cwd(), 'data');

async function readJson<T>(relPath: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_ROOT, relPath), 'utf8');
  return JSON.parse(raw) as T;
}

const DESTINATIONS: Record<string, { codes: string[]; destAirports: string[] }> = {
  'กรุงเทพ':    { codes: ['บีเคเค', 'Bangkok', 'กรุงเทพ', 'กทม'], destAirports: ['BKK', 'DMK'] },
  'ภูเก็ต':      { codes: ['Phuket', 'ภูเก็ต', 'ภูเก็'], destAirports: ['HKT'] },
  'เชียงใหม่':   { codes: ['Chiang Mai', 'เชียงใหม่', 'เชียง'], destAirports: ['CNX'] },
  'กระบี่':      { codes: ['Krabi', 'กระบี่'], destAirports: ['KBV'] },
  'พัทยา':      { codes: ['Pattaya', 'พัทยา'], destAirports: [] },
  'เกาะสมุย':     { codes: ['Koh Samui', 'สมุย', 'เกาะสมุย'], destAirports: ['USM'] },
  'โตเกียว':     { codes: ['Tokyo', 'โตเกียว'], destAirports: ['NRT', 'HND'] },
};

function extractDestination(prompt: string): { name: string; destAirports: string[] } | null {
  const lower = prompt.toLowerCase();
  for (const [name, info] of Object.entries(DESTINATIONS)) {
    for (const code of info.codes) {
      if (lower.includes(code.toLowerCase())) return { name, destAirports: info.destAirports };
    }
  }
  return null;
}

function extractDays(prompt: string): number {
  const m = prompt.match(/(\d+)\s*วัน/);
  return m ? parseInt(m[1]) : 3;
}

function extractBudget(prompt: string): number {
  const m = prompt.match(/งบ\s*(\d[\d,]*)/);
  if (m) return parseInt(m[1].replace(/,/g, ''));
  const m2 = prompt.match(/(\d[\d,]*)\s*บาท/);
  if (m2) return parseInt(m2[1].replace(/,/g, ''));
  return 15000;
}

function formatTime(departureTime: string): string {
  const d = new Date(departureTime);
  return `0${d.getUTCHours()}`.slice(-2) + ':00';
}

function formatDateThai(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear() + 543}`;
}

function toTitleThai(text: string): string {
  return text;
}

const ACTIVITY_TEMPLATES: Record<string, { title: string; desc: string; price: number }[]> = {
  'ภูเก็ต': [
    { title: 'เที่ยววัดพระใหญ่', desc: 'ชมวิวเมืองภูเก็ตจากยอดเขา', price: 0 },
    { title: 'นั่งเรือเที่ยวอ่าวพังงา', desc: 'ล่องเรือชมเขาหินปูนและถ้ำทะเล', price: 800 },
    { title: 'เดินถนนคนเดินภูเก็ต', desc: 'ชิมอาหารทะเลสดและของฝาก', price: 500 },
  ],
  'เชียงใหม่': [
    { title: 'เที่ยวดอยสุเทพ', desc: 'ขึ้นดอยชมวัดพระธาตุสุเทพและวิวเมือง', price: 0 },
    { title: 'เดินถนนนิมมานเหมินท์', desc: 'เดินเล่นคาเฟ่สวยและช้อปปิ้ง', price: 300 },
    { title: 'นั่งกระเช้าดอยอินทนนท์', desc: 'ชมธรรมชาติและจุดสูงสุดของประเทศไทย', price: 600 },
  ],
  'กรุงเทพ': [
    { title: 'ชมวัดพระแก้วและพระบรมมหาราชวัง', desc: 'เที่ยวชมสถาปัตยกรรมไทย', price: 500 },
    { title: 'เดินเล่นย่านเยาวราช', desc: 'ชิมอาหารจีนและสตรีทฟู้ด', price: 300 },
    { title: 'นั่งเรือคลองแสนแสบ', desc: 'ล่องเรือชมชีวิตสองฝั่งคลอง', price: 100 },
  ],
  'กระบี่': [
    { title: 'เที่ยวหาดอ่าวนาง', desc: 'พักผ่อนและเล่นน้ำทะเลใส', price: 0 },
    { title: 'นั่งเรือไปเกาะพีพี', desc: 'ดำน้ำตื้นและชมธรรมชาติ', price: 1200 },
    { title: 'ปั่นจักรยานชมเมืองกระบี่', desc: 'ชมวิวภูเขาและแหล่งท่องเที่ยว', price: 300 },
  ],
  'โตเกียว': [
    { title: 'เที่ยววัดเซ็นโซจิ', desc: 'วัดเก่าแก่ย่านอาซากุสะ', price: 0 },
    { title: 'ชมชิบูย่าและฮาราจูกุ', desc: 'แหล่งช้อปปิ้งแฟชั่นและสตรีทฟู้ด', price: 500 },
  ],
};

const DEFAULT_ACTIVITIES = [
  { title: 'เที่ยวชมเมือง', desc: 'สำรวจสถานที่ท่องเที่ยวสำคัญ', price: 300 },
  { title: 'ชิมร้านอาหารท้องถิ่น', desc: 'ลิ้มลองอาหารพื้นเมือง', price: 500 },
];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function isTravelRequest(prompt: string): boolean {
  const travelKeywords = [
    'ไป', 'เที่ยว', 'trip', 'ทริป', 'travel', 'journey',
    'งบ', 'budget', 'วัน', 'day', 'คืน',
    'พัก', 'hotel', 'โรงแรม', 'ที่พัก', 'stay',
    'บิน', 'flight', 'เครื่องบิน',
    'อาหาร', 'restaurant', 'ร้าน', 'กิน', 'ชิม',
    'จังหวัด', 'ประเทศ', 'city', 'destination', 'town',
    'ทะเล', 'ภูเขา', 'ธรรมชาติ', 'วัด', 'หาด',
    'แพลน', 'plan', ' itinerary', ',',
  ];
  const lower = prompt.toLowerCase();
  return travelKeywords.some(kw => lower.includes(kw));
}

export async function POST(req: Request) {
  try {
    const { prompt, preferences } = await req.json();

    // 0. ตรวจสอบว่าเป็นคำขอท่องเที่ยวหรือไม่
    if (!isTravelRequest(prompt)) {
      return NextResponse.json({
        success: true,
        needsPrompt: true,
        message: 'สวัสดีครับ! 😊 ยินดีต้อนรับสู่ AI Trip Architect!\n\nกรุณาบอกความต้องการของคุณ เช่น:\n• "ไปภูเก็ต 3 วัน งบ 15,000 บาท"\n• "เที่ยวเชียงใหม่ งบ 8,000 สายคาเฟ่"\n• "โตเกียว 5 วัน ตะลุยชิมอาหาร"'
      });
    }

    // 1. Parse prompt
    const dest = extractDestination(prompt);
    const days = extractDays(prompt);
    const budget = extractBudget(prompt);
    const destName = dest?.name || 'ภูเก็ต';
    const destAirports = dest?.destAirports || ['HKT'];

    // 2. Load data in parallel
    const [allHotels, allFlights, allRestaurants] = await Promise.all([
      readJson<any[]>('hotel/hotels.json'),
      readJson<any[]>('travel/flights.json'),
      readJson<any[]>('food/restaurants.json'),
    ]);

    // 3. Filter by destination
    const destLower = destName.toLowerCase();
    const hotels = allHotels.filter(h => h.location?.toLowerCase().includes(destLower));
    const flightsTo = allFlights.filter(f => destAirports.includes(f.destination));
    const flightsFrom = allFlights.filter(f => destAirports.includes(f.origin));
    const restaurants = [...allRestaurants].sort((a, b) => b.rating - a.rating);

    // 4. Select best items
    const selectedFlight = flightsTo.sort((a, b) => a.price - b.price)[0] || flightsTo[0];
    const budgetPerNight = budget / days;
    const selectedHotel = hotels
      .filter(h => h.price_per_night <= budgetPerNight * 1.5)
      .sort((a, b) => b.rating - a.rating)[0] || hotels[0] || allHotels[0];
    const selectedRestaurants = pick(restaurants, Math.min(days + 1, 3));
    const activities = destName && ACTIVITY_TEMPLATES[destName]
      ? pick(ACTIVITY_TEMPLATES[destName], Math.min(days, 3))
      : pick(DEFAULT_ACTIVITIES, 2);

    // 5. Build itinerary items
    const items: any[] = [];
    let totalPrice = 0;

    if (selectedFlight) {
      items.push({
        id: `flight-${Date.now()}`,
        type: 'flight',
        time: `วันที่ 1 - ${formatTime(selectedFlight.departure_time)}`,
        title: `${selectedFlight.airline} - บินไป${destName}`,
        description: `ออกจาก ${selectedFlight.origin} ไป ${selectedFlight.destination} เวลา ${formatTime(selectedFlight.departure_time)}`,
        price: selectedFlight.price,
        data: { flight_id: selectedFlight.flight_id },
      });
      totalPrice += selectedFlight.price;
    }

    if (selectedHotel) {
      const hotelTotal = selectedHotel.price_per_night * days;
      items.push({
        id: `hotel-${Date.now()}`,
        type: 'hotel',
        time: `วันที่ 1 - ${days} คืน`,
        title: `${selectedHotel.name}`,
        description: `ที่พักระดับ ${selectedHotel.rating} ดาว ${selectedHotel.amenities?.slice(0, 3).join(', ') || ''}`,
        price: hotelTotal,
        data: { hotel_id: selectedHotel.hotel_id },
      });
      totalPrice += hotelTotal;
    }

    selectedRestaurants.forEach((r, i) => {
      const mealPrice = r.rating >= 4.5 ? 800 : r.rating >= 4 ? 500 : 350;
      const dayNum = Math.min(i + 1, days);
      items.push({
        id: `food-${Date.now()}-${i}`,
        type: 'food',
        time: `วันที่ ${dayNum} - เที่ยง`,
        title: `อาหาร${r.cuisine}ที่ ${r.name}`,
        description: `ร้าน${r.cuisine} คะแนน ${r.rating}/5`,
        price: mealPrice,
        data: { res_id: r.res_id },
      });
      totalPrice += mealPrice;
    });

    activities.forEach((a, i) => {
      const dayNum = Math.min(i + 1, days);
      items.push({
        id: `act-${Date.now()}-${i}`,
        type: 'activity',
        time: `วันที่ ${dayNum} - บ่าย`,
        title: a.title,
        description: a.desc,
        price: a.price,
        data: {},
      });
      totalPrice += a.price;
    });

    // 6. Try Gemini for sentiment summary (fast, 5s timeout)
    let sentimentSummary = `ทริป${destName} ${days}วัน ${budget.toLocaleString()}บาท เหมาะสำหรับผู้ที่ต้องการพักผ่อน`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const aiResult = await Promise.race([
          model.generateContent(
            `เขียนสรุปสั้นๆ ภาษาไทย 2-3 ประโยค ว่า "ทริป${destName} ${days}วัน งบ${budget}บาท" น่าสนใจยังไง ` +
            `(โรงแรม: ${selectedHotel?.name || '-'}, เที่ยวบิน: ${selectedFlight?.airline || '-'})`
          ),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
        ]);
        sentimentSummary = aiResult.response.text().trim();
      } catch { }
    }

    const itinerary = {
      id: `trp-${Date.now()}`,
      destination: destName,
      days,
      budget,
      totalPrice,
      items,
      sentimentSummary,
    };

    return NextResponse.json({ success: true, itinerary });
  } catch (error: any) {
    console.error('AI Planning Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'AI Error',
      fallback: {
        id: 'trp-fallback',
        destination: 'ภูเก็ต (แผนสำรอง)',
        days: 3,
        totalPrice: 15000,
        items: [],
        sentimentSummary: 'ระบบขัดข้องชั่วคราว นี่คือแผนการเดินทางสำรอง'
      }
    }, { status: 500 });
  }
}
