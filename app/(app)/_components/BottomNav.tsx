"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "หน้าหลัก", icon: "home" },
  { href: "/explore", label: "สำรวจ", icon: "explore" },
  { href: "/plan", label: "วางแผน", icon: "auto_awesome" },
  { href: "/bookings", label: "การจอง", icon: "event_available" },
  { href: "/profile", label: "โปรไฟล์", icon: "account_circle" },
];

export function BottomNav({ onOpenChat }: { onOpenChat: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/home"
            ? pathname === "/home"
            : pathname.startsWith(item.href);
        const isPlan = item.href === "/plan";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${isActive ? " active" : ""}${isPlan ? " bottom-nav-cta" : ""}`}
            aria-label={item.label}
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
                <span className="bottom-nav-label">{item.label}</span>
                {isActive && <span className="bottom-nav-dot" />}
              </>
            )}
          </Link>
        );
      })}

      {/* Chat FAB — fixed bottom-right, outside the nav flow */}
      <button
        onClick={onOpenChat}
        aria-label="เปิดแชท Travel Buddy"
        className="fixed bottom-[72px] right-4 z-50 w-12 h-12 rounded-full btn-primary-gradient shadow-xl flex items-center justify-center active:scale-90 transition-transform"
        style={{ boxShadow: "0 4px 20px rgba(22,102,219,0.35)" }}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
        >
          forum
        </span>
      </button>
    </nav>
  );
}
