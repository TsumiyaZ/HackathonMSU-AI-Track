"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AuthStatusButton() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/check-session")
      .then(r => r.json())
      .then(d => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return <div className="w-32 h-10 skeleton-shimmer rounded-xl" />;

  if (authed) {
    return (
      <Link
        href="/profile"
        className="px-5 py-2 rounded-xl glass-panel-strong font-label text-sm hover:text-primary transition-colors flex items-center gap-2 border border-white/10"
      >
        <span className="material-symbols-outlined text-[18px]">account_circle</span>
        โปรไฟล์
      </Link>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="px-5 py-2 rounded-xl glass-panel-strong font-label text-sm hover:text-primary transition-colors flex items-center gap-2 border border-white/10"
    >
      <span className="material-symbols-outlined text-[18px]">login</span>
      Sign In
    </Link>
  );
}
