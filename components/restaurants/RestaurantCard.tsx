"use client";

import { UtensilsCrossed, Star, Clock } from "lucide-react";
import Link from "next/link";
import { useTripStore } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

export interface Restaurant {
  res_id: string;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time_min: number;
  description?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const lang = useTripStore((s) => s.lang);
  const t = TRANSLATIONS[lang];

  return (
    <div className="glass-panel p-0 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 overflow-hidden flex flex-col group h-full">
      {/* Thumbnail / Decorative Background */}
      <div className="h-40 bg-gradient-to-tr from-emerald-950/35 to-surface flex items-center justify-center relative select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_100%)]" />
        <UtensilsCrossed className="w-12 h-12 text-emerald-500/20 group-hover:scale-110 transition-transform duration-500" />
        
        {/* Rating tag */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/5">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold">{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-display text-lg font-bold line-clamp-1 text-on-surface group-hover:text-emerald-400 transition-colors mb-2">
          {restaurant.name}
        </h3>
        
        <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit mb-4">
          {restaurant.cuisine}
        </p>

        <p className="text-xs text-on-surface-variant/70 leading-relaxed mb-6 line-clamp-2">
          {restaurant.description || (lang === 'th' ? "ร้านอาหารยอดนิยมที่ผ่านการเลือกสรรมาเป็นอย่างดี" : "Highly recommended and carefully selected popular dining option.")}
        </p>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-on-surface-variant/70" />
            <span>
              {lang === 'th' ? `รออาหาร ~${restaurant.delivery_time_min} นาที` : `Wait time ~${restaurant.delivery_time_min} min`}
            </span>
          </div>
          
          <Link
            href={`/explore/restaurant/${restaurant.res_id}`}
            className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
          >
            {lang === 'th' ? "ดูรายละเอียด" : "View Details"}
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
