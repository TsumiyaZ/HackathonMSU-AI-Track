"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useLanguage } from "@/lib/store";


type Props = {
  cuisines: string[];
};

export function RestaurantFilters({ cuisines }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const lang = useLanguage();

  // Collapsible toggle state (hidden by default)
  const [showFilters, setShowFilters] = useState(false);

  // Local state mirrors current query string
  const initial = useMemo(
    () => ({
      search: params.get("search") ?? "",
      cuisine: params.get("cuisine") ?? "",
      minRating: params.get("minRating") ?? "",
      maxTime: params.get("maxTime") ?? "",
      sort: params.get("sort") ?? "",
    }),
    [params],
  );

  const [search, setSearch] = useState(initial.search);
  const [cuisine, setCuisine] = useState(initial.cuisine);
  const [minRating, setMinRating] = useState(initial.minRating);
  const [maxTime, setMaxTime] = useState(initial.maxTime);
  const [sort, setSort] = useState(initial.sort);

  const push = useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (!v) continue;
        sp.set(k, v);
      }
      const qs = sp.toString();
      
      if (qs !== params.toString()) {
        startTransition(() => {
          router.push(qs ? `/explore/restaurants?${qs}` : "/explore/restaurants");
        });
      }
    },
    [router, params],
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      push({
        search,
        cuisine,
        minRating,
        maxTime,
        sort,
      });
    }, 400);
    return () => clearTimeout(handler);
  }, [search, cuisine, minRating, maxTime, sort, push]);

  const reset = () => {
    setSearch("");
    setCuisine("");
    setMinRating("");
    setMaxTime("");
    setSort("");
    startTransition(() => router.push("/explore/restaurants"));
  };

  return (
    <div className="glass-panel-strong rounded-2xl p-5 flex flex-col gap-4">
      {/* Search row with main search, sort, and toggle button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="glass-input rounded-xl flex items-center gap-2 px-4 py-2.5 flex-1">
          <span className="material-symbols-outlined text-primary text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'th' ? "ค้นหาร้านอาหาร, ประเภท..." : "Search restaurants, cuisines..."}
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-on-surface-variant/60"
          />
        </label>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="glass-input rounded-xl px-4 py-2.5 text-sm min-w-[150px] cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="">{lang === 'th' ? "เรียงลำดับ" : "Sort By"}</option>
            <option value="rating">{lang === 'th' ? "คะแนนสูงสุด" : "Highest Rating"}</option>
            <option value="time">{lang === 'th' ? "บริการรวดเร็วสุด" : "Fastest Delivery"}</option>
            <option value="name">{lang === 'th' ? "ชื่อร้าน A-Z" : "Name A-Z"}</option>
          </select>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              showFilters
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            {showFilters ? (lang === 'th' ? "ซ่อนตัวกรอง" : "Hide Filters") : (lang === 'th' ? "ตัวกรอง" : "Filters")}
          </button>
        </div>
      </div>

      {/* Collapsible filters block */}
      {showFilters && (
        <div className="flex flex-col gap-5 pt-4 border-t border-border/40 animate-fade-in">
          {/* Filters grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
                {lang === 'th' ? "ประเภทอาหาร" : "Cuisine"}
              </span>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-sm cursor-pointer"
              >
                <option value="">{lang === 'th' ? "ทั้งหมด" : "All"}</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
                {lang === 'th' ? "คะแนนรีวิวขั้นต่ำ" : "Min Rating"}
              </span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-sm cursor-pointer"
              >
                <option value="">{lang === 'th' ? "ไม่จำกัด" : "Any"}</option>
                {[3, 4, 4.5].map((s) => (
                  <option key={s} value={s}>
                    {s}★ {lang === 'th' ? "ขึ้นไป" : "& up"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
              <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
                {lang === 'th' ? "ระยะเวลารออาหารสูงสุด (นาที)" : "Max Wait Time (mins)"}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                placeholder={lang === 'th' ? "เช่น 30" : "e.g. 30"}
                className="glass-input rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-border">
            <button
              onClick={reset}
              className="px-5 py-2 rounded-xl bg-surface border border-border text-on-surface font-label text-sm hover:bg-surface-hover hover:border-primary/50 transition-all shadow-sm"
            >
              {lang === 'th' ? "รีเซ็ต" : "Reset"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
