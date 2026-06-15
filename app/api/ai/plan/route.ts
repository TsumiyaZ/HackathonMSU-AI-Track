import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DATA_ROOT = path.join(process.cwd(), "data");

async function readJson<T>(relPath: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_ROOT, relPath), "utf8");
  return JSON.parse(raw) as T;
}

const DESTINATIONS: Record<string, { codes: string[]; destAirports: string[] }> = {
  กรุงเทพ: { codes: ["BKK", "Bangkok", "กรุงเทพ", "กรุงเทพฯ", "กทม"], destAirports: ["BKK", "DMK"] },
  ภูเก็ต: { codes: ["Phuket", "ภูเก็ต"], destAirports: ["HKT"] },
  เชียงใหม่: { codes: ["Chiang Mai", "เชียงใหม่", "เชียง"], destAirports: ["CNX"] },
  กระบี่: { codes: ["Krabi", "กระบี่"], destAirports: ["KBV"] },
  พัทยา: { codes: ["Pattaya", "พัทยา"], destAirports: [] },
  เกาะสมุย: { codes: ["Koh Samui", "Samui", "สมุย", "เกาะสมุย"], destAirports: ["USM"] },
  โตเกียว: { codes: ["Tokyo", "โตเกียว"], destAirports: ["NRT", "HND"] },
};

type ActivityTemplate = {
  desc: string;
  price: number;
  title: string;
};

type TripMeta = {
  budget?: string;
  checkIn?: string;
  checkOut?: string;
  days?: number;
  destination?: string;
  theme?: string;
};

const ACTIVITY_TEMPLATES: Record<string, ActivityTemplate[]> = {
  ภูเก็ต: [
    { title: "เที่ยววัดพระใหญ่", desc: "ชมวิวเมืองภูเก็ตจากยอดเขา", price: 0 },
    { title: "นั่งเรือเที่ยวอ่าวพังงา", desc: "ล่องเรือชมเขาหินปูนและถ้ำทะเล", price: 800 },
    { title: "เดินถนนคนเดินภูเก็ต", desc: "ชิมอาหารทะเลสดและของฝาก", price: 500 },
  ],
  เชียงใหม่: [
    { title: "เที่ยวดอยสุเทพ", desc: "ขึ้นดอยชมวัดพระธาตุดอยสุเทพและวิวเมือง", price: 0 },
    { title: "เดินเล่นย่านนิมมานเหมินทร์", desc: "เดินเล่นคาเฟ่สวยและช้อปปิ้ง", price: 300 },
    { title: "นั่งกระเช้าดอยอินทนนท์", desc: "ชมธรรมชาติและจุดสูงสุดของประเทศไทย", price: 600 },
  ],
  กรุงเทพ: [
    { title: "ชมวัดพระแก้วและพระบรมมหาราชวัง", desc: "เที่ยวชมสถาปัตยกรรมไทย", price: 500 },
    { title: "เดินเล่นย่านเยาวราช", desc: "ชิมอาหารจีนและสตรีทฟู้ด", price: 300 },
    { title: "นั่งเรือคลองแสนแสบ", desc: "ล่องเรือชมชีวิตสองฝั่งคลอง", price: 100 },
  ],
  กระบี่: [
    { title: "เที่ยวหาดอ่าวนาง", desc: "พักผ่อนและเล่นน้ำทะเลใส", price: 0 },
    { title: "นั่งเรือไปเกาะพีพี", desc: "ดำน้ำตื้นและชมธรรมชาติ", price: 1200 },
    { title: "ปั่นจักรยานชมเมืองกระบี่", desc: "ชมวิวภูเขาและแหล่งท่องเที่ยว", price: 300 },
  ],
  โตเกียว: [
    { title: "เที่ยววัดเซ็นโซจิ", desc: "วัดเก่าแก่ย่านอาซากุสะ", price: 0 },
    { title: "ชมชิบูย่าและฮาราจูกุ", desc: "แหล่งช้อปปิ้งแฟชั่นและสตรีทฟู้ด", price: 500 },
  ],
};

const DEFAULT_ACTIVITIES: ActivityTemplate[] = [
  { title: "เที่ยวชมเมือง", desc: "สำรวจสถานที่ท่องเที่ยวสำคัญ", price: 300 },
  { title: "ชิมร้านอาหารท้องถิ่น", desc: "ลิ้มลองอาหารพื้นเมือง", price: 500 },
];

function extractDestination(prompt: string): { destAirports: string[]; name: string } | null {
  const lower = prompt.toLowerCase();
  for (const [name, info] of Object.entries(DESTINATIONS)) {
    if (info.codes.some((code) => lower.includes(code.toLowerCase()))) {
      return { name, destAirports: info.destAirports };
    }
  }
  return null;
}

function extractDays(prompt: string): number {
  const patterns = [
    /(\d+)\s*วัน/u,
    /(\d+)\s*days?/i,
    /duration\s*[:=-]?\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (Number.isFinite(value) && value > 0) {
      return Math.min(value, 14);
    }
  }

  return 3;
}

function extractBudget(prompt: string): number {
  const thaiBudget = prompt.match(/งบ\s*(\d[\d,]*)/u);
  if (thaiBudget) return Number.parseInt(thaiBudget[1].replace(/,/g, ""), 10);

  const bahtBudget = prompt.match(/(\d[\d,]*)\s*บาท/u);
  if (bahtBudget) return Number.parseInt(bahtBudget[1].replace(/,/g, ""), 10);

  const englishBudget = prompt.match(/budget\s*(?:is|around|about|:)?\s*(\d[\d,]*)/i);
  if (englishBudget) return Number.parseInt(englishBudget[1].replace(/,/g, ""), 10);

  return 15000;
}

function extractTripMeta(prompt: string): TripMeta | null {
  const match = prompt.match(/\[TRIP_META\s+([^\]]+)\]/i);
  if (!match) return null;

  const meta: TripMeta = {};

  for (const token of match[1].matchAll(/(\w+)="([^"]*)"|(\w+)=([^\s\]]+)/g)) {
    const key = token[1] ?? token[3];
    const value = token[2] ?? token[4];

    if (!key || !value) continue;

    if (key === "days") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        meta.days = Math.min(parsed, 14);
      }
      continue;
    }

    if (key === "destination" || key === "budget" || key === "theme" || key === "checkIn" || key === "checkOut") {
      meta[key] = value;
    }
  }

  return meta;
}

function stripTripMeta(prompt: string): string {
  return prompt.replace(/\s*\[TRIP_META\s+[^\]]+\]/i, "").trim();
}

function getDaysFromDates(meta: TripMeta | null): number | null {
  if (!meta?.checkIn || !meta?.checkOut) return null;

  const start = new Date(meta.checkIn);
  const end = new Date(meta.checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  const diffInDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.min(Math.max(diffInDays, 1), 14);
}

function getBudgetFromMeta(value?: string): number | null {
  if (!value) return null;

  if (/^\d[\d,]*$/.test(value)) {
    return Number.parseInt(value.replace(/,/g, ""), 10);
  }

  if (value === "low") return 8000;
  if (value === "medium") return 15000;
  if (value === "high") return 30000;

  return null;
}

function formatTime(departureTime: string): string {
  const date = new Date(departureTime);
  return `${`${date.getUTCHours()}`.padStart(2, "0")}:${`${date.getUTCMinutes()}`.padStart(2, "0")}`;
}

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildDailySequence<T>(source: T[], totalDays: number): T[] {
  if (source.length === 0 || totalDays <= 0) return [];
  if (source.length >= totalDays) return pick(source, totalDays);
  return Array.from({ length: totalDays }, (_, index) => source[index % source.length]);
}

function isTravelRequest(prompt: string): boolean {
  const travelKeywords = [
    "ไป",
    "เที่ยว",
    "trip",
    "ทริป",
    "travel",
    "journey",
    "งบ",
    "budget",
    "วัน",
    "day",
    "คืน",
    "พัก",
    "hotel",
    "โรงแรม",
    "ที่พัก",
    "stay",
    "บิน",
    "flight",
    "เครื่องบิน",
    "อาหาร",
    "restaurant",
    "ร้าน",
    "กิน",
    "ชิม",
    "จังหวัด",
    "ประเทศ",
    "city",
    "destination",
    "ทะเล",
    "ภูเขา",
    "ธรรมชาติ",
    "วัด",
    "หาด",
    "แพลน",
    "plan",
    "itinerary",
  ];
  const lower = prompt.toLowerCase();
  return travelKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export async function POST(req: Request) {
  let promptText = "";
  let requestedBudget = 15000;
  let requestedDays = 3;
  let requestedDestination = "ภูเก็ต";

  try {
    const { prompt, preferences } = await req.json();
    promptText = typeof prompt === "string" ? prompt : "";
    const tripMeta = extractTripMeta(promptText);
    const promptBody = stripTripMeta(promptText);

    if (!tripMeta && !isTravelRequest(promptBody)) {
      return NextResponse.json({
        success: true,
        needsPrompt: true,
        message:
          'สวัสดีครับ! ยินดีต้อนรับสู่ AI Trip Architect!\n\nกรุณาบอกรายละเอียดทริป เช่น:\n• "ไปภูเก็ต 3 วัน งบ 15,000 บาท"\n• "เที่ยวเชียงใหม่ งบ 8,000 สายคาเฟ่"\n• "โตเกียว 5 วัน ตะลุยชิมอาหาร"',
      });
    }

    const destination = tripMeta?.destination
      ? extractDestination(tripMeta.destination) || extractDestination(promptBody)
      : extractDestination(promptBody);
    const days = tripMeta?.days ?? getDaysFromDates(tripMeta) ?? extractDays(promptBody);
    const budget = getBudgetFromMeta(tripMeta?.budget) ?? extractBudget(promptBody);
    const destinationName = destination?.name || "ภูเก็ต";
    const destinationAirports = destination?.destAirports || ["HKT"];
    const hotelNights = Math.max(days - 1, 0);

    requestedDays = days;
    requestedBudget = budget;
    requestedDestination = destinationName;

    const [allHotels, allFlights, allRestaurants] = await Promise.all([
      readJson<any[]>("hotel/hotels.json"),
      readJson<any[]>("travel/flights.json"),
      readJson<any[]>("food/restaurants.json"),
    ]);

    const destinationLower = destinationName.toLowerCase();
    const hotels = allHotels.filter((hotel) => hotel.location?.toLowerCase().includes(destinationLower));
    const flightsTo = allFlights.filter((flight) => destinationAirports.includes(flight.destination));
    const restaurants = [...allRestaurants].sort((a, b) => b.rating - a.rating);

    const selectedFlight = flightsTo.sort((a, b) => a.price - b.price)[0] || flightsTo[0];
    const budgetPerNight = budget / Math.max(hotelNights, 1);
    const selectedHotel =
      hotels
        .filter((hotel) => hotel.price_per_night <= budgetPerNight * 1.5)
        .sort((a, b) => b.rating - a.rating)[0] ||
      hotels[0] ||
      allHotels[0];

    const selectedRestaurants = buildDailySequence(restaurants, days);
    const activityPool = ACTIVITY_TEMPLATES[destinationName] || DEFAULT_ACTIVITIES;
    const selectedActivities = buildDailySequence(activityPool, days);

    const items: any[] = [];
    let totalPrice = 0;

    if (selectedFlight) {
      items.push({
        id: `flight-${Date.now()}`,
        type: "flight",
        time: `วันที่ 1 - ${formatTime(selectedFlight.departure_time)}`,
        title: `${selectedFlight.airline} - บินไป${destinationName}`,
        description: `ออกจาก ${selectedFlight.origin} ไป ${selectedFlight.destination} เวลา ${formatTime(selectedFlight.departure_time)}`,
        price: selectedFlight.price,
        data: { flight_id: selectedFlight.flight_id },
      });
      totalPrice += selectedFlight.price;
    }

    if (selectedHotel && hotelNights > 0) {
      const hotelTotal = selectedHotel.price_per_night * hotelNights;
      items.push({
        id: `hotel-${Date.now()}`,
        type: "hotel",
        time: `วันที่ 1 - ${hotelNights} คืน`,
        title: selectedHotel.name,
        description: `ที่พักระดับ ${selectedHotel.rating} ดาว ${selectedHotel.amenities?.slice(0, 3).join(", ") || ""}`,
        price: hotelTotal,
        data: { hotel_id: selectedHotel.hotel_id },
      });
      totalPrice += hotelTotal;
    }

    selectedRestaurants.forEach((restaurant, index) => {
      const mealPrice = restaurant.rating >= 4.5 ? 800 : restaurant.rating >= 4 ? 500 : 350;
      const dayNumber = index + 1;
      items.push({
        id: `food-${Date.now()}-${index}`,
        type: "food",
        time: `วันที่ ${dayNumber} - เที่ยง`,
        title: `อาหาร${restaurant.cuisine}ที่ ${restaurant.name}`,
        description: `ร้าน${restaurant.cuisine} คะแนน ${restaurant.rating}/5`,
        price: mealPrice,
        data: { res_id: restaurant.res_id },
      });
      totalPrice += mealPrice;
    });

    selectedActivities.forEach((activity, index) => {
      const dayNumber = index + 1;
      items.push({
        id: `act-${Date.now()}-${index}`,
        type: "activity",
        time: `วันที่ ${dayNumber} - บ่าย`,
        title: activity.title,
        description: activity.desc,
        price: activity.price,
        data: {},
      });
      totalPrice += activity.price;
    });

    let sentimentSummary = `ทริป${destinationName} ${days}วัน งบ ${budget.toLocaleString()} บาท เหมาะสำหรับผู้ที่ต้องการเที่ยวแบบคุ้มค่า`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const aiResult = await Promise.race([
          model.generateContent(
            `เขียนสรุปสั้นๆ ภาษาไทย 2-3 ประโยค ว่า "ทริป${destinationName} ${days}วัน งบ${budget}บาท" น่าสนใจยังไง ` +
              `(โรงแรม: ${selectedHotel?.name || "-"}, เที่ยวบิน: ${selectedFlight?.airline || "-"}, ความชอบผู้ใช้: ${JSON.stringify(preferences || {})})`,
          ),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
        ]);
        sentimentSummary = aiResult.response.text().trim();
      } catch {
        // Keep deterministic summary when AI summary is unavailable.
      }
    }

    const itinerary = {
      id: `trp-${Date.now()}`,
      destination: destinationName,
      days,
      budget,
      totalPrice,
      items,
      sentimentSummary,
    };

    return NextResponse.json({ success: true, itinerary });
  } catch (error: any) {
    console.error("AI Planning Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "AI Error",
        fallback: {
          id: "trp-fallback",
          destination: `${requestedDestination} (แผนสำรอง)`,
          days: requestedDays,
          budget: requestedBudget,
          totalPrice: requestedBudget,
          items: [],
          sentimentSummary: `ระบบขัดข้องชั่วคราว นี่คือแผนการเดินทางสำรองสำหรับ ${requestedDestination} ${requestedDays} วัน`,
        },
      },
      { status: 500 },
    );
  }
}
