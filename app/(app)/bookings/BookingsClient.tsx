"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTripStore } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

interface Booking {
  id: string;
  type: string;
  title: string;
  date: string;
  price: number;
  status: string;
}

export default function BookingsClient({ initialData }: { initialData: Booking[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const router = useRouter();
  const lang = useTripStore((s) => s.lang);
  const t = TRANSLATIONS[lang];

  const filtered = initialData.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || b.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-3xl font-black mb-2">{t.bookingsTitle}</h1>
      <p className="text-on-surface-variant mb-8">{t.bookingsDesc}</p>

      <div className="glass-panel-strong p-5 rounded-3xl flex flex-col gap-5">
        {/* Search & Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="glass-input rounded-xl flex items-center gap-2 px-4 py-2.5 flex-1">
            <span className="material-symbols-outlined text-primary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder={t.bookingSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-on-surface-variant/60"
            />
          </label>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="glass-input rounded-xl px-4 py-2.5 text-sm min-w-[140px] cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="all">{t.bookingAllTypes}</option>
              <option value="โรงแรม">{t.bookingHotel}</option>
              <option value="เที่ยวบิน">{t.bookingFlight}</option>
            </select>
          </div>
        </div>

        {/* Desktop view - Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-on-surface-variant text-sm">
                <th className="pb-4 pl-4 font-medium">Booking ID</th>
                <th className="pb-4 font-medium">{t.bookingDetails}</th>
                <th className="pb-4 font-medium">{t.bookingType}</th>
                <th className="pb-4 font-medium">{t.bookingDate}</th>
                <th className="pb-4 font-medium text-right">{t.bookingPrice}</th>
                <th className="pb-4 pr-4 font-medium text-right">{t.bookingStatus}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    {t.bookingNoData}
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => router.push(`/bookings/${b.id}`)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-hover/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-4 font-mono text-sm text-primary group-hover:text-primary/80 transition-colors">
                      {b.id}
                    </td>
                    <td className="py-4 font-medium text-on-surface group-hover:text-primary transition-colors">
                      {b.title}
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold border border-border/60 bg-surface/55">
                        {b.type === "โรงแรม" ? t.bookingHotel : t.bookingFlight}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">
                          calendar_month
                        </span>
                        {new Date(b.date).toLocaleDateString(lang === 'th' ? "th-TH" : "en-US")}
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono font-medium text-on-surface">
                      ฿{b.price.toLocaleString()}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view - Cards List (Hidden on Desktop) */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-on-surface-variant text-sm">
              {t.bookingNoData}
            </div>
          ) : (
            filtered.map((b) => (
              <Link
                href={`/bookings/${b.id}`}
                key={b.id}
                className="glass-panel rounded-2xl p-4 flex flex-col gap-3.5 border border-border/80 hover:border-primary/45 transition-all duration-300 group"
              >
                {/* Top info: Status & ID */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary font-bold">{b.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      b.status === "CONFIRMED"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Title & Type */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      {b.type === "โรงแรม" ? "hotel" : "flight"}
                    </span>
                    <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">
                      {b.type === "โรงแรม" ? t.bookingHotel : t.bookingFlight}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">
                    {b.title}
                  </h3>
                </div>

                {/* Middle row: Date & Price */}
                <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">
                      calendar_month
                    </span>
                    <span>{new Date(b.date).toLocaleDateString(lang === 'th' ? "th-TH" : "en-US")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-on-surface-variant/70 block uppercase tracking-wider">{t.bookingPrice}</span>
                    <span className="font-display text-sm font-bold text-on-surface">
                      ฿{b.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action link indicator */}
                <div className="flex items-center justify-end text-[10px] font-bold text-primary gap-0.5 group-hover:translate-x-0.5 transition-transform duration-300">
                  <span>{t.bookingMoreDetails}</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
