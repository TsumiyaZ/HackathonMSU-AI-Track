import { promises as fs } from "node:fs";
import path from "node:path";
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  Hotel,
  HotelBooking,
  HotelBookingSummary,
  HotelListFilters,
  HotelSentiment,
  Review,
} from "./types";

const DATA_ROOT = path.join(process.cwd(), "data");

async function readJson<T>(relPath: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_ROOT, relPath), "utf8");
  return JSON.parse(raw) as T;
}

// Raw shape ที่อยู่ในไฟล์ JSON จริง — ไม่ตรงกับ Hotel ที่ UI ใช้
type RawHotel = {
  hotel_id: string;
  name: string;
  location: string;
  rating: number;
  price_per_night: number;
  amenities: string[];
};

// แปลง raw → Hotel ที่ UI ต้องการ พร้อม derive field ที่ data ไม่มี
function normalizeHotel(raw: RawHotel): Hotel {
  // ดึงเมืองจาก location เช่น "Bangkok" หรือ "Bangkok, Thailand"
  const parts = raw.location.split(",").map((s) => s.trim());
  const city = parts[0] || "-";
  const country = parts[1] || "Thailand";

  // map amenity → tag เพื่อให้ filter ยังเวิร์ก
  const tagPool: string[] = [];
  const lower = raw.amenities.map((a) => a.toLowerCase());
  if (lower.some((a) => a.includes("pool"))) tagPool.push("pool");
  if (lower.some((a) => a.includes("beach"))) tagPool.push("beach");
  if (lower.some((a) => a.includes("spa"))) tagPool.push("spa");
  if (lower.some((a) => a.includes("gym"))) tagPool.push("fitness");
  if (lower.some((a) => a.includes("bar"))) tagPool.push("nightlife");
  if (lower.some((a) => a.includes("kids"))) tagPool.push("family");
  if (lower.some((a) => a.includes("meeting"))) tagPool.push("business");
  if (lower.some((a) => a.includes("garden"))) tagPool.push("nature");
  if (lower.some((a) => a.includes("river") || a.includes("view"))) tagPool.push("view");
  if (tagPool.length === 0) tagPool.push("essential");

  // thumbnail placeholder - using premium, realistic Unsplash hotel photos based on city and ID seed
  const seed = Array.from(raw.hotel_id).reduce((s, c) => s + c.charCodeAt(0), 0);
  const roomsAvailable = (seed % 18) + 3; // 3..20
  const stars = raw.rating >= 4.5 ? 5 : raw.rating >= 4 ? 4 : 3;
  const lowerCity = city.toLowerCase();
  let thumbnail = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&q=80"; // default premium hotel
  
  if (lowerCity.includes("bangkok") || lowerCity.includes("sathorn") || lowerCity.includes("sukhumvit")) {
    const urls = [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=640&q=80"
    ];
    thumbnail = urls[seed % urls.length];
  } else if (
    lowerCity.includes("phuket") || 
    lowerCity.includes("samui") || 
    lowerCity.includes("krabi") || 
    lowerCity.includes("tao") || 
    lowerCity.includes("lipe") || 
    lowerCity.includes("samet") || 
    lowerCity.includes("pattaya") || 
    lowerCity.includes("beach") ||
    lowerCity.includes("island") ||
    lowerCity.includes("phang nga")
  ) {
    const urls = [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=640&q=80"
    ];
    thumbnail = urls[seed % urls.length];
  } else if (
    lowerCity.includes("chiang") || 
    lowerCity.includes("pai") || 
    lowerCity.includes("mae hong") || 
    lowerCity.includes("nan") ||
    lowerCity.includes("historical") ||
    lowerCity.includes("ayutthaya")
  ) {
    const urls = [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=640&q=80"
    ];
    thumbnail = urls[seed % urls.length];
  } else {
    const urls = [
      "https://images.unsplash.com/photo-1529290130-4ca3753253ae?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?auto=format&fit=crop&w=640&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&q=80"
    ];
    thumbnail = urls[seed % urls.length];
  }

  return {
    id: raw.hotel_id,
    name: raw.name,
    city,
    country,
    stars,
    rating_avg: raw.rating,
    price_per_night_thb: raw.price_per_night,
    rooms_available: roomsAvailable,
    tags: tagPool,
    amenities: raw.amenities,
    thumbnail_url: thumbnail,
  };
}

let _hotels: Hotel[] | null = null;
let _bookings: HotelBooking[] | null = null;
let _reviews: Review[] | null = null;

export async function loadHotels(): Promise<Hotel[]> {
  if (!_hotels) {
    const raw = await readJson<RawHotel[]>("hotel/hotels.json");
    _hotels = raw.map(normalizeHotel);
  }
  return _hotels;
}

export async function loadHotelBookings(): Promise<HotelBooking[]> {
  if (!_bookings)
    _bookings = await readJson<HotelBooking[]>("hotel/hotel_bookings.json");
  return _bookings;
}

// reviews.json ใช้ target_type = "HOTEL" (uppercase) และ timestamp แทน created_at
type RawReview = {
  review_id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  rating: number;
  comment: string;
  timestamp: string;
  images?: string[];
};

export async function loadReviews(): Promise<Review[]> {
  if (!_reviews) {
    const raw = await readJson<RawReview[]>("common/reviews.json");
    _reviews = raw.map((r) => ({
      review_id: r.review_id,
      user_id: r.user_id,
      target_id: r.target_id,
      target_type: r.target_type.toLowerCase(),
      rating: r.rating,
      comment: r.comment,
      created_at: r.timestamp,
    }));
  }
  return _reviews;
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  const hotels = await loadHotels();
  return hotels.find((h) => h.id === id) ?? null;
}

export async function getHotelCities(): Promise<string[]> {
  const hotels = await loadHotels();
  return Array.from(new Set(hotels.map((h) => h.city))).sort();
}

export async function getAllAmenities(): Promise<string[]> {
  const hotels = await loadHotels();
  const set = new Set<string>();
  for (const h of hotels) h.amenities.forEach((a) => set.add(a));
  return Array.from(set).sort();
}

export async function listHotels(
  filters: HotelListFilters = {},
): Promise<Hotel[]> {
  const hotels = await loadHotels();
  const q = filters.search?.trim().toLowerCase();

  let result = hotels.filter((h) => {
    if (filters.city && h.city !== filters.city) return false;
    if (filters.minStars && h.stars < filters.minStars) return false;
    if (filters.minPrice && h.price_per_night_thb < filters.minPrice) return false;
    if (filters.maxPrice && h.price_per_night_thb > filters.maxPrice) return false;
    if (filters.amenities?.length) {
      const set = new Set(h.amenities);
      if (!filters.amenities.every((a) => set.has(a))) return false;
    }
    if (filters.tags?.length) {
      const set = new Set(h.tags);
      if (!filters.tags.every((t) => set.has(t))) return false;
    }
    if (q) {
      const hay = `${h.name} ${h.city} ${h.country} ${h.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "price_asc":
      result = [...result].sort((a, b) => a.price_per_night_thb - b.price_per_night_thb);
      break;
    case "price_desc":
      result = [...result].sort((a, b) => b.price_per_night_thb - a.price_per_night_thb);
      break;
    case "rating_desc":
      result = [...result].sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case "stars_desc":
      result = [...result].sort((a, b) => b.stars - a.stars);
      break;
  }

  return result;
}

export async function getBookingsForHotel(hotelId: string): Promise<HotelBooking[]> {
  const bookings = await loadHotelBookings();
  return bookings.filter((b) => b.hotel_id === hotelId);
}

export async function getHotelBookingSummary(hotelId: string): Promise<HotelBookingSummary> {
  const bookings = await getBookingsForHotel(hotelId);
  const today = "2026-06-13";
  let upcoming = 0;
  let active = 0;
  let cancelled = 0;
  let revenue = 0;

  for (const b of bookings) {
    if (b.status === "CANCELLED") {
      cancelled++;
      continue;
    }
    revenue += b.total_price;
    if (b.status === "CHECKED_IN") active++;
    if ((b.status === "CONFIRMED" || b.status === "PENDING") && b.check_in > today) {
      upcoming++;
    }
  }

  return {
    total: bookings.length,
    upcoming,
    active,
    cancelled,
    revenue_thb: revenue,
  };
}

export async function getHotelSentiment(hotelId: string): Promise<HotelSentiment | null> {
  const reviews = (await loadReviews()).filter(
    (r) => r.target_type === "hotel" && r.target_id === hotelId,
  );
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const score = (avg - 3) / 2;
  const positives = reviews.filter((r) => r.rating >= 4).map((r) => r.comment);
  const negatives = reviews.filter((r) => r.rating <= 3).map((r) => r.comment);

  // Use DeepSeek API if available
  const apiKey = process.env.OPENCODE_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `Analyze these hotel reviews and provide a brief Thai sentiment summary.
Reviews: ${JSON.stringify(reviews.map(r => ({ rating: r.rating, comment: r.comment })))}

Return ONLY a JSON object:
{
  "summary": "Thai summary (1-2 sentences)",
  "highlights": ["top positive points (max 3)"],
  "warnings": ["top negative points (max 3)"],
  "score": (number from -1 to 1 based on sentiment)
}`;

      const response = await fetch('https://opencode.ai/zen/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash-free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0]?.message?.content || "";
        const cleanJson = text.replace(/```json?\n?/gi, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          ...parsed,
          sample_size: reviews.length,
        };
      }
    } catch (e) {
      console.error("Gemini sentiment error:", e);
    }
  }

  return {
    summary:
      `จากรีวิวผู้เข้าพัก ${reviews.length} รายการ ค่าเฉลี่ยอยู่ที่ ${avg.toFixed(1)}/5 ` +
      (avg >= 4
        ? "โดยรวมผู้เข้าพักประทับใจกับบริการและทำเลของโรงแรม"
        : "ผู้เข้าพักให้ความเห็นปานกลาง มีจุดที่ควรปรับปรุงในบางด้าน"),
    highlights: positives.slice(0, 3),
    warnings: negatives.slice(0, 3),
    score: Number(score.toFixed(2)),
    sample_size: reviews.length,
  };
}
