"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/check-session")
      .then(r => r.json())
      .then(d => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <header className={`transition-all duration-300 fixed top-0 right-0 left-0 ${isOpen ? "md:left-64" : "md:left-20"} z-30 h-16 bg-surface/30 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(173,198,255,0.08)] flex items-center justify-between px-4 md:px-12`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-on-surface-variant hover:text-primary transition-colors hidden md:block"
          title="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <h2 className="font-display text-base md:text-lg font-semibold text-on-surface">
          AI Trip Architect
        </h2>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <ThemeToggle />
        <button
          aria-label="การแจ้งเตือน"
          className="relative text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface" />
        </button>
        <button
          aria-label="ตั้งค่า"
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        {authed === null ? (
          <div className="w-24 h-9 skeleton-shimmer rounded-xl" />
        ) : authed ? (
          <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-gradient-to-tr from-primary/40 to-secondary/40 flex items-center justify-center font-display text-sm font-semibold text-background hover:scale-105 transition-transform cursor-pointer">
            T
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="px-5 py-2 rounded-xl glass-panel-strong font-label text-sm hover:text-primary transition-colors flex items-center gap-2 border border-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
