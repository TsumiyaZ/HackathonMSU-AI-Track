"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Hotel, Plane, Search, TicketCheck } from "lucide-react";

type BookingType = "โรงแรม" | "เที่ยวบิน";
type ActiveView = "all" | "hotels" | "flights";

interface Booking {
  id: string;
  type: BookingType;
  title: string;
  subtitle: string;
  date: string;
  price: number;
  status: string;
  href: string;
}

interface BookingsClientProps {
  hotelBookings: Booking[];
  flightBookings: Booking[];
}

const BAHT = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const statusStyle: Record<string, string> = {
  CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ISSUED: "bg-primary/10 text-primary border-primary/20",
  CHECKED_IN: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  BOARDED: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  CHECKED_OUT: "bg-white/10 text-on-surface-variant border-white/10",
  PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-300 border-red-500/20",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function matchesQuery(booking: Booking, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  return [booking.id, booking.title, booking.subtitle, booking.status]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

function EmptyState({ type }: { type: BookingType }) {
  const isFlight = type === "เที่ยวบิน";
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-on-surface-variant">
        {isFlight ? <Plane className="h-6 w-6" /> : <Hotel className="h-6 w-6" />}
      </div>
      <p className="font-display text-lg font-bold text-on-surface">
        ยังไม่มีประวัติการจอง{type}
      </p>
      <p className="mt-1 text-sm text-on-surface-variant">
        {isFlight ? "จองเที่ยวบินแล้วรายการจะมาอยู่ในหมวดนี้ทันที" : "จองโรงแรมแล้วรายการจะมาอยู่ในหมวดนี้ทันที"}
      </p>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const isFlight = booking.type === "เที่ยวบิน";
  const Icon = isFlight ? Plane : Hotel;

  return (
    <Link
      href={booking.href}
      className="group flex min-h-[112px] flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-primary/35 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 sm:flex-row sm:items-center"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-on-surface">
            {booking.type}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              statusStyle[booking.status] ?? "bg-white/5 text-on-surface-variant border-white/10"
            }`}
          >
            {booking.status}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
          {booking.title}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">{booking.subtitle}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
          <CalendarDays className="h-4 w-4" />
          {formatDate(booking.date)}
        </p>
      </div>

      <div className="flex items-end justify-between gap-4 sm:block sm:text-right">
        <div>
          <p className="text-xs text-on-surface-variant">ยอดชำระ</p>
          <p className="font-display text-xl font-bold text-primary">{BAHT.format(booking.price)}</p>
        </div>
        <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-on-surface transition-colors group-hover:border-primary/30 group-hover:text-primary">
          ดูรายละเอียด
        </span>
      </div>
    </Link>
  );
}

function BookingSection({
  title,
  description,
  type,
  bookings,
}: {
  title: string;
  description: string;
  type: BookingType;
  bookings: Booking[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-on-surface-variant">
          {bookings.length} รายการ
        </span>
      </div>

      {bookings.length === 0 ? (
        <EmptyState type={type} />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function BookingsClient({
  hotelBookings,
  flightBookings,
}: BookingsClientProps) {
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("all");

  const filteredHotels = useMemo(
    () => hotelBookings.filter((booking) => matchesQuery(booking, search)),
    [hotelBookings, search]
  );
  const filteredFlights = useMemo(
    () => flightBookings.filter((booking) => matchesQuery(booking, search)),
    [flightBookings, search]
  );

  const totalCount = hotelBookings.length + flightBookings.length;
  const totalFiltered = filteredHotels.length + filteredFlights.length;

  const tabs: { id: ActiveView; label: string; count: number }[] = [
    { id: "all", label: "ทั้งหมด", count: totalCount },
    { id: "hotels", label: "โรงแรม", count: hotelBookings.length },
    { id: "flights", label: "เที่ยวบิน", count: flightBookings.length },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel-strong rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[520px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-on-surface-variant">ทั้งหมด</p>
              <p className="font-display text-3xl font-black text-on-surface">{totalCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-on-surface-variant">โรงแรม</p>
              <p className="font-display text-3xl font-black text-on-surface">{hotelBookings.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-on-surface-variant">เที่ยวบิน</p>
              <p className="font-display text-3xl font-black text-primary">{flightBookings.length}</p>
            </div>
          </div>

          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="ค้นหาโรงแรม สายการบิน รหัสจอง หรือสถานะ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="glass-input min-h-12 w-full rounded-xl py-3 pl-12 pr-4 outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="ประเภทประวัติการจอง">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeView === tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`min-h-11 rounded-xl px-4 text-sm font-bold transition-colors ${
                activeView === tab.id
                  ? "bg-primary text-black"
                  : "border border-white/10 bg-white/5 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {totalFiltered === 0 ? (
        <div className="glass-panel-strong rounded-3xl p-10 text-center">
          <TicketCheck className="mx-auto mb-4 h-12 w-12 text-on-surface-variant" />
          <p className="font-display text-xl font-bold text-on-surface">ไม่พบข้อมูลการจอง</p>
          <p className="mt-1 text-sm text-on-surface-variant">ลองเปลี่ยนคำค้นหา หรือเลือกดูอีกประเภทหนึ่ง</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(activeView === "all" || activeView === "flights") && (
            <BookingSection
              title="ประวัติการจองเที่ยวบิน"
              description="ตั๋วเครื่องบินที่จองไว้ แยกออกจากรายการโรงแรม"
              type="เที่ยวบิน"
              bookings={filteredFlights}
            />
          )}

          {(activeView === "all" || activeView === "hotels") && (
            <BookingSection
              title="ประวัติการจองโรงแรม"
              description="รายการที่พักและวันเข้าพักทั้งหมดของคุณ"
              type="โรงแรม"
              bookings={filteredHotels}
            />
          )}
        </div>
      )}
    </div>
  );
}
