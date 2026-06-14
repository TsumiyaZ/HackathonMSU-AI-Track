import { NextResponse } from "next/server";
import { listFlights } from "@/lib/flights";
import { listHotels } from "@/lib/hotels";
import { listRestaurants } from "@/lib/restaurants";

type BuddyAction = {
  href: string;
  label: string;
};

type BuddyPayload = {
  actions: BuddyAction[];
  reply: string;
  suggestions: string[];
};

const QUICK_SUGGESTIONS = [
  "ช่วยหาโรงแรมวิวดีในเชียงใหม่",
  "มีไฟลต์ราคาประหยัดไปภูเก็ตไหม",
  "ช่วยวางทริป 3 วันแบบชิล ๆ ให้หน่อย",
];

const LOCATION_ALIASES = [
  { airport: "BKK", aliases: ["bangkok", "กรุงเทพ", "กรุงเทพฯ", "กทม"], city: "Bangkok" },
  { airport: "CNX", aliases: ["chiang mai", "เชียงใหม่"], city: "Chiang Mai" },
  { airport: "HKT", aliases: ["phuket", "ภูเก็ต"], city: "Phuket" },
  { airport: "KBV", aliases: ["krabi", "กระบี่"], city: "Krabi" },
  { airport: "USM", aliases: ["samui", "koh samui", "สมุย", "เกาะสมุย"], city: "Koh Samui" },
  { airport: "SIN", aliases: ["singapore", "สิงคโปร์"], city: "Singapore" },
  { airport: "NRT", aliases: ["tokyo", "โตเกียว"], city: "Tokyo" },
  { airport: "LHR", aliases: ["london", "ลอนดอน"], city: "London" },
];

function hasIntent(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function getLocationAlias(message: string) {
  return LOCATION_ALIASES.find((entry) => entry.aliases.some((alias) => message.includes(alias)));
}

function formatHotelLine(name: string, city: string, rating: number, price: number) {
  return `- ${name} (${city}) เรตติ้ง ${rating.toFixed(1)}/5 เริ่มประมาณ ฿${price.toLocaleString()}/คืน`;
}

function formatFlightLine(airline: string, origin: string, destination: string, price: number) {
  return `- ${airline} ${origin} -> ${destination} ราคาเริ่มประมาณ ฿${price.toLocaleString()}`;
}

function formatRestaurantLine(name: string, cuisine: string, rating: number, time: number) {
  return `- ${name} อาหาร${cuisine} เรตติ้ง ${rating.toFixed(1)}/5 ใช้เวลาประมาณ ${time} นาที`;
}

export async function POST(req: Request) {
  let body: { message?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ ok: false, error: "กรุณาพิมพ์คำถามก่อนนะ" }, { status: 400 });
  }

  const normalized = message.toLowerCase();
  const wantsHotel = hasIntent(normalized, ["hotel", "stay", "resort", "room", "โรงแรม", "ที่พัก"]);
  const wantsFlight = hasIntent(normalized, ["flight", "airline", "ticket", "plane", "บิน", "เที่ยวบิน", "ตั๋ว"]);
  const wantsFood = hasIntent(normalized, ["food", "restaurant", "cafe", "cuisine", "กิน", "ร้านอาหาร", "คาเฟ่"]);
  const wantsTrip = hasIntent(normalized, ["trip", "plan", "itinerary", "เที่ยว", "ทริป", "แพลน", "แผน"]);
  const locationAlias = getLocationAlias(normalized);
  const hotelSearch = locationAlias?.city ?? message;
  const flightSearch = locationAlias?.airport ?? hotelSearch;

  const [hotelMatches, flightMatches, restaurantMatches] = await Promise.all([
    listHotels({ search: hotelSearch, sort: "rating_desc" }),
    listFlights({ search: flightSearch, sort: "price_asc" }),
    listRestaurants({ search: hotelSearch, sort: "rating" }),
  ]);

  const hotels = hotelMatches.slice(0, 3);
  const flights = flightMatches.slice(0, 3);
  const restaurants = restaurantMatches.slice(0, 3);

  const replyParts: string[] = [];
  const actions: BuddyAction[] = [];

  if (wantsTrip || (!wantsHotel && !wantsFlight && !wantsFood)) {
    replyParts.push(
      "Travel Buddy ช่วยเริ่มทริปให้ได้เร็วที่สุด ถ้าบอกเมือง งบประมาณ และจำนวนวัน ฉันจะชี้ทางต่อให้เหมาะกับหน้า AI Planner ของเว็บนี้",
    );
    actions.push({ href: "/plan", label: "เปิด AI Planner" });
  }

  if (wantsHotel || wantsTrip || hotels.length > 0) {
    if (hotels.length > 0) {
      replyParts.push(
        `โรงแรมที่น่าสนใจตอนนี้:\n${hotels
          .map((hotel) =>
            formatHotelLine(hotel.name, hotel.city, hotel.rating_avg, hotel.price_per_night_thb),
          )
          .join("\n")}`,
      );
      actions.push({ href: "/explore/hotels", label: "ดูโรงแรมทั้งหมด" });
    } else if (wantsHotel) {
      replyParts.push("ยังไม่เจอโรงแรมที่ตรงคำค้นนี้ ลองพิมพ์ชื่อเมืองหรือสไตล์ที่พัก เช่น เชียงใหม่, ติดทะเล, หรือบูติก");
      actions.push({ href: "/explore/hotels", label: "เปิดหน้าโรงแรม" });
    }
  }

  if (wantsFlight || wantsTrip || flights.length > 0) {
    if (flights.length > 0) {
      replyParts.push(
        `ไฟลต์ที่พอเหมาะกับคำถามนี้:\n${flights
          .map((flight) =>
            formatFlightLine(flight.airline, flight.origin, flight.destination, flight.price),
          )
          .join("\n")}`,
      );
      actions.push({ href: "/explore/flights", label: "ดูเที่ยวบินทั้งหมด" });
    } else if (wantsFlight) {
      replyParts.push("ยังไม่เจอเที่ยวบินจากคำค้นนี้ ลองพิมพ์สนามบิน เมือง หรือสายการบินที่อยากได้เพิ่มอีกนิด");
      actions.push({ href: "/explore/flights", label: "เปิดหน้าตั๋วเครื่องบิน" });
    }
  }

  if (wantsFood || restaurants.length > 0) {
    if (restaurants.length > 0) {
      replyParts.push(
        `ถ้าอยากแทรกร้านอร่อยในทริป ลองดู:\n${restaurants
          .map((restaurant) =>
            formatRestaurantLine(
              restaurant.name,
              restaurant.cuisine,
              restaurant.rating,
              restaurant.delivery_time_min,
            ),
          )
          .join("\n")}`,
      );
      actions.push({ href: "/explore/restaurants", label: "ดูร้านอาหาร" });
    } else if (wantsFood) {
      replyParts.push("ถ้าอยากได้ร้านอาหาร ลองบอกประเภทอาหารหรือเมืองเพิ่ม เช่น คาเฟ่เชียงใหม่ หรือซีฟู้ดภูเก็ต");
      actions.push({ href: "/explore/restaurants", label: "เปิดหน้าร้านอาหาร" });
    }
  }

  if (replyParts.length === 0) {
    replyParts.push("ฉันช่วยได้เรื่องโรงแรม เที่ยวบิน ร้านอาหาร และแผนทริป ลองถามแบบสั้น ๆ เช่น 'หาโรงแรมภูเก็ตวิวทะเล' หรือ 'วางทริป 2 วันในกรุงเทพ'");
  }

  const payload: BuddyPayload = {
    actions: actions.filter((action, index, list) => list.findIndex((item) => item.href === action.href) === index),
    reply: replyParts.join("\n\n"),
    suggestions: QUICK_SUGGESTIONS,
  };

  return NextResponse.json({ ok: true, ...payload });
}
