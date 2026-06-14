"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: string };

const PRIMARY: Item[] = [
  { href: "/home", label: "หน้าหลัก", icon: "home" },
  { href: "/plan", label: "วางแผน", icon: "auto_awesome" },
  { href: "/explore", label: "Explore", icon: "explore" },
  { href: "/bookings", label: "การจอง", icon: "event_available" },
  { href: "/checkout", label: "ชำระเงิน", icon: "credit_card" },
  { href: "/profile", label: "โปรไฟล์", icon: "account_circle" },
];

const ADMIN_ITEM: Item = { href: "/admin", label: "Admin", icon: "shield" };

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check-session")
      .then(r => r.json())
      .then(d => { if (d.user?.role === 'ADMIN') setIsAdmin(true); })
      .catch(() => {});
  }, []);

  return (
    /* Desktop-only sidebar — hidden on mobile via 'hidden md:flex' */
    <nav className={`transition-all duration-300 fixed left-0 top-0 h-full bg-surface-container/30 backdrop-blur-2xl border-r border-white/10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex-col py-8 z-40 hidden md:flex overflow-hidden ${isOpen ? "w-64" : "w-20"}`}>

      {/* Brand */}
      <Link href="/home" className={`px-6 mb-8 flex items-center hover:opacity-80 transition-opacity ${isOpen ? "gap-4" : "justify-center px-0"}`}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center ai-glow">
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
      </Link>

      {/* CTA Button */}
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

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-0.5 font-label text-sm">
        {isAdmin && (
          <Link
            key={ADMIN_ITEM.href}
            href={ADMIN_ITEM.href}
            className={
              pathname.startsWith(ADMIN_ITEM.href)
                ? `flex items-center gap-3 bg-amber-500/15 text-amber-400 border-r-[3px] border-amber-500 py-3 rounded-l-xl transition-all duration-200 ${isOpen ? "px-6" : "px-0 justify-center"}`
                : `flex items-center gap-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface py-3 rounded-xl transition-all duration-200 ${isOpen ? "px-6 mx-2" : "px-0 justify-center"}`
            }
            title={!isOpen ? ADMIN_ITEM.label : undefined}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">{ADMIN_ITEM.icon}</span>
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              {ADMIN_ITEM.label}
            </span>
          </Link>
        )}
        {PRIMARY.map((item) => {
          const active =
            item.href === "/home" ? pathname === "/home" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? `flex items-center gap-3 bg-primary/15 text-primary border-r-[3px] border-primary py-3 rounded-l-xl transition-all duration-200 ${isOpen ? "px-6" : "px-0 justify-center"}`
                  : `flex items-center gap-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface py-3 rounded-xl transition-all duration-200 ${isOpen ? "px-6 mx-2" : "px-0 justify-center"}`
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

    </nav>
  );
}
