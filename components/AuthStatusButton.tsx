"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/store";
import { TRANSLATIONS } from "@/lib/translations";

export function AuthStatusButton() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const lang = useLanguage();

  useEffect(() => {
    fetch("/api/auth/check-session")
      .then(r => r.json())
      .then(d => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <div className="w-28 h-9 bg-white/10 animate-pulse rounded-xl border border-white/10" />;
  }

  if (authed) {
    return (
      <Link
        href="/profile"
        className="px-6 py-2.5 rounded-full font-display font-semibold text-sm text-primary bg-white hover:bg-slate-50 active:scale-95 transition-all duration-200 flex items-center gap-2.5 shadow-md shadow-black/5"
      >
        <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
        <span>{TRANSLATIONS[lang].profile}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="px-6 py-2.5 rounded-full font-display font-semibold text-sm text-primary bg-white hover:bg-slate-50 active:scale-95 transition-all duration-200 flex items-center gap-2.5 shadow-md shadow-black/5"
    >
      <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>person</span>
      <span>{TRANSLATIONS[lang].signIn}</span>
    </Link>
  );
}
