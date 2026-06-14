import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "data");
const TMP_ROOT = path.join(process.env.TMPDIR || '/tmp', 'data');

const cacheMap = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5_000;

export async function readJSON<T>(relPath: string): Promise<T> {
  const cached = cacheMap.get(relPath);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T;
  }
  const tmpFile = path.join(TMP_ROOT, relPath);
  let raw: string;
  try {
    await fs.access(tmpFile);
    raw = await fs.readFile(tmpFile, "utf8");
  } catch {
    raw = await fs.readFile(path.join(DATA_ROOT, relPath), "utf8");
  }
  const data = JSON.parse(raw) as T;
  cacheMap.set(relPath, { data, ts: Date.now() });
  return data;
}

export function clearCache(relPath?: string) {
  if (relPath) cacheMap.delete(relPath);
  else cacheMap.clear();
}

export async function writeJSON<T>(relPath: string, data: T): Promise<void> {
  clearCache(relPath);
  const target = path.join(DATA_ROOT, relPath);
  try {
    await fs.writeFile(target, JSON.stringify(data, null, 2), "utf8");
  } catch (writeErr: any) {
    if (writeErr.code === 'EROFS' || writeErr.code === 'EACCES' || writeErr.code === 'EPERM') {
      const tmpFile = path.join(TMP_ROOT, relPath);
      await fs.mkdir(path.dirname(tmpFile), { recursive: true });
      await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), "utf8");
      return;
    }
    throw writeErr;
  }
}

export const DATA = {
  users: "user/users.json",
  hotels: "hotel/hotels.json",
  hotelBookings: "hotel/hotel_bookings.json",
  flights: "travel/flights.json",
  flightTickets: "travel/flight_tickets.json",
  restaurants: "food/restaurants.json",
  foodOrders: "food/food_orders.json",
  reviews: "common/reviews.json",
  notifications: "common/notifications.json",
  locations: "common/locations.json",
  chats: "common/chats.json",
} as const;
