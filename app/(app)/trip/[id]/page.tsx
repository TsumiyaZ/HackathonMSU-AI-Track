"use client";

import { useTripStore } from "@/lib/store";
import type { TripItem } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Cloud,
  CloudRain,
  Hotel,
  MapPin,
  PlaneTakeoff,
  Route,
  Sparkles,
  Sun,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";

type FilterKey = "all" | TripItem["type"];

type AlternativeItem = TripItem;

type WeatherInfo = {
  condition?: string;
  destination: string;
  recommendation: string;
  advice: string;
  temp: number;
};

type DayGroup = {
  day: number;
  label: string;
  subtotal: number;
  items: TripItem[];
};

type TypeMeta = {
  label: string;
  Icon: LucideIcon;
  accent: string;
  soft: string;
  border: string;
};

const TYPE_META: Record<TripItem["type"], TypeMeta> = {
  flight: {
    label: "เที่ยวบิน",
    Icon: PlaneTakeoff,
    accent: "text-blue-500",
    soft: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  hotel: {
    label: "ที่พัก",
    Icon: Hotel,
    accent: "text-indigo-500",
    soft: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  food: {
    label: "อาหาร",
    Icon: Utensils,
    accent: "text-amber-500",
    soft: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  activity: {
    label: "กิจกรรม",
    Icon: MapPin,
    accent: "text-emerald-500",
    soft: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "flight", label: "บิน" },
  { key: "hotel", label: "พัก" },
  { key: "food", label: "กิน" },
  { key: "activity", label: "เที่ยว" },
];

function extractDay(time: string): number {
  const match = time.match(/วันที่\s*(\d+)/);
  return match ? Number(match[1]) : 1;
}

function formatPrice(value: number): string {
  return `฿${value.toLocaleString()}`;
}

function buildDayGroups(items: TripItem[]): DayGroup[] {
  const grouped = new Map<number, TripItem[]>();

  for (const item of items) {
    const day = extractDay(item.time);
    grouped.set(day, [...(grouped.get(day) ?? []), item]);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, dayItems]) => ({
      day,
      label: `วันที่ ${day}`,
      subtotal: dayItems.reduce((sum, item) => sum + item.price, 0),
      items: dayItems,
    }));
}

function getItemHint(item: TripItem, destination: string): string {
  if (
    item.data &&
    typeof item.data === "object" &&
    "coordinates" in item.data &&
    item.data.coordinates &&
    typeof item.data.coordinates === "object" &&
    "lat" in item.data.coordinates &&
    "lng" in item.data.coordinates
  ) {
    return `${item.data.coordinates.lat}, ${item.data.coordinates.lng}`;
  }

  if (item.type === "flight") return `เส้นทางไปยัง ${destination}`;
  if (item.type === "hotel") return `จุดพักหลักใน ${destination}`;
  if (item.type === "food") return `โซนร้านอาหารใน ${destination}`;
  return `กิจกรรมใน ${destination}`;
}

export default function TripResultPage() {
  const trip = useTripStore((state) => state.currentTrip);
  const swapActivity = useTripStore((state) => state.swapActivity);
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState<TripItem | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    if (!trip) {
      router.replace("/plan");
      return;
    }

    fetch(`/api/weather?destination=${encodeURIComponent(trip.destination)}`)
      .then((r) => r.json())
      .then((d) => setWeather(d.weather))
      .catch(() => {});
  }, [trip, router]);

  const openSwapModal = async (item: TripItem) => {
    setSwapTarget(item);
    setIsModalOpen(true);
    setModalLoading(true);
    setAlternatives([]);

    try {
      const res = await fetch(`/api/alternatives?type=${item.type}`);
      const data = await res.json();
      if (data.success) setAlternatives(data.alternatives);
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSwapConfirm = (alt: AlternativeItem) => {
    if (swapTarget) {
      swapActivity(swapTarget.id, alt);
      setIsModalOpen(false);
      setSwapTarget(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSwapTarget(null);
  };

  const getWeatherIcon = (condition?: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-5 h-5 text-amber-400" />;
      case "rainy":
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case "cloudy":
      case "partly_cloudy":
        return <Cloud className="w-5 h-5 text-gray-400" />;
      default:
        return <Sun className="w-5 h-5 text-amber-400" />;
    }
  };

  const tripTypeCounts = useMemo(() => {
    if (!trip) {
      return {
        all: 0,
        flight: 0,
        hotel: 0,
        food: 0,
        activity: 0,
      };
    }

    return {
      all: trip.items.length,
      flight: trip.items.filter((item) => item.type === "flight").length,
      hotel: trip.items.filter((item) => item.type === "hotel").length,
      food: trip.items.filter((item) => item.type === "food").length,
      activity: trip.items.filter((item) => item.type === "activity").length,
    };
  }, [trip]);

  const filteredItems = useMemo(() => {
    if (!trip) return [];
    if (activeFilter === "all") return trip.items;
    return trip.items.filter((item) => item.type === activeFilter);
  }, [activeFilter, trip]);

  const filteredGroups = useMemo(() => buildDayGroups(filteredItems), [filteredItems]);
  const allGroups = useMemo(() => buildDayGroups(trip?.items ?? []), [trip]);
  const filteredTotal = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.price, 0),
    [filteredItems],
  );

  if (!trip) {
    return (
      <div className="p-12 text-center animate-pulse text-on-surface/50 font-label">
        กำลังโหลดข้อมูลทริป...
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-0 py-4 md:px-4 md:py-8">
      <div className="flex flex-col gap-4 pb-36 md:pb-8">
        <section className="glass-panel overflow-hidden rounded-[28px] border border-white/10">
          <div className="relative">
            <div className="absolute top-0 right-0 w-56 h-56 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 p-4 sm:p-5 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary mb-2">
                    AI Trip Architect
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-on-surface leading-tight">
                    ทริป {trip.destination}
                  </h1>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-2xl">
                    แผนเดินทางแบบพร้อมจอง เน้นดูง่ายบนมือถือและสลับตัวเลือกได้ทันทีในแต่ละช่วง
                  </p>
                </div>

                <Link
                  href="/plan"
                  className="shrink-0 hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-xs font-label font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  วางแผนใหม่
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-primary">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-label text-[10px] uppercase tracking-widest">ระยะเวลา</span>
                  </div>
                  <p className="mt-2 font-display text-lg font-black text-on-surface">{trip.days} วัน</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Route className="w-4 h-4" />
                    <span className="font-label text-[10px] uppercase tracking-widest">รายการ</span>
                  </div>
                  <p className="mt-2 font-display text-lg font-black text-on-surface">{trip.items.length} จุด</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Wallet className="w-4 h-4" />
                    <span className="font-label text-[10px] uppercase tracking-widest">รวมทั้งหมด</span>
                  </div>
                  <p className="mt-2 font-display text-lg font-black text-on-surface">
                    {formatPrice(trip.totalPrice)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-label text-[10px] uppercase tracking-widest">พร้อมจอง</span>
                  </div>
                  <p className="mt-2 font-display text-lg font-black text-on-surface">
                    {tripTypeCounts.flight + tripTypeCounts.hotel} รายการ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {weather && (
            <div className="glass-panel rounded-3xl border border-blue-500/15 p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-on-surface">
                    อากาศที่ {weather.destination}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    {weather.recommendation}
                  </p>
                  <p className="text-[11px] text-on-surface/60 mt-2">
                    {weather.advice} • {weather.temp}°C
                  </p>
                </div>
              </div>
            </div>
          )}

          {trip.sentimentSummary && (
            <div className="glass-panel rounded-3xl border border-primary/15 p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-on-surface">AI Insight</p>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    {trip.sentimentSummary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="glass-panel rounded-3xl border border-white/10 p-3 md:p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface">รายการเดินทาง</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                เลือกดูเฉพาะหมวดที่ต้องการเพื่อสแกนแผนได้เร็วขึ้นบนมือถือ
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="font-display text-lg font-black text-on-surface">{formatPrice(filteredTotal)}</p>
              <p className="text-[11px] text-on-surface-variant">
                {activeFilter === "all"
                  ? "ยอดรวมทั้งทริป"
                  : `ยอดรวมหมวด ${FILTERS.find((item) => item.key === activeFilter)?.label}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key;
              const count = tripTypeCounts[filter.key];

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-label font-bold transition-all ${
                    isActive
                      ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                      : "border-border bg-surface text-on-surface-variant"
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {filteredGroups.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-dashed border-border p-6 text-center">
              <p className="font-display text-lg font-bold text-on-surface">ยังไม่มีรายการในหมวดนี้</p>
              <p className="text-sm text-on-surface-variant mt-2">
                ลองสลับไปดูหมวดอื่นหรือกลับไปวางแผนใหม่เพื่อสร้างทริปอีกครั้ง
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.day} className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="font-display text-lg font-black text-on-surface">{group.label}</p>
                    <p className="text-xs text-on-surface-variant">
                      {group.items.length} รายการ • {formatPrice(group.subtotal)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {group.items.map((item) => {
                    const meta = TYPE_META[item.type];
                    const ItemIcon = meta.Icon;

                    return (
                      <article
                        key={item.id}
                        className="glass-panel rounded-[28px] border border-white/10 p-4 md:p-5 overflow-hidden"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${meta.border} ${meta.soft} ${meta.accent}`}
                          >
                            <ItemIcon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-label font-bold uppercase tracking-wider ${meta.soft} ${meta.accent}`}
                              >
                                {meta.label}
                              </span>
                              <span className="rounded-full bg-surface-container px-2.5 py-1 text-[10px] font-label font-bold text-on-surface-variant">
                                {item.time}
                              </span>
                            </div>

                            <div className="mt-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-display text-lg font-bold text-on-surface leading-snug">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-display text-lg font-black text-on-surface">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 rounded-2xl bg-surface-container/70 px-3 py-2.5">
                              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">{getItemHint(item, trip.destination)}</span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => openSwapModal(item)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-label font-bold text-on-surface hover:text-primary transition-colors sm:w-auto"
                              >
                                <AlertCircle className="w-4 h-4" />
                                สลับตัวเลือก
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>

        {allGroups.length > 0 && (
          <section className="glass-panel rounded-3xl border border-white/10 p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-on-surface">ภาพรวมเส้นทางทั้งทริป</h2>
            </div>

            <div className="flex flex-col gap-3">
              {allGroups.map((group) => (
                <div
                  key={group.day}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-bold text-on-surface">{group.label}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {group.items.length} รายการ • {formatPrice(group.subtotal)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item, index) => {
                      const meta = TYPE_META[item.type];
                      return (
                        <div
                          key={item.id}
                          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-label font-bold ${meta.soft} ${meta.border} ${meta.accent}`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5 text-[10px]">
                            {index + 1}
                          </span>
                          <span className="truncate max-w-[220px]">{item.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="hidden md:flex justify-center pt-2">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-secondary px-10 py-4 text-base font-display font-black text-white shadow-[0_10px_30px_rgba(22,102,219,0.28)] transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            ยืนยันและจองทริปทั้งหมด
          </Link>
        </div>
      </div>

      <div
        className="fixed inset-x-3 z-40 md:hidden"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <div className="glass-panel rounded-3xl border border-primary/15 bg-surface/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-label uppercase tracking-[0.22em] text-primary">
                พร้อมจอง
              </p>
              <p className="font-display text-lg font-black text-on-surface">
                {formatPrice(trip.totalPrice)}
              </p>
            </div>

            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-display font-black text-white shadow-[0_8px_24px_rgba(22,102,219,0.24)]"
            >
              จองทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {isModalOpen && swapTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={closeModal} />
          <div className="glass relative mt-auto w-full max-w-2xl rounded-t-[28px] md:mt-0 md:rounded-3xl overflow-hidden shadow-2xl border border-border/50 flex max-h-[82vh] flex-col">
            <div className="p-5 border-b border-border/50 flex items-start justify-between gap-3 bg-surface/80">
              <div className="min-w-0">
                <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary mb-1">
                  สลับตัวเลือก
                </p>
                <h3 className="text-lg md:text-2xl font-display font-bold text-on-surface">
                  {swapTarget.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-grow">
              {modalLoading ? (
                <div className="text-center py-12 animate-pulse text-on-surface/50 font-label">
                  กำลังค้นหาตัวเลือกที่ดีที่สุด...
                </div>
              ) : (
                <div className="space-y-3">
                  {alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      className="w-full rounded-2xl border border-border/50 bg-surface p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      onClick={() => handleSwapConfirm(alt)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-sm md:text-lg text-on-surface">
                            {alt.title}
                          </h4>
                          <p className="text-xs md:text-sm text-on-surface/70 mt-1 leading-relaxed">
                            {alt.description}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-display font-black text-sm md:text-lg text-primary">
                            {formatPrice(alt.price)}
                          </p>
                          <p className="text-[10px] md:text-xs text-primary/70 mt-1">
                            แตะเพื่อเลือก
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {alternatives.length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant">
                      ไม่มีตัวเลือกอื่นในหมวดหมู่นี้
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
