"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type DemoUser = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  role: string;
};

export function DemoAccounts({ users, redirectTo }: { users: DemoUser[]; redirectTo: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loginAs = async (user: DemoUser) => {
    setLoading(user.user_id);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, phone: user.phone }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative w-full max-w-full mt-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-panel px-4 py-3.5 rounded-xl flex items-center justify-between hover:bg-white/5 border border-white/10 transition-all duration-200 group"
        type="button"
      >
        <div className="flex items-center gap-3 text-sm text-on-surface-variant group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">group</span>
          <span className="font-semibold">บัญชีทดลอง (Demo Accounts)</span>
        </div>
        <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 p-2 glass-panel-strong rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.3)] z-20 animate-[slide-down_0.2s_ease-out] flex flex-col gap-1 max-h-60 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-on-surface-variant font-medium border-b border-white/5 mb-1">
            เลือกบัญชีทดลองเพื่อเข้าใช้งานทันที
          </div>
          {users.map((user) => (
            <button
              key={user.user_id}
              onClick={() => loginAs(user)}
              disabled={loading === user.user_id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 disabled:opacity-50 text-left group/btn"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 transition-transform group-hover/btn:scale-110">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-on-surface group-hover/btn:text-primary transition-colors truncate">
                  {user.name}
                </div>
                <div className="text-xs text-on-surface-variant truncate">{user.role}</div>
              </div>
              {loading === user.user_id && (
                <span className="material-symbols-outlined animate-spin text-primary text-[18px]">progress_activity</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
