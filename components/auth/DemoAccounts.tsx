"use client";

import { useState } from "react";
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
    <div className="flex flex-col gap-3 w-full max-w-full">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px]">group</span>
        บัญชีทดลอง — กดเลือกเพื่อเข้าใช้งานทันที
      </div>
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <button
            key={user.user_id}
            onClick={() => loginAs(user)}
            disabled={loading === user.user_id}
            className="glass-panel px-3 py-2 rounded-xl hover:bg-white/10 hover:border-primary/30 border border-white/10 transition-all disabled:opacity-50 text-xs group flex items-center gap-2 shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="text-left leading-tight">
              <div className="font-semibold text-on-surface group-hover:text-primary transition-colors whitespace-nowrap">{user.name}</div>
              <div className="text-[10px] text-on-surface-variant">{user.role}</div>
            </div>
            {loading === user.user_id && (
              <span className="animate-pulse text-primary">...</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
