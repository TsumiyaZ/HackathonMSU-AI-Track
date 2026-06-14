import { readJSON, DATA } from "@/lib/json-db";
import { listHotels } from "@/lib/hotels";
import ExploreClient from "./ExploreClient";

export const dynamic = 'force-dynamic';

const FLIGHT_FALLBACK = [
  { flight_id: "FL-987", airline: "Thai Airways", origin: "BKK", destination: "HKT", departure_time: new Date("2026-08-15T08:30:00Z"), price: 3200 },
  { flight_id: "FL-502", airline: "AirAsia", origin: "DMK", destination: "CNX", departure_time: new Date("2026-08-16T10:15:00Z"), price: 1800 },
  { flight_id: "FL-334", airline: "Nok Air", origin: "DMK", destination: "UBP", departure_time: new Date("2026-08-17T14:45:00Z"), price: 1500 },
];

const RESTAURANT_FALLBACK = [
  { res_id: "res-001", name: "เจ๊โอว (Jae Oh)", cuisine: "มาม่าต้มยำ / อาหารตามสั่ง", rating: 4.8, delivery_time_min: 45 },
  { res_id: "res-002", name: "Factory Coffee", cuisine: "กาแฟพิเศษ / เบเกอรี่", rating: 4.7, delivery_time_min: 20 },
  { res_id: "res-003", name: "สมบูรณ์โภชนา", cuisine: "อาหารทะเล / ปูผัดผงกะหรี่", rating: 4.6, delivery_time_min: 35 },
];

async function safeReadJSON<T>(relPath: string, fallback: T): Promise<T> {
  try { return await readJSON<any[]>(relPath) as unknown as T; }
  catch { return fallback; }
}

async function safeListHotels() {
  try { return await listHotels(); }
  catch { return []; }
}

export default async function ExplorePage() {
  const [hotels, flights, restaurants] = await Promise.all([
    safeListHotels(),
    safeReadJSON<any[]>(DATA.flights, FLIGHT_FALLBACK),
    safeReadJSON<any[]>(DATA.restaurants, RESTAURANT_FALLBACK),
  ]);

  const recommendedHotels = [...hotels].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 3);
  const recommendedFlights = [...flights].sort((a: any, b: any) => a.price - b.price).slice(0, 3);
  const recommendedRestaurants = [...restaurants].sort((a: any, b: any) => b.rating - a.rating).slice(0, 3);

  return (
    <ExploreClient
      recommendedHotels={recommendedHotels}
      recommendedFlights={recommendedFlights}
      recommendedRestaurants={recommendedRestaurants}
    />
  );
}
