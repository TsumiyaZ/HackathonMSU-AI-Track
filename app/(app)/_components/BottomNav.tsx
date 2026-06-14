"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

type NavItem = { href: string; label: string; icon: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "หน้าหลัก", icon: "home" },
  { href: "/explore", label: "สำรวจ", icon: "explore" },
  { href: "/plan", label: "วางแผน", icon: "auto_awesome" },
  { href: "/bookings", label: "การจอง", icon: "event_available" },
  { href: "/profile", label: "โปรไฟล์", icon: "account_circle" },
];

export function BottomNav() {
  const pathname = usePathname();
  const lang = useTripStore((s) => s.lang);
  const t = TRANSLATIONS[lang];

  const labelMap: Record<string, string> = {
    "/home": t.navHome,
    "/explore": t.navExplore,
    "/plan": t.navPlan,
    "/bookings": t.navBookings,
    "/profile": t.navProfile,
  };

  return (
    <nav className="bottom-nav md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/home"
            ? pathname === "/home"
            : pathname.startsWith(item.href);
        const isPlan = item.href === "/plan";

        const localizedLabel = labelMap[item.href] || item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${isActive ? " active" : ""}${isPlan ? " bottom-nav-cta" : ""}`}
            aria-label={localizedLabel}
          >
            {isPlan ? (
              <div className="bottom-nav-cta-bubble">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
              </div>
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "22px",
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="bottom-nav-label">{localizedLabel}</span>
                {isActive && <span className="bottom-nav-dot" />}
              </>
            )}
          </Link>
        );
      })}


    </nav>
  );
}
