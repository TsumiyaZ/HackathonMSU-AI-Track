"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { User, Save, LogOut, Sparkles, Home, Edit3, X } from "lucide-react";

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
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check-session", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          // Fallback or retry logic
          fetch("/api/auth/login")
            .then((res) => res.json())
            .then((loginData) => {
              if (loginData.user) setUser(loginData.user);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setUserPreferences({ budgetLevel, foodRestrictions, preferredHotelStyle });
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const foodOptions = [
    "เนื้อสัตว์", "อาหารทะเล", "นม/ชีส", " gluten (แป้งสาลี)",
    "ถั่ว", "มังสวิรัติ", "เจ", "ฮาลาล",
  ];
  const toggleFood = (item: string) => {
    setFoodRestrictions((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 text-center animate-pulse">
        <div className="w-20 h-20 md:w-24 md:h-24 skeleton-shimmer rounded-full mx-auto mb-6" />
        <div className="h-7 skeleton-shimmer rounded-xl w-40 mx-auto mb-4" />
        <div className="h-4 skeleton-shimmer rounded-full w-56 mx-auto" />
      </div>
    );
  }

  // Formatting helpers for summary view
  const getBudgetLabel = (val: string) => {
    if (val === "low") return "ประหยัด (≤ 10,000 บาท)";
    if (val === "medium") return "ปานกลาง (10,000 - 30,000 บาท)";
    if (val === "high") return "พรีเมียม (≥ 30,000 บาท)";
    return val;
  };
  
  const getHotelStyleLabel = (val: string) => {
    if (val === "modern") return "โมเดิร์น";
    if (val === "boutique") return "บูติก";
    if (val === "resort") return "รีสอร์ท";
    if (val === "budget") return "ประหยัด";
    return val;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-12">
      <div className="glass-panel-strong p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-border/40 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 text-2xl font-bold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8 md:w-10 md:h-10 text-background" />}
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">{user?.name || "โปรไฟล์ของฉัน"}</h1>
                <p className="text-on-surface-variant text-sm md:text-base mt-0.5">
                  {user?.email || "กำลังตั้งค่าความชอบสำหรับการจัดทริป"}
                </p>
                {user?.phone && (
                  <p className="text-on-surface-variant text-xs mt-0.5">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="shrink-0 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2 font-bold text-sm self-start sm:self-center"
              >
                <Edit3 className="w-4 h-4" />
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {/* Save success toast */}
          {saved && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 md:gap-3 text-sm md:text-base">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              บันทึกการตั้งค่าเรียบร้อย! AI จะนำข้อมูลนี้ไปใช้ในการวางแผนทริปครั้งต่อไป
            </div>
          )}

          {!isEditing ? (
            /* ── VIEW MODE ── */
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="glass-panel p-5 md:p-6 rounded-xl md:rounded-2xl border border-white/5 flex flex-col gap-4">
                <h2 className="font-display text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
                  การตั้งค่าความชอบปัจจุบัน
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">ระดับงบประมาณ</p>
                    <p className="font-bold text-sm md:text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
                      {getBudgetLabel(budgetLevel)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">สไตล์ที่พัก</p>
                    <p className="font-bold text-sm md:text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">hotel</span>
                      {getHotelStyleLabel(preferredHotelStyle)}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">ข้อจำกัดด้านอาหาร</p>
                    {foodRestrictions.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {foodRestrictions.map((item) => (
                          <span key={item} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-on-surface flex items-center gap-2">
                         <span className="material-symbols-outlined text-on-surface-variant text-[18px]">restaurant</span>
                        ไม่มีข้อจำกัดเป็นพิเศษ
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for View Mode */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-2 md:pt-4">
                <button
                  onClick={() => router.push("/home")}
                  className="py-3 md:py-4 px-4 md:px-6 rounded-xl glass-panel font-label text-sm font-bold flex items-center justify-center gap-2 hover:text-primary transition-all border border-white/10"
                >
                  <Home className="w-4 h-4 md:w-5 md:h-5" />
                  กลับหน้าหลัก
                </button>
                <button
                  onClick={handleLogout}
                  className="py-3 md:py-4 px-4 md:px-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-label text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          ) : (
            /* ── EDIT MODE ── */
            <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary" />
                  แก้ไขความชอบของคุณ
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Budget Level ── */}
              <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                <h3 className="font-display text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    account_balance_wallet
                  </span>
                  ระดับงบประมาณ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                  {[
                    { value: "low", label: "ประหยัด", desc: "≤ 10,000 บาท/ทริป", icon: "savings" },
                    { value: "medium", label: "ปานกลาง", desc: "10,000 – 30,000 บาท/ทริป", icon: "balance" },
                    { value: "high", label: "พรีเมียม", desc: "≥ 30,000 บาท/ทริป", icon: "workspace_premium" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBudgetLevel(opt.value)}
                      className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 p-3 md:p-4 rounded-xl border transition-all text-left sm:text-center ${
                        budgetLevel === opt.value
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] sm:text-[28px] sm:block sm:mb-2 flex-shrink-0">
                        {opt.icon}
                      </span>
                      <div>
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className="text-[11px] md:text-xs mt-0.5 opacity-70">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Hotel Style ── */}
              <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                <h3 className="font-display text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">hotel</span>
                  สไตล์ที่พักที่ชอบ
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                  {[
                    { value: "modern", label: "โมเดิร์น", icon: "apartment" },
                    { value: "boutique", label: "บูติก", icon: "villa" },
                    { value: "resort", label: "รีสอร์ท", icon: "beach_access" },
                    { value: "budget", label: "ประหยัด", icon: "bed" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPreferredHotelStyle(opt.value)}
                      className={`p-3 md:p-4 rounded-xl border text-center transition-all ${
                        preferredHotelStyle === opt.value
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px] md:text-[24px] block mb-1">
                        {opt.icon}
                      </span>
                      <div className="font-semibold text-xs md:text-sm">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Food Restrictions ── */}
              <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5">
                <h3 className="font-display text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">restaurant</span>
                  ข้อจำกัดด้านอาหาร
                </h3>
                <div className="flex flex-wrap gap-2">
                  {foodOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleFood(item)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border transition-all ${
                        foodRestrictions.includes(item)
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/30"
                      }`}
                    >
                      {foodRestrictions.includes(item) ? "✓ " : ""}{item}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Action Buttons for Edit Mode ── */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="order-2 sm:order-1 flex-1 py-3 md:py-4 px-4 md:px-6 rounded-xl glass-panel font-label text-sm font-bold flex items-center justify-center gap-2 hover:text-primary transition-all border border-white/10"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  className="order-1 sm:order-2 flex-[2] py-3 md:py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Save className="w-4 h-4 md:w-5 md:h-5" />
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
