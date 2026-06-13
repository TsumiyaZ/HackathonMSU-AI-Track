"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Chip } from "@/components/ui/Chip";

type Props = {
  cities: string[];
  amenities: string[];
};

export function HotelFilters({ cities, amenities }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  // Local state mirrors current query string so the inputs are controlled.
  const initial = useMemo(
    () => ({
      search: params.get("search") ?? "",
      city: params.get("city") ?? "",
      minStars: params.get("minStars") ?? "",
      maxPrice: params.get("maxPrice") ?? "",
      sort: params.get("sort") ?? "",
      amenities: (params.get("amenities") ?? "")
        .split(",")
        .filter(Boolean),
    }),
    [params],
  );

  const [search, setSearch] = useState(initial.search);
  const [city, setCity] = useState(initial.city);
  const [minStars, setMinStars] = useState(initial.minStars);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [sort, setSort] = useState(initial.sort);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initial.amenities,
  );

  const push = useCallback(
    (next: Record<string, string | string[] | undefined>) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (!v) continue;
        if (Array.isArray(v)) {
          if (v.length) sp.set(k, v.join(","));
        } else {
          sp.set(k, v);
        }
      }
      const qs = sp.toString();
      
      // Prevent infinite loops by checking if the query string actually changed
      if (qs !== params.toString()) {
        startTransition(() => {
          router.push(qs ? `/explore/hotels?${qs}` : "/explore/hotels");
        });
      }
    },
    [router, params],
  );

  // 2-way binding: Auto search when inputs change (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      push({
        search,
        city,
        minStars,
        maxPrice,
        sort,
        amenities: selectedAmenities,
      });
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [search, city, minStars, maxPrice, sort, selectedAmenities, push]);

  const reset = () => {
    setSearch("");
    setCity("");
    setMinStars("");
    setMaxPrice("");
    setSort("");
    setSelectedAmenities([]);
    startTransition(() => router.push("/explore/hotels"));
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((cur) =>
      cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a],
    );
  };

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const AMENITIES_LIMIT = 8;
  
  const displayedAmenities = useMemo(() => {
    if (showAllAmenities) return amenities;
    const base = amenities.slice(0, AMENITIES_LIMIT);
    // Ensure currently selected amenities are always visible even if collapsed
    const selectedNotIncluded = selectedAmenities.filter(a => !base.includes(a) && amenities.includes(a));
    return [...base, ...selectedNotIncluded];
  }, [amenities, showAllAmenities, selectedAmenities]);

  const hasMoreAmenities = amenities.length > AMENITIES_LIMIT;

  return (
    <div className="glass-panel-strong rounded-2xl p-5 flex flex-col gap-5">
      {/* Search row */}
      <div className="flex flex-col md:flex-row gap-3">
        <label className="glass-input rounded-xl flex items-center gap-2 px-4 py-2.5 flex-1">
          <span className="material-symbols-outlined text-primary text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาโรงแรม, เมือง, สไตล์..."
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-on-surface-variant/60"
          />
        </label>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="glass-input rounded-xl px-4 py-2.5 text-sm min-w-[180px] cursor-pointer"
        >
          <option value="">เรียงลำดับ</option>
          <option value="price_asc">ราคา ต่ำ → สูง</option>
          <option value="price_desc">ราคา สูง → ต่ำ</option>
          <option value="rating_desc">คะแนนสูงสุด</option>
          <option value="stars_desc">ดาวมากสุด</option>
        </select>
      </div>

      {/* Filters grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            เมือง
          </span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          >
            <option value="">ทั้งหมด</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            ดาวขั้นต่ำ
          </span>
          <select
            value={minStars}
            onChange={(e) => setMinStars(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          >
            <option value="">ไม่จำกัด</option>
            {[3, 4, 5].map((s) => (
              <option key={s} value={s}>
                {s}★ ขึ้นไป
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 col-span-2">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            ราคาสูงสุด/คืน (THB)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="เช่น 3000"
            className="glass-input rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
              สิ่งอำนวยความสะดวก
            </span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {displayedAmenities.map((a) => {
              const active = selectedAmenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className="focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Chip variant={active ? "primary" : "outline"}>{a}</Chip>
                </button>
              );
            })}
            
            {hasMoreAmenities && (
              <button
                type="button"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="text-[11px] font-label uppercase tracking-wider text-primary hover:text-primary/80 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-1"
              >
                {showAllAmenities ? (
                  <>แสดงน้อยลง <span className="material-symbols-outlined text-[14px]">expand_less</span></>
                ) : (
                  <>+ ดูเพิ่มอีก {amenities.length - AMENITIES_LIMIT} รายการ</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-border">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl bg-surface border border-border text-on-surface font-label text-sm hover:bg-surface-hover hover:border-primary/50 transition-all shadow-sm"
        >
          รีเซ็ต
        </button>
      </div>
    </div>
  );
}
