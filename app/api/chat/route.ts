import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadFlights, getAirportName } from "@/lib/flights";
import type { Flight } from "@/lib/flights";
import { loadHotels } from "@/lib/hotels";
import type { Hotel } from "@/lib/types";
import { loadLocations } from "@/lib/locations";
import type { Location } from "@/lib/locations";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
];

const QUERY_ALIASES: Record<string, string[]> = {
  "ภูเก็ต": ["phuket", "hkt", "beach", "ocean"],
  "กรุงเทพ": ["bangkok", "bkk", "dmk"],
  "กรุงเทพฯ": ["bangkok", "bkk", "dmk"],
  "เชียงใหม่": ["chiang mai", "cnx"],
  "สมุย": ["koh samui", "samui", "usm", "beach"],
  "เกาะสมุย": ["koh samui", "samui", "usm", "beach"],
  "กระบี่": ["krabi", "kbv", "beach"],
  "พัทยา": ["pattaya", "beach"],
  "เชียงราย": ["chiang rai", "cei"],
  "หาดใหญ่": ["hat yai", "hdy"],
  "โตเกียว": ["tokyo", "nrt"],
  "สิงคโปร์": ["singapore", "sin"],
  "ฮ่องกง": ["hong kong", "hkg"],
  "โซล": ["seoul", "icn"],
  "ทะเล": ["beach", "ocean", "sea"],
  "ติดทะเล": ["beach", "ocean", "sea", "beach access"],
  "หรู": ["luxury", "resort", "villa", "spa", "private pool"],
  "ถูก": ["cheap", "budget", "price"],
  "ประหยัด": ["cheap", "budget", "price"],
  "โรงแรม": ["hotel", "resort", "villa"],
  "ที่พัก": ["hotel", "resort", "villa"],
  "เที่ยวบิน": ["flight", "airline", "ticket"],
  "ตั๋ว": ["flight", "airline", "ticket"],
};

type ChatContext = {
  hotels: Hotel[];
  flights: Flight[];
  locations: Location[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({
      answer: "พิมพ์คำถามเกี่ยวกับโรงแรม เที่ยวบิน หรือสถานที่เที่ยวมาได้เลยครับ",
      source: "empty",
    });
  }

  try {
    const context = await loadChatContext();
    const directAnswer = buildDirectCatalogAnswer(query, context);

    if (directAnswer) {
      return NextResponse.json({ answer: directAnswer, source: "local-catalog" });
    }

    const aiAnswer = await generateWithGemini(query, context);

    if (aiAnswer) {
      return NextResponse.json({ answer: aiAnswer, source: "gemini" });
    }

    return NextResponse.json({
      answer: buildLocalAnswer(query, context),
      source: "local-fallback",
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    try {
      const context = await loadChatContext();
      return NextResponse.json({
        answer: buildLocalAnswer(query, context),
        source: "local-fallback-after-error",
      });
    } catch {
      return NextResponse.json({
        answer:
          "ขออภัยครับ ตอนนี้ระบบค้นหาข้อมูลมีปัญหา แต่ผมยังช่วยแนะนำเส้นทางคร่าวๆ ได้ ลองถามอีกครั้งโดยระบุเมือง เช่น ภูเก็ต เชียงใหม่ หรือกรุงเทพครับ",
        source: "error",
      });
    }
  }
}

async function loadChatContext(): Promise<ChatContext> {
  const [hotels, flights, locations] = await Promise.all([
    loadHotels(),
    loadFlights(),
    loadLocations(),
  ]);

  return { hotels, flights, locations };
}

async function generateWithGemini(
  query: string,
  context: ChatContext,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(query, context);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 700,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      if (isUsefulAnswer(text)) return text;
    } catch (error) {
      console.warn(`Travel Buddy Gemini model failed: ${modelName}`, error);
    }
  }

  return null;
}

function buildPrompt(query: string, context: ChatContext): string {
  const relevantHotels = findHotelCandidates(query, context.hotels, 8);
  const relevantFlights = findFlightCandidates(query, context.flights, 8);
  const relevantLocations = findLocationCandidates(query, context.locations, 8);

  return `
คุณคือ "Travel Buddy" ผู้ช่วย AI สำหรับการเดินทางของ TicketHub

ตอบเป็นภาษาไทยเท่านั้น น้ำเสียงเป็นมิตร กระชับ และช่วยตัดสินใจได้จริง
ถ้าพบข้อมูลในระบบ ให้แนะนำรายการจาก context ก่อน พร้อมราคา/คะแนน/เส้นทาง และลิงก์ในระบบเมื่อมี
ถ้าไม่พบตรงเป๊ะ ให้บอกอย่างสุภาพว่าในระบบยังไม่มีรายการตรงเงื่อนไข แล้วเสนอทางเลือกใกล้เคียง
ใช้ข้อความธรรมดาที่อ่านง่าย แยกบรรทัดด้วยขีด "-" ได้ แต่ไม่ใช้ Markdown เช่น **ตัวหนา**
ห้ามตอบว่า "ไม่ได้รับคำตอบจากระบบ"

คำถามผู้ใช้:
${query}

ข้อมูลโรงแรมที่เกี่ยวข้อง:
${JSON.stringify(
  relevantHotels.map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    stars: hotel.stars,
    rating: hotel.rating_avg,
    price_per_night_thb: hotel.price_per_night_thb,
    amenities: hotel.amenities,
    detail_url: `/explore/hotel/${hotel.id}`,
  })),
)}

ข้อมูลเที่ยวบินที่เกี่ยวข้อง:
${JSON.stringify(
  relevantFlights.map((flight) => ({
    id: flight.flight_id,
    airline: flight.airline,
    origin: `${flight.origin} (${getAirportName(flight.origin)})`,
    destination: `${flight.destination} (${getAirportName(flight.destination)})`,
    departure_time: flight.departure_time,
    price_thb: flight.price,
    detail_url: `/explore/flight/${flight.flight_id}`,
  })),
)}

ข้อมูลสถานที่ที่เกี่ยวข้อง:
${JSON.stringify(
  relevantLocations.map((location) => ({
    name: location.name,
    type: location.type,
    address: location.address,
  })),
)}
`;
}

function buildLocalAnswer(query: string, context: ChatContext): string {
  const directAnswer = buildDirectCatalogAnswer(query, context);
  if (directAnswer) return directAnswer;

  const hotels = findHotelCandidates(query, context.hotels, 3);
  if (hotels.length > 0) return formatHotelAnswer(query, hotels);

  const flights = findFlightCandidates(query, context.flights, 3);
  if (flights.length > 0) return formatFlightAnswer(query, flights);

  const locations = findLocationCandidates(query, context.locations, 3);
  if (locations.length > 0) return formatLocationAnswer(locations);

  return [
    "ผมหาข้อมูลที่ตรงเป๊ะในระบบยังไม่เจอครับ",
    "",
    "ลองถามโดยระบุเมืองหรือประเภทที่ต้องการ เช่น:",
    "- หาโรงแรมหรูติดทะเลภูเก็ต",
    "- เที่ยวบินไปเชียงใหม่ราคาถูก",
    "- ที่เที่ยวในกรุงเทพ",
  ].join("\n");
}

function buildDirectCatalogAnswer(
  query: string,
  context: ChatContext,
): string | null {
  if (isFlightIntent(query)) {
    const flights = findFlightCandidates(query, context.flights, 3);
    if (flights.length > 0) return formatFlightAnswer(query, flights);
  }

  if (isHotelIntent(query)) {
    const hotels = findHotelCandidates(query, context.hotels, 3);
    if (hotels.length > 0) return formatHotelAnswer(query, hotels);
  }

  return null;
}

function findHotelCandidates(
  query: string,
  hotels: Hotel[],
  limit: number,
): Hotel[] {
  const scored = hotels
    .map((hotel) => ({ item: hotel, score: scoreHotel(query, hotel) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.item.rating_avg - a.item.rating_avg ||
        b.item.stars - a.item.stars,
    )
    .map(({ item }) => item);

  if (scored.length > 0) return scored.slice(0, limit);

  if (isHotelIntent(query)) {
    return [...hotels]
      .sort(
        (a, b) =>
          b.rating_avg - a.rating_avg ||
          b.stars - a.stars ||
          a.price_per_night_thb - b.price_per_night_thb,
      )
      .slice(0, limit);
  }

  return [];
}

function findFlightCandidates(
  query: string,
  flights: Flight[],
  limit: number,
): Flight[] {
  const scored = flights
    .map((flight) => ({ item: flight, score: scoreFlight(query, flight) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .map(({ item }) => item);

  if (scored.length > 0) return scored.slice(0, limit);

  if (isFlightIntent(query)) {
    return [...flights].sort((a, b) => a.price - b.price).slice(0, limit);
  }

  return [];
}

function findLocationCandidates(
  query: string,
  locations: Location[],
  limit: number,
): Location[] {
  const expanded = expandQuery(query);

  return locations
    .map((location) => {
      const haystack = [
        location.name,
        location.type,
        location.address,
      ].join(" ").toLowerCase();

      return {
        item: location,
        score: countMatches(expanded, haystack),
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

function scoreHotel(query: string, hotel: Hotel): number {
  const expanded = expandQuery(query);
  const haystack = [
    hotel.name,
    hotel.city,
    hotel.country,
    hotel.tags.join(" "),
    hotel.amenities.join(" "),
  ].join(" ").toLowerCase();

  let score = countMatches(expanded, haystack);

  if (expanded.includes(hotel.city.toLowerCase())) score += 4;
  if (expanded.includes("beach") && haystack.includes("beach")) score += 4;
  if (
    expanded.includes("luxury") &&
    (hotel.stars >= 5 ||
      hotel.rating_avg >= 4.5 ||
      haystack.includes("spa") ||
      haystack.includes("private pool"))
  ) {
    score += 3;
  }
  if (isHotelIntent(query)) score += 1;

  return score;
}

function scoreFlight(query: string, flight: Flight): number {
  const expanded = expandQuery(query);
  const originName = getAirportName(flight.origin);
  const destinationName = getAirportName(flight.destination);
  const haystack = [
    flight.airline,
    flight.origin,
    flight.destination,
    originName,
    destinationName,
  ].join(" ").toLowerCase();

  let score = countMatches(expanded, haystack);

  if (expanded.includes(flight.destination.toLowerCase())) score += 4;
  if (expanded.includes(destinationName.toLowerCase())) score += 4;
  if (isFlightIntent(query)) score += 1;

  return score;
}

function expandQuery(query: string): string {
  const lower = query.toLowerCase();
  const additions: string[] = [];

  for (const [keyword, aliases] of Object.entries(QUERY_ALIASES)) {
    if (lower.includes(keyword.toLowerCase())) additions.push(...aliases);
  }

  return `${lower} ${additions.join(" ")}`.trim();
}

function countMatches(needle: string, haystack: string): number {
  const terms = Array.from(
    new Set(needle.split(/\s+/).map((term) => term.trim()).filter(Boolean)),
  );

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function isHotelIntent(query: string): boolean {
  return /โรงแรม|ที่พัก|รีสอร์ท|hotel|resort|villa/i.test(query);
}

function isFlightIntent(query: string): boolean {
  return /เที่ยวบิน|ตั๋ว|บิน|flight|airline|ticket/i.test(query);
}

function isUsefulAnswer(text: string): boolean {
  if (!text.trim()) return false;
  return !/ไม่ได้รับคำตอบจากระบบ|ขออภัย\s*ไม่/i.test(text);
}

function formatHotelAnswer(query: string, hotels: Hotel[]): string {
  const lines = hotels.map((hotel, index) => {
    const amenities = hotel.amenities.slice(0, 4).join(", ");
    return [
      `${index + 1}. ${hotel.name} (${hotel.city})`,
      `   ราคา ${formatBaht(hotel.price_per_night_thb)}/คืน · ${hotel.stars} ดาว · คะแนน ${hotel.rating_avg}/5`,
      `   จุดเด่น: ${amenities}`,
      `   ดูรายละเอียด: /explore/hotel/${hotel.id}`,
    ].join("\n");
  });

  return [
    `ได้เลยครับ ผมเจอโรงแรมที่เข้ากับ “${query}” ในระบบดังนี้`,
    "",
    ...lines,
    "",
    "ถ้าต้องการเทียบตัวเลือกเพิ่ม กดไปที่ /explore/hotels ได้เลยครับ",
  ].join("\n");
}

function formatFlightAnswer(query: string, flights: Flight[]): string {
  const lines = flights.map((flight, index) => {
    const date = new Date(flight.departure_time).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return [
      `${index + 1}. ${flight.airline}`,
      `   ${flight.origin} (${getAirportName(flight.origin)}) -> ${flight.destination} (${getAirportName(flight.destination)})`,
      `   ออกเดินทาง ${date} · ราคา ${formatBaht(flight.price)}`,
      `   ดูรายละเอียด: /explore/flight/${flight.flight_id}`,
    ].join("\n");
  });

  return [
    `ได้ครับ ผมเจอเที่ยวบินที่เกี่ยวกับ “${query}” ในระบบ`,
    "",
    ...lines,
    "",
    "ดูเที่ยวบินทั้งหมดได้ที่ /explore/flights ครับ",
  ].join("\n");
}

function formatLocationAnswer(locations: Location[]): string {
  const lines = locations.map(
    (location, index) =>
      `${index + 1}. ${location.name} (${location.type})\n   ${location.address}`,
  );

  return [
    "ผมเจอสถานที่ที่น่าจะเกี่ยวข้องในระบบครับ",
    "",
    ...lines,
  ].join("\n");
}

function formatBaht(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}
