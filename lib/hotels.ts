import { promises as fs } from "node:fs";
import path from "node:path";
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

  // stable pseudo-random rooms_available จาก hash ของ hotel_id (ไม่ใช้ Math.random เพื่อ stable ระหว่าง SSR/CSR)
  const seed = Array.from(raw.hotel_id).reduce((s, c) => s + c.charCodeAt(0), 0);
  const roomsAvailable = (seed % 18) + 3; // 3..20

  // stars จาก rating: 4.5+ = 5★, 4.0+ = 4★, ที่เหลือ 3★
  const stars = raw.rating >= 4.5 ? 5 : raw.rating >= 4 ? 4 : 3;

  // thumbnail placeholder ใช้ชื่อโรงแรมเป็น query string
  const slug = encodeURIComponent(raw.name.slice(0, 20));
  const thumbnail = `https://placehold.co/640x400/0b0f10/adc6ff?text=${slug}`;

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
