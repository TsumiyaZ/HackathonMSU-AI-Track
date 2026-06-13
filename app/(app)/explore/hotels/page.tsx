import { HotelCard } from "@/components/hotels/HotelCard";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { getAllAmenities, getHotelCities, listHotels } from "@/lib/hotels";
import type { HotelListFilters } from "@/lib/types";


type SearchParams = Promise<{
  search?: string;
  city?: string;
  minStars?: string;
  minPrice?: string;
  maxPrice?: string;
  amenities?: string;
  sort?: string;
}>;

function parseFilters(sp: Awaited<SearchParams>): HotelListFilters {
  return {
    search: sp.search?.trim() || undefined,
    city: sp.city || undefined,
    minStars: sp.minStars ? Number(sp.minStars) : undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    amenities: sp.amenities ? sp.amenities.split(",").filter(Boolean) : undefined,
    sort: (sp.sort as HotelListFilters["sort"]) || undefined,
  };
}

export default async function HotelsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [hotels, cities, amenities] = await Promise.all([
    listHotels(filters),
    getHotelCities(),
    getAllAmenities(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero header */}
      <section className="glass-panel-strong rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">explore</span>
            สำรวจที่พัก
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            ค้นพบ<span className="text-gradient"> โรงแรมในอุดมคติ </span>ของคุณ
          </h1>
          <p className="mt-2 text-on-surface-variant max-w-xl">
            เลือกจากที่พักที่ AI คัดสรร พร้อมเครื่องมือกรองที่ตรงใจทุกการเดินทาง
          </p>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="glass-panel rounded-xl px-4 py-3 text-center min-w-[120px]">
            <p className="font-display text-2xl font-bold text-primary">
              {hotels.length}
            </p>
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
              ผลการค้นหา
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <HotelFilters cities={cities} amenities={amenities} />

      {/* Results */}
      {hotels.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            search_off
          </span>
          <h3 className="font-display text-xl mt-3">ไม่พบโรงแรมตามเงื่อนไข</h3>
          <p className="text-on-surface-variant mt-1">
            ลองปรับตัวกรองหรือเพิ่มช่วงราคา
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      )}
    </div>
  );
}
