"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

type NavTile = {
  href: string;
  titleKey: "tileExplore" | "tileFlights" | "tilePlan" | "tileBookings" | "tileCheckout" | "tileProfile";
  descKey: "tileExploreDesc" | "tileFlightsDesc" | "tilePlanDesc" | "tileBookingsDesc" | "tileCheckoutDesc" | "tileProfileDesc";
  icon: string;
  ready: boolean;
};

const TILES: NavTile[] = [
  { href: "/explore", titleKey: "tileExplore", descKey: "tileExploreDesc", icon: "explore", ready: true },
  { href: "/explore/flights", titleKey: "tileFlights", descKey: "tileFlightsDesc", icon: "flight_takeoff", ready: true },
  { href: "/plan", titleKey: "tilePlan", descKey: "tilePlanDesc", icon: "auto_awesome", ready: true },
  { href: "/bookings", titleKey: "tileBookings", descKey: "tileBookingsDesc", icon: "event_available", ready: true },
  { href: "/checkout", titleKey: "tileCheckout", descKey: "tileCheckoutDesc", icon: "credit_card", ready: true },
  { href: "/profile", titleKey: "tileProfile", descKey: "tileProfileDesc", icon: "account_circle", ready: true },
];

export function FeatureGrid() {
  const lang = useLanguage();
  const t = TRANSLATIONS[lang];

  return (
    <section className="hidden sm:block px-4 md:px-12 pt-10 pb-24 md:pb-20 max-w-[1280px] mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
            {t.landingChoosePage}
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            {t.landingChoosePageDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={
              "group glass-panel rounded-2xl p-4 md:p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 " +
              (tile.ready
                ? "border border-primary/20 hover:border-primary/50"
                : "opacity-70 hover:opacity-100")
            }
          >
            <div className="flex items-center justify-between">
              <div
                className={
                  "w-10 h-10 rounded-xl flex items-center justify-center " +
                  (tile.ready ? "text-primary" : "text-on-surface-variant")
                }
                style={tile.ready ? { background: "rgba(24,119,242,0.10)" } : { background: "rgba(0,0,0,0.05)" }}
              >
                <span className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {tile.icon}
                </span>
              </div>
              <span
                className={
                  "font-label text-[10px] uppercase tracking-widest px-2 py-1 rounded-full " +
                  (tile.ready ? "text-primary" : "text-on-surface-variant")
                }
                style={tile.ready ? { background: "rgba(24,119,242,0.08)" } : { background: "rgba(0,0,0,0.04)" }}
              >
                {tile.ready ? t.landingReady : t.landingInDev}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
              {t[tile.titleKey]}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{t[tile.descKey]}</p>
            <div className="mt-auto pt-2 flex items-center gap-1 font-label text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {t.landingOpenPage}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
