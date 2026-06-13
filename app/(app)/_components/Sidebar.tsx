"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const PRIMARY: Item[] = [
  { href: "/", label: "หน้าหลัก", icon: "home" },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/plan", label: "วางแผน", icon: "auto_awesome" },
  { href: "/explore/hotels", label: "Explore", icon: "explore" },
  { href: "/bookings", label: "การจอง", icon: "event_available" },
  { href: "/chat", label: "Travel Buddy", icon: "forum" },
  { href: "/checkout", label: "ชำระเงิน", icon: "credit_card" },
  { href: "/profile", label: "โปรไฟล์", icon: "account_circle" },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <nav className={`transition-all duration-300 fixed left-0 top-0 h-full bg-surface-container/30 backdrop-blur-2xl border-r border-white/10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex-col py-8 z-40 hidden md:flex overflow-hidden ${isOpen ? "w-64" : "w-20"}`}>
      <div className={`px-6 mb-8 flex items-center ${isOpen ? "gap-4" : "justify-center px-0"}`}>
        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center ai-glow">
          <span className="material-symbols-outlined text-background" style={{ fontVariationSettings: "'FILL' 1" }}>
            smart_toy
          </span>
        </div>
        <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
          <h1 className="font-display text-lg font-black text-gradient leading-tight">
            Trip Architect
          </h1>
          <p className="font-label text-[11px] text-on-surface-variant">
            Navigating the Nebula
          </p>
        </div>
      </div>

      <div className={`px-4 mb-8 transition-all duration-300 ${isOpen ? "" : "px-2"}`}>
        <Link
          href="/plan"
          className={`w-full py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform ${isOpen ? "" : "px-0"}`}
          title={!isOpen ? "สร้างทริปใหม่" : undefined}
        >
          <span className="material-symbols-outlined text-background text-[20px]">add</span>
          <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"}`}>
            สร้างทริปใหม่
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1 font-label text-sm">
        {PRIMARY.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? `flex items-center gap-3 bg-primary/15 text-primary border-r-4 border-primary py-3 transition-all duration-200 ${isOpen ? "px-6" : "px-0 justify-center"}`
                  : `flex items-center gap-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface py-3 transition-all duration-200 ${isOpen ? "px-6" : "px-0 justify-center"}`
              }
              title={!isOpen ? item.label : undefined}
            >
              <span
                className="material-symbols-outlined text-[20px] shrink-0"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto font-label text-sm">
        <a
          className={`flex items-center gap-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface py-3 transition-all duration-200 ${isOpen ? "px-6" : "px-0 justify-center"}`}
          href="#"
          title={!isOpen ? "ความช่วยเหลือ" : undefined}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">help_outline</span>
          <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
            ความช่วยเหลือ
          </span>
        </a>
      </div>
    </nav>
  );
}
