import Link from "next/link";
import {
  CalendarCheck2,
  Compass,
  CreditCard,
  PlaneTakeoff,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { TRANSLATIONS } from "@/lib/translations";

type NavTile = {
  href: string;
  titleKey: "tileExplore" | "tileFlights" | "tilePlan" | "tileBookings" | "tileCheckout" | "tileProfile";
  descKey: "tileExploreDesc" | "tileFlightsDesc" | "tilePlanDesc" | "tileBookingsDesc" | "tileCheckoutDesc" | "tileProfileDesc";
  icon: LucideIcon;
  ready: boolean;
};

const TILES: NavTile[] = [
  { href: "/explore", titleKey: "tileExplore", descKey: "tileExploreDesc", icon: Compass, ready: true },
  { href: "/explore/flights", titleKey: "tileFlights", descKey: "tileFlightsDesc", icon: PlaneTakeoff, ready: true },
  { href: "/plan", titleKey: "tilePlan", descKey: "tilePlanDesc", icon: Sparkles, ready: true },
  { href: "/bookings", titleKey: "tileBookings", descKey: "tileBookingsDesc", icon: CalendarCheck2, ready: true },
  { href: "/checkout", titleKey: "tileCheckout", descKey: "tileCheckoutDesc", icon: CreditCard, ready: true },
  { href: "/profile", titleKey: "tileProfile", descKey: "tileProfileDesc", icon: UserRound, ready: true },
];

export function FeatureGrid() {
  const t = TRANSLATIONS.th;

  return (
    <section className="mx-auto hidden max-w-[1280px] px-4 pb-24 pt-10 sm:block md:px-12 md:pb-20">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface md:text-2xl">{t.landingChoosePage}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t.landingChoosePageDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
        {TILES.map((tile) => {
          const Icon = tile.icon;

          return (
            <Link
              key={tile.href}
              href={tile.href}
              className={
                "group glass-panel flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 md:p-6 " +
                (tile.ready ? "border-primary/20 hover:border-primary/50" : "opacity-70 hover:opacity-100")
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-2xl " +
                    (tile.ready ? "bg-primary/10 text-primary" : "bg-black/5 text-on-surface-variant")
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={
                    "rounded-full px-2 py-1 font-label text-[10px] uppercase tracking-widest " +
                    (tile.ready ? "bg-primary/8 text-primary" : "bg-black/5 text-on-surface-variant")
                  }
                >
                  {tile.ready ? t.landingReady : t.landingInDev}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold text-on-surface transition-colors group-hover:text-primary">
                {t[tile.titleKey]}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{t[tile.descKey]}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
