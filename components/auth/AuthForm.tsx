"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
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
      router.push("/profile");
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass-panel-strong rounded-2xl p-8 w-full max-w-md flex flex-col gap-5 ai-glow">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {isLogin
            ? "ใช้อีเมลและเบอร์โทรของคุณเพื่อเข้าใช้งาน"
            : "สร้างบัญชีใหม่เพื่อให้ AI แนะนำทริปที่ตรงใจคุณ"}
        </p>
      </div>

      {!isLogin && (
        <label className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
            ชื่อ-นามสกุล
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="เช่น สมชาย ใจดี"
            className="glass-input rounded-xl px-4 py-3 text-sm outline-none"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
          อีเมล
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="name@example.com"
          className="glass-input rounded-xl px-4 py-3 text-sm outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
          เบอร์โทร {isLogin && "(ใช้แทนรหัสผ่าน)"}
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="081-234-5678"
          className="glass-input rounded-xl px-4 py-3 text-sm outline-none"
        />
      </label>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm border border-error/30 bg-error/10 text-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary-gradient w-full py-3 rounded-xl font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            กำลังดำเนินการ...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">
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
          className="text-primary hover:underline font-semibold"
        >
          {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </Link>
      </p>
    </form>
  );
}
