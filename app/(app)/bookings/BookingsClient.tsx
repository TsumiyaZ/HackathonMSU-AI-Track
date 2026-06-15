"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

interface Booking {
  id: string;
  subtitle?: string;
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
  const lang = useLanguage();
  const t = TRANSLATIONS[lang];
  const bookingFoodLabel = (t as any).bookingFood || "Food";

  const filtered = initialData.filter((booking) => {
    const matchSearch =
      booking.title.toLowerCase().includes(search.toLowerCase()) ||
      booking.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
      booking.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || booking.type === filterType;
    return matchSearch && matchType;
  });

  const bookingCounts = initialData.reduce(
    (acc, booking) => {
      acc.all += 1;
      if (booking.type === "hotel") acc.hotel += 1;
      if (booking.type === "flight") acc.flight += 1;
      if (booking.type === "food") acc.food += 1;
      return acc;
    },
    { all: 0, hotel: 0, flight: 0, food: 0 },
  );

  const getBookingTypeLabel = (type: string) => {
    if (type === "hotel") return t.bookingHotel;
    if (type === "flight") return t.bookingFlight;
    return bookingFoodLabel;
  };

  const getBookingTypeIcon = (type: string) => {
    if (type === "hotel") return "hotel";
    if (type === "flight") return "flight";
    return "restaurant";
  };

  const getStatusClassName = (status: string) => {
    if (["CONFIRMED", "CHECKED_IN", "ISSUED", "BOARDED", "DELIVERED", "PICKED_UP"].includes(status)) {
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }

    if (["PENDING", "COOKING"].includes(status)) {
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }

    if (["CANCELLED"].includes(status)) {
      return "bg-red-500/10 text-red-500 border-red-500/20";
    }

    return "bg-surface/70 text-on-surface-variant border-border/60";
  };

  const formatBookingDate = (date: string) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString(lang === "th" ? "th-TH" : "en-US");
  };

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-3xl font-black mb-2">{t.bookingsTitle}</h1>
      <p className="text-on-surface-variant mb-8">{t.bookingsDesc}</p>

      <div className="glass-panel-strong p-5 rounded-3xl flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: t.bookingAllTypes, value: bookingCounts.all },
            { key: "hotel", label: t.bookingHotel, value: bookingCounts.hotel },
            { key: "flight", label: t.bookingFlight, value: bookingCounts.flight },
            { key: "food", label: bookingFoodLabel, value: bookingCounts.food },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilterType(item.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                filterType === item.key
                  ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
                  : "border-border/70 bg-surface/65 text-on-surface-variant hover:border-primary/30 hover:text-primary"
              }`}
            >
              {item.label} · {item.value}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="glass-input rounded-xl flex items-center gap-2 px-4 py-2.5 flex-1">
            <span className="material-symbols-outlined text-primary text-[20px]">search</span>
            <input
              type="text"
              placeholder={t.bookingSearchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-on-surface-variant/60"
            />
          </label>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className="glass-input rounded-xl px-4 py-2.5 text-sm min-w-[140px] cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="all">{t.bookingAllTypes}</option>
              <option value="hotel">{t.bookingHotel}</option>
              <option value="flight">{t.bookingFlight}</option>
              <option value="food">{bookingFoodLabel}</option>
            </select>
          </div>
        </div>

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
                filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-hover/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-4 font-mono text-sm text-primary group-hover:text-primary/80 transition-colors">
                      {booking.id}
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-on-surface group-hover:text-primary transition-colors">
                        {booking.title}
                      </div>
                      {booking.subtitle ? (
                        <div className="mt-1 text-xs text-on-surface-variant">
                          {booking.subtitle}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold border border-border/60 bg-surface/55">
                        {getBookingTypeLabel(booking.type)}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">
                          calendar_month
                        </span>
                        {formatBookingDate(booking.date)}
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono font-medium text-on-surface">
                      ฿{booking.price.toLocaleString()}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusClassName(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-on-surface-variant text-sm">
              {t.bookingNoData}
            </div>
          ) : (
            filtered.map((booking) => (
              <Link
                href={`/bookings/${booking.id}`}
                key={booking.id}
                className="glass-panel rounded-2xl p-4 flex flex-col gap-3.5 border border-border/80 hover:border-primary/45 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary font-bold">{booking.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClassName(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      {getBookingTypeIcon(booking.type)}
                    </span>
                    <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">
                      {getBookingTypeLabel(booking.type)}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">
                    {booking.title}
                  </h3>
                  {booking.subtitle ? (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {booking.subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">
                      calendar_month
                    </span>
                    <span>{formatBookingDate(booking.date)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-on-surface-variant/70 block uppercase tracking-wider">
                      {t.bookingPrice}
                    </span>
                    <span className="font-display text-sm font-bold text-on-surface">
                      ฿{booking.price.toLocaleString()}
                    </span>
                  </div>
                </div>

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
