"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTripStore } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

export function TopBar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const lang = useTripStore((s) => s.lang);
  const setLang = useTripStore((s) => s.setLang);

  useEffect(() => {
    fetch("/api/auth/check-session")
      .then(r => r.json())
      .then(d => { setAuthed(d.authenticated); if (d.user) setUserName(d.user.name); })
      .catch(() => setAuthed(false));
  }, []);

  return (
    <header className={`transition-all duration-300 fixed top-0 right-0 left-0 ${isOpen ? "md:left-64" : "md:left-20"} z-30 h-16 bg-surface/85 backdrop-blur-xl border-b border-border/80 shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex items-center justify-between px-4 md:px-8 dark:bg-surface/60 dark:border-white/10 dark:shadow-[0_0_20px_rgba(173,198,255,0.08)]`}>
      {/* Left — Brand (mobile) + hamburger (desktop) */}
      <div className="flex items-center gap-3">
        {/* Desktop sidebar toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-on-surface-variant hover:text-primary transition-colors hidden md:block"
          title="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Mobile brand logo — hidden on desktop */}
        <Link href="/home" className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
            <span
              className="material-symbols-outlined text-background text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
          <span className="font-display text-base font-black text-gradient">TicketHub</span>
        </Link>

        {/* Desktop page title — hidden on mobile */}
        <h2 className="font-display text-base md:text-lg font-semibold text-on-surface hidden md:block">
          TicketHub
        </h2>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          href="/help"
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
          title={TRANSLATIONS[lang].help}
        >
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
        </Link>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-surface-hover flex items-center justify-center text-xs font-black text-primary transition-all duration-300 hover:scale-105 cursor-pointer"
          title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
        >
          {lang.toUpperCase()}
        </button>

        <ThemeToggle />

        {authed === null ? (
          <div className="w-8 h-8 skeleton-shimmer rounded-full" />
        ) : authed ? (
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-gradient-to-tr from-primary/40 to-secondary/40 flex items-center justify-center font-display text-sm font-semibold text-background hover:scale-105 transition-transform cursor-pointer"
            title={TRANSLATIONS[lang].profile}
          >
            {userName?.charAt(0).toUpperCase() || '?'}
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="outline-soft px-4 py-2 rounded-xl font-label text-sm transition-colors flex items-center gap-2 dark:glass-panel-strong dark:border-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span className="hidden sm:inline">{TRANSLATIONS[lang].signIn}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
