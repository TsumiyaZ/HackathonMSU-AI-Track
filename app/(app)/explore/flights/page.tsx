import { FlightCard } from "@/components/flights/FlightCard";
import { FlightFilters } from "@/components/flights/FlightFilters";
import {
  listFlights,
  getFlightOrigins,
  getFlightDestinations,
  getFlightAirlines,
} from "@/lib/flights";
import type { FlightListFilters } from "@/lib/flights";
import Link from "next/link";

type SearchParams = Promise<{
  search?: string;
  origin?: string;
  destination?: string;
  airline?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}>;

function parseFilters(sp: Awaited<SearchParams>): FlightListFilters {
  return {
    search: sp.search?.trim() || undefined,
    origin: sp.origin || undefined,
    destination: sp.destination || undefined,
    airline: sp.airline || undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: (sp.sort as FlightListFilters["sort"]) || undefined,
  };
}

export default async function FlightsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [flights, origins, destinations, airlines] = await Promise.all([
    listFlights(filters),
    getFlightOrigins(),
    getFlightDestinations(),
    getFlightAirlines(),
  ]);

  // Stats
  const cheapest = flights.length > 0 ? Math.min(...flights.map((f) => f.price)) : 0;
  const uniqueRoutes = new Set(flights.map((f) => `${f.origin}-${f.destination}`)).size;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero header */}
      <section className="glass-panel-strong rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <Link
            href="/explore"
            className="font-label text-xs text-primary hover:underline mb-3 inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            กลับหน้า Explore
          </Link>
          <p className="font-label text-xs text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">flight</span>
            ค้นหาเที่ยวบิน
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            จองตั๋ว<span className="text-gradient"> เที่ยวบินราคาดี </span>ที่สุด
          </h1>
          <p className="mt-2 text-on-surface-variant max-w-xl">
            เปรียบเทียบเที่ยวบินจากหลายสายการบิน พร้อมกรองตามเส้นทาง ราคา และสายการบินที่คุณต้องการ
          </p>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="glass-panel rounded-xl px-4 py-3 text-center min-w-[100px]">
            <p className="font-display text-2xl font-bold text-primary">
              {flights.length}
            </p>
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
              เที่ยวบิน
            </p>
          </div>
          <div className="glass-panel rounded-xl px-4 py-3 text-center min-w-[100px]">
            <p className="font-display text-2xl font-bold text-secondary">
              {uniqueRoutes}
            </p>
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
              เส้นทาง
            </p>
          </div>
          {cheapest > 0 && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center min-w-[100px]">
              <p className="font-display text-lg font-bold text-emerald-500">
                ฿{cheapest.toLocaleString()}
              </p>
              <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
                ราคาเริ่มต้น
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <FlightFilters origins={origins} destinations={destinations} airlines={airlines} />

      {/* Results */}
      {flights.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            flight_land
          </span>
          <h3 className="font-display text-xl mt-3">ไม่พบเที่ยวบินตามเงื่อนไข</h3>
          <p className="text-on-surface-variant mt-1">
            ลองปรับตัวกรองหรือเปลี่ยนเส้นทาง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {flights.map((f) => (
            <FlightCard key={f.flight_id} flight={f} />
          ))}
        </div>
      )}
    </div>
  );
}
