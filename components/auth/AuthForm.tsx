"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "login" | "register";

export function AuthForm({ mode, redirectTo = "/" }: { mode: Mode; redirectTo?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, phone } : { name, email, phone };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "เกิดข้อผิดพลาด ลองอีกครั้ง");
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="group relative flex w-full max-w-md flex-col gap-5 overflow-hidden rounded-2xl glass-panel-strong p-8 ai-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="pointer-events-none absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
        <span className="material-symbols-outlined text-[18px]">
          {isLogin ? "travel_explore" : "globe_book"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {isLogin
            ? "ใช้อีเมลและเบอร์โทรของคุณเพื่อเข้าใช้งาน"
            : "สร้างบัญชีใหม่เพื่อให้ AI แนะนำทริปที่ตรงใจคุณ"}
        </p>
      </div>

      {!isLogin && (
        <label className="group flex flex-col gap-1.5">
          <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant transition-colors duration-200 group-focus-within:text-primary">
            ชื่อ-นามสกุล
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-primary">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="เช่น สมชาย ใจดี"
              className="glass-input rounded-xl px-4 py-3.5 pl-11 text-sm outline-none transition-all duration-200 focus:-translate-y-px focus:shadow-[0_10px_24px_rgba(22,102,219,0.12)]"
            />
          </div>
        </label>
      )}

      <label className="group flex flex-col gap-1.5">
        <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant transition-colors duration-200 group-focus-within:text-primary">
          อีเมล
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-primary">
            <span className="material-symbols-outlined text-[18px]">mail</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className="glass-input rounded-xl px-4 py-3.5 pl-11 text-sm outline-none transition-all duration-200 focus:-translate-y-px focus:shadow-[0_10px_24px_rgba(22,102,219,0.12)]"
          />
        </div>
      </label>

      <label className="group flex flex-col gap-1.5">
        <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant transition-colors duration-200 group-focus-within:text-primary">
          เบอร์โทร {isLogin && "(ใช้แทนรหัสผ่าน)"}
        </span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-primary">
            <span className="material-symbols-outlined text-[18px]">call</span>
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="081-234-5678"
            className="glass-input rounded-xl px-4 py-3.5 pl-11 text-sm outline-none transition-all duration-200 focus:-translate-y-px focus:shadow-[0_10px_24px_rgba(22,102,219,0.12)]"
          />
        </div>
      </label>

      {error && (
        <div className="animate-[slide-down_0.25s_ease] rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl btn-primary-gradient py-3 font-label text-sm font-bold transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-20 -skew-x-12 bg-white/20 opacity-0 transition-all duration-500 group-hover:left-[110%] group-hover:opacity-100" />
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            กำลังดำเนินการ...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">
              {isLogin ? "login" : "person_add"}
            </span>
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </>
        )}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        {isLogin ? "ยังไม่มีบัญชี? " : "มีบัญชีอยู่แล้ว? "}
        <Link
          href={isLogin ? "/auth/register" : "/auth/login"}
          className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
        >
          {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </Link>
      </p>
    </form>
  );
}
