"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { Check, Edit3, Home, LogOut, Save, Sparkles, User, X } from "lucide-react";

type SessionUser = {
  name?: string;
  email?: string;
  phone?: string;
  role?: "ADMIN" | "VIP" | "MEMBER" | string;
};

const FOOD_OPTIONS = [
  "เนื้อสัตว์",
  "อาหารทะเล",
  "นม/ชีส",
  "gluten (แป้งสาลี)",
  "ถั่ว",
  "มังสวิรัติ",
  "เจ",
  "ฮาลาล",
];

const BUDGET_OPTIONS = [
  { value: "low", label: "ประหยัด", desc: "ไม่เกิน 10,000 บาท/ทริป", icon: "savings" },
  { value: "medium", label: "ปานกลาง", desc: "10,000 - 30,000 บาท/ทริป", icon: "balance" },
  { value: "high", label: "พรีเมียม", desc: "30,000+ บาท/ทริป", icon: "workspace_premium" },
] as const;

const HOTEL_STYLE_OPTIONS = [
  { value: "modern", label: "โมเดิร์น", icon: "apartment" },
  { value: "boutique", label: "บูติก", icon: "villa" },
  { value: "resort", label: "รีสอร์ท", icon: "beach_access" },
  { value: "budget", label: "ประหยัด", icon: "bed" },
] as const;

function getBudgetLabel(val: string) {
  if (val === "low") return "ประหยัด (≤ 10,000 บาท)";
  if (val === "medium") return "ปานกลาง (10,000 - 30,000 บาท)";
  if (val === "high") return "พรีเมียม (≥ 30,000 บาท)";
  return val;
}

function getHotelStyleLabel(val: string) {
  if (val === "modern") return "โมเดิร์น";
  if (val === "boutique") return "บูติก";
  if (val === "resort") return "รีสอร์ท";
  if (val === "budget") return "ประหยัด";
  return val;
}

function getRoleBadgeClass(role?: string) {
  if (role === "ADMIN") {
    return "border border-amber-500/30 bg-amber-500/15 text-amber-500 dark:text-amber-400";
  }
  if (role === "VIP") {
    return "border border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-400";
  }
  return "border border-primary/20 bg-primary/10 text-primary";
}

function getRoleLabel(role?: string) {
  if (role === "ADMIN" || role === "VIP") return role;
  return "MEMBER";
}

export default function ProfilePage() {
  const router = useRouter();
  const userPreferences = useTripStore((s) => s.userPreferences);
  const setUserPreferences = useTripStore((s) => s.setUserPreferences);

  const [budgetLevel, setBudgetLevel] = useState(userPreferences?.budgetLevel || "medium");
  const [foodRestrictions, setFoodRestrictions] = useState<string[]>(
    userPreferences?.foodRestrictions || []
  );
  const [preferredHotelStyle, setPreferredHotelStyle] = useState(
    userPreferences?.preferredHotelStyle || "modern"
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check-session", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push("/auth/login?redirect=/profile");
        }
      })
      .catch(() => {
        router.push("/auth/login?redirect=/profile");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = () => {
    setUserPreferences({ budgetLevel, foodRestrictions, preferredHotelStyle });
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const toggleFood = (item: string) => {
    setFoodRestrictions((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center md:py-12 animate-pulse">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full skeleton-shimmer" />
        <div className="mx-auto mb-4 h-7 w-40 rounded-xl skeleton-shimmer" />
        <div className="mx-auto h-4 w-56 rounded-full skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-6 md:py-12">
      <section className="relative overflow-hidden rounded-[28px] glass-panel-strong animate-[fade-up_0.42s_ease_both]">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative z-10 p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 border-b border-border/50 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-2xl font-bold text-white shadow-[0_16px_30px_rgba(22,102,219,0.20)] ring-4 ring-primary/10 transition-transform duration-300 hover:scale-[1.02] md:h-20 md:w-20">
                  {user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-9 w-9 text-white" />
                  )}
                </div>
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-on-surface md:text-3xl">
                    {user?.name || "โปรไฟล์ของฉัน"}
                  </h1>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] ${getRoleBadgeClass(
                      user?.role
                    )}`}
                  >
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant md:text-base">
                  {user?.email || "กำลังตั้งค่าความชอบสำหรับการจัดทริป"}
                </p>
                {user?.phone && (
                  <p className="text-xs text-on-surface-variant">{user.phone}</p>
                )}
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="group inline-flex items-center gap-2 self-start rounded-2xl border border-primary/15 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-all duration-200 hover:border-primary/30 hover:bg-primary/14 hover:shadow-[0_10px_24px_rgba(22,102,219,0.12)]"
              >
                <Edit3 className="h-4 w-4 transition-transform duration-200 group-hover:rotate-[-8deg]" />
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {saved && (
            <div className="mt-4 animate-[slide-down_0.26s_ease] rounded-2xl border border-emerald-500/25 bg-emerald-500/12 px-4 py-3 text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-3 text-sm md:text-base">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/14">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p>บันทึกการตั้งค่าเรียบร้อยแล้ว AI จะใช้ข้อมูลนี้กับทริปครั้งถัดไป</p>
              </div>
            </div>
          )}

          {!isEditing ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-surface/70 p-5 transition-colors duration-200 hover:border-primary/30 hover:bg-surface-hover/85">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  <span className="font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Budget
                  </span>
                </div>
                <p className="text-base font-semibold text-on-surface">{getBudgetLabel(budgetLevel)}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-surface/70 p-5 transition-colors duration-200 hover:border-primary/30 hover:bg-surface-hover/85">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">hotel</span>
                  <span className="font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Hotel Style
                  </span>
                </div>
                <p className="text-base font-semibold text-on-surface">
                  {getHotelStyleLabel(preferredHotelStyle)}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-surface/70 p-5 transition-colors duration-200 hover:border-primary/30 hover:bg-surface-hover/85 md:col-span-1">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">restaurant</span>
                  <span className="font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Food
                  </span>
                </div>
                {foodRestrictions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {foodRestrictions.map((item) => (
                      <span
                        key={item}
                        className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/14"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-on-surface">ไม่มีข้อจำกัดเป็นพิเศษ</p>
                )}
              </div>

              <div className="flex flex-col gap-3 md:col-span-3 md:flex-row md:justify-end md:pt-2">
                <button
                  onClick={() => router.push("/home")}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-on-surface transition-all duration-200 hover:border-primary/30 hover:text-primary"
                >
                  <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  กลับหน้าหลัก
                </button>
                <button
                  onClick={handleLogout}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-500 transition-all duration-200 hover:bg-red-500/14 hover:shadow-[0_10px_24px_rgba(239,68,68,0.10)] dark:text-red-400"
                >
                  <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-5 animate-[fade-up_0.28s_ease]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-on-surface">แก้ไขความชอบของคุณ</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    ปรับค่าพื้นฐานให้ AI แนะนำทริปได้ใกล้เคียงรสนิยมของคุณมากขึ้น
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface text-on-surface-variant transition-all duration-200 hover:border-primary/25 hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    account_balance_wallet
                  </span>
                  <h3 className="font-display text-lg font-bold text-on-surface">ระดับงบประมาณ</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {BUDGET_OPTIONS.map((opt) => {
                    const active = budgetLevel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setBudgetLevel(opt.value)}
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? "border-primary/45 bg-primary/10 shadow-[0_14px_30px_rgba(22,102,219,0.12)]"
                            : "border-border/70 bg-surface hover:border-primary/25 hover:bg-surface-hover"
                        }`}
                      >
                        <span
                          className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
                            active
                              ? "border-primary bg-primary text-white"
                              : "border-border/80 text-transparent group-hover:border-primary/30"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span
                          className={`material-symbols-outlined mb-3 block text-[24px] transition-colors duration-200 ${
                            active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <div className="text-sm font-semibold text-on-surface">{opt.label}</div>
                        <div className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">hotel</span>
                  <h3 className="font-display text-lg font-bold text-on-surface">สไตล์ที่พัก</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {HOTEL_STYLE_OPTIONS.map((opt) => {
                    const active = preferredHotelStyle === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPreferredHotelStyle(opt.value)}
                        className={`group relative overflow-hidden rounded-2xl border px-3 py-4 text-center transition-all duration-200 ${
                          active
                            ? "border-primary/45 bg-primary/10 shadow-[0_14px_30px_rgba(22,102,219,0.12)]"
                            : "border-border/70 bg-surface hover:border-primary/25 hover:bg-surface-hover"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined mb-2 block text-[24px] transition-colors duration-200 ${
                            active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <div className="text-sm font-semibold text-on-surface">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">restaurant</span>
                  <h3 className="font-display text-lg font-bold text-on-surface">ข้อจำกัดด้านอาหาร</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FOOD_OPTIONS.map((item) => {
                    const active = foodRestrictions.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleFood(item)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "border-primary/30 bg-primary/10 text-primary shadow-[0_8px_18px_rgba(22,102,219,0.10)]"
                            : "border-border/70 bg-surface text-on-surface-variant hover:border-primary/25 hover:text-on-surface"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200 ${
                            active ? "bg-primary text-white" : "bg-surface-container text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-on-surface transition-all duration-200 hover:border-primary/25 hover:text-primary"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  className="group flex-[1.35] rounded-2xl btn-primary-gradient px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:shadow-[0_14px_30px_rgba(22,102,219,0.18)]"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Save className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                    บันทึกการตั้งค่า
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
