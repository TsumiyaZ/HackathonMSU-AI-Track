"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Chip } from "@/components/ui/Chip";
import { AIRLINE_COLORS } from "@/lib/flights";

type Props = {
  origins: string[];
  destinations: string[];
  airlines: string[];
};

export function FlightFilters({ origins, destinations, airlines }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const initial = useMemo(
    () => ({
      search: params.get("search") ?? "",
      origin: params.get("origin") ?? "",
      destination: params.get("destination") ?? "",
      airline: params.get("airline") ?? "",
      maxPrice: params.get("maxPrice") ?? "",
      sort: params.get("sort") ?? "",
    }),
    [params],
  );

  const [search, setSearch] = useState(initial.search);
  const [origin, setOrigin] = useState(initial.origin);
  const [destination, setDestination] = useState(initial.destination);
  const [airline, setAirline] = useState(initial.airline);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [sort, setSort] = useState(initial.sort);

  const push = useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
      }
      const qs = sp.toString();

      if (qs !== params.toString()) {
        startTransition(() => {
          router.push(qs ? `/explore/flights?${qs}` : "/explore/flights");
        });
      }
    },
    [router, params],
  );

  // Auto search on input change (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      push({
        search: search || undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        airline: airline || undefined,
        maxPrice: maxPrice || undefined,
        sort: sort || undefined,
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [search, origin, destination, airline, maxPrice, sort, push]);

  const reset = () => {
    setSearch("");
    setOrigin("");
    setDestination("");
    setAirline("");
    setMaxPrice("");
    setSort("");
    startTransition(() => router.push("/explore/flights"));
  };

  // Swap origin ↔ destination
  const swapRoute = () => {
    const tmpOrigin = origin;
    setOrigin(destination);
    setDestination(tmpOrigin);
  };

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
            placeholder="ค้นหาเที่ยวบิน, สายการบิน, รหัสสนามบิน..."
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
          <option value="departure_asc">วันเดินทาง เร็ว → ช้า</option>
          <option value="departure_desc">วันเดินทาง ช้า → เร็ว</option>
        </select>
      </div>

      {/* Route & filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            ต้นทาง
          </span>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          >
            <option value="">ทุกสนามบิน</option>
            {origins.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-center">
          <button
            onClick={swapRoute}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-primary hover:bg-primary/10 transition-colors mb-0.5"
            title="สลับต้นทาง-ปลายทาง"
          >
            <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            ปลายทาง
          </span>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          >
            <option value="">ทุกสนามบิน</option>
            {destinations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            งบประมาณสูงสุด (THB)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="เช่น 5000"
            className="glass-input rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider">
            สายการบิน
          </span>
          <div className="flex flex-wrap gap-2">
            {airlines.map((a) => {
              const active = airline === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAirline(active ? "" : a)}
                  className="focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Chip variant={active ? "primary" : "outline"}>{a}</Chip>
                </button>
              );
            })}
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
