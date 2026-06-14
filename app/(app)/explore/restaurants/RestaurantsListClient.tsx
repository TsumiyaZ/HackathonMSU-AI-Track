"use client";

import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { useTripStore } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";
import { RestaurantFilters } from "@/components/restaurants/RestaurantFilters";
import { RestaurantCard, Restaurant } from "@/components/restaurants/RestaurantCard";

interface RestaurantsListClientProps {
  restaurants: Restaurant[];
  cuisines: string[];
}

export default function RestaurantsListClient({
  restaurants,
  cuisines,
}: RestaurantsListClientProps) {
  const lang = useTripStore((s) => s.lang);
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Hero header */}
      <section className="glass-panel-strong rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <Link
            href="/explore"
            className="font-label text-xs text-primary hover:underline mb-3 inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            {lang === 'th' ? "กลับหน้า Explore" : "Back to Explore"}
          </Link>
          <p className="font-label text-xs text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">restaurant</span>
            {lang === 'th' ? "ค้นหาร้านอาหาร" : "Search Restaurants"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface">
            {lang === 'th' ? (
              <>
                ค้นพบ <span className="text-gradient">ร้านอร่อยและคาเฟ่เด็ด</span>
              </>
            ) : (
              <>
                Discover <span className="text-gradient">Great Dining & Cafes</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-on-surface-variant max-w-xl">
            {lang === 'th'
              ? "รวบรวมร้านอาหารเด็ด คาเฟ่ชิคๆ และร้านอร่อยยอดนิยมที่ตอบโจทย์ทุกไลฟ์สไตล์การกินของคุณ"
              : "Explore selected local restaurants, trendy cafes, and top-rated eateries for any dining preference."}
          </p>
        </div>
        <div className="relative flex items-center gap-3">
          <div className="glass-panel rounded-xl px-4 py-3 text-center min-w-[120px]">
            <p className="font-display text-2xl font-bold text-emerald-400">
              {restaurants.length}
            </p>
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
              {lang === 'th' ? "ผลการค้นหา" : "Results Found"}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <RestaurantFilters cuisines={cuisines} />

      {/* Results */}
      {restaurants.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            search_off
          </span>
          <h3 className="font-display text-xl mt-3">
            {lang === 'th' ? "ไม่พบร้านอาหารตามเงื่อนไข" : "No Restaurants Found"}
          </h3>
          <p className="text-on-surface-variant mt-1">
            {lang === 'th' ? "ลองปรับตัวกรองหรือใช้คำค้นหาอื่น" : "Try modifying your filters or search terms."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((res) => (
            <RestaurantCard key={res.res_id} restaurant={res} />
          ))}
        </div>
      )}
    </div>
  );
}
