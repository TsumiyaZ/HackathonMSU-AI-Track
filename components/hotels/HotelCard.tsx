import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { StarRating } from "@/components/ui/StarRating";
import type { Hotel } from "@/lib/types";

const BAHT = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/explore/hotel/${hotel.id}`}
      className="group block focus:outline-none"
    >
      <GlassCard className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:ai-glow group-focus-visible:ai-glow group-hover:-translate-y-1">
        <div
          className="relative h-44 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${hotel.thumbnail_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          
          <div className="absolute bottom-3 right-3">
            <span className="glass-panel px-3 py-1 rounded-full font-label text-xs text-on-surface">
              {hotel.rooms_available} ห้องว่าง
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                {hotel.name}
              </h3>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  location_on
                </span>
                {hotel.city}, {hotel.country}
              </p>
            </div>
            <StarRating value={hotel.stars} size={14} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {hotel.tags.slice(0, 3).map((t) => (
              <Chip key={t} variant="glass">
                {t}
              </Chip>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between pt-2 border-t border-white/5">
            <div>
              <p className="text-[11px] font-label text-on-surface-variant uppercase tracking-wider">
                ราคา/คืน
              </p>
              <p className="font-display text-lg font-bold text-on-surface">
                {BAHT.format(hotel.price_per_night_thb)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-label text-on-surface-variant uppercase tracking-wider">
                คะแนน
              </p>
              <p className="font-display text-lg font-bold text-primary">
                {hotel.rating_avg.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
