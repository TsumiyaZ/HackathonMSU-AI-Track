import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Flight } from "@/lib/flights";
import { getAirportName, getFlightDuration, AIRLINE_COLORS } from "@/lib/flights";

const BAHT = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export function FlightCard({ flight }: { flight: Flight }) {
  const airlineColor = AIRLINE_COLORS[flight.airline] || "bg-primary/15 text-primary border-primary/30";
  const duration = getFlightDuration(flight.origin, flight.destination);
  const isDomestic = flight.price < 5000;

  return (
    <Link
      href={`/explore/flight/${flight.flight_id}`}
      className="group block focus:outline-none"
    >
      <GlassCard className="overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:ai-glow group-focus-visible:ai-glow group-hover:-translate-y-1">
        {/* Top bar with airline badge */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${airlineColor}`}>
            {flight.airline}
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-label uppercase tracking-wider ${isDomestic ? "bg-emerald-500/10 text-emerald-500" : "bg-violet-500/10 text-violet-500"}`}>
              {isDomestic ? "ภายในประเทศ" : "ระหว่างประเทศ"}
            </span>
            <span className="text-[10px] font-label text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-md">
              {flight.flight_id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Route visualization */}
        <div className="px-5 py-4 flex items-center gap-3">
          {/* Origin */}
          <div className="flex-1 text-center">
            <p className="font-display text-2xl font-black text-on-surface group-hover:text-primary transition-colors">
              {flight.origin}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
              {getAirportName(flight.origin)}
            </p>
            <p className="text-xs font-bold text-on-surface mt-1">
              {formatTime(flight.departure_time)}
            </p>
          </div>

          {/* Flight path */}
          <div className="flex-1 flex flex-col items-center px-2 relative">
            <span className="text-[10px] font-label text-on-surface-variant mb-1">
              {duration}
            </span>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 border-t border-dashed border-outline-variant relative">
                <span className="material-symbols-outlined text-[16px] text-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-0.5">
                  flight
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
            </div>
            <span className="text-[10px] font-label text-on-surface-variant mt-1">
              ตรง
            </span>
          </div>

          {/* Destination */}
          <div className="flex-1 text-center">
            <p className="font-display text-2xl font-black text-primary">
              {flight.destination}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
              {getAirportName(flight.destination)}
            </p>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-auto px-5 py-4 flex items-end justify-between border-t border-border">
          <div>
            <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">
              วันออกเดินทาง
            </p>
            <p className="text-sm font-semibold text-on-surface mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
              {formatDate(flight.departure_time)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">
              ราคา/ท่าน
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {BAHT.format(flight.price)}
            </p>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
