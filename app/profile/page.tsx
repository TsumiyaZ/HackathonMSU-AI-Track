"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { User, Save, LogOut, Sparkles, ArrowLeft, Home } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const userPreferences = useTripStore((s) => s.userPreferences);
  const setUserPreferences = useTripStore((s) => s.setUserPreferences);

  const [budgetLevel, setBudgetLevel] = useState(userPreferences?.budgetLevel || "medium");
  const [foodRestrictions, setFoodRestrictions] = useState<string[]>(userPreferences?.foodRestrictions || []);
  const [preferredHotelStyle, setPreferredHotelStyle] = useState(userPreferences?.preferredHotelStyle || "modern");
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/login", { method: "GET" })
      .then(() => fetch("/api/auth/login"))
      .catch(() => {});
    setLoading(false);
  }, []);

  const handleSave = () => {
    setUserPreferences({ budgetLevel, foodRestrictions, preferredHotelStyle });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const foodOptions = ["เนื้อสัตว์", "อาหารทะเล", "นม/ชีส", " gluten (แป้งสาลี)", "ถั่ว", "มังสวิรัติ", "เจ", "ฮาลาล"];
  const toggleFood = (item: string) => {
    setFoodRestrictions((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-pulse">
        <div className="w-24 h-24 skeleton-shimmer rounded-full mx-auto mb-6" />
        <div className="h-8 skeleton-shimmer rounded-xl w-48 mx-auto mb-4" />
        <div className="h-4 skeleton-shimmer rounded-full w-64 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="glass-panel-strong p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="w-10 h-10 text-background" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">โปรไฟล์ของฉัน</h1>
              <p className="text-on-surface-variant mt-1">ตั้งค่าความชอบเพื่อให้ AI แนะนำทริปที่ตรงใจคุณ</p>
            </div>
          </div>

          {saved && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              บันทึกการตั้งค่าเรียบร้อย! AI จะนำข้อมูลนี้ไปใช้ในการวางแผนทริปครั้งต่อไป
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                ระดับงบประมาณ
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "low", label: "ประหยัด", desc: "≤ 10,000 บาท/ทริป", icon: "savings" },
                  { value: "medium", label: "ปานกลาง", desc: "10,000 - 30,000 บาท/ทริป", icon: "balance" },
                  { value: "high", label: "พรีเมียม", desc: "≥ 30,000 บาท/ทริป", icon: "workspace_premium" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBudgetLevel(opt.value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      budgetLevel === opt.value
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[28px] block mb-2">{opt.icon}</span>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-[11px] mt-1 opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">hotel</span>
                สไตล์ที่พักที่ชอบ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "modern", label: "โมเดิร์น", icon: "apartment" },
                  { value: "boutique", label: "บูติก", icon: "villa" },
                  { value: "resort", label: "รีสอร์ท", icon: "beach_access" },
                  { value: "budget", label: "ประหยัด", icon: "bed" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPreferredHotelStyle(opt.value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      preferredHotelStyle === opt.value
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px] block mb-1">{opt.icon}</span>
                    <div className="font-semibold text-sm">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">restaurant</span>
                ข้อจำกัดด้านอาหาร
              </h2>
              <div className="flex flex-wrap gap-2">
                {foodOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleFood(item)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
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

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-4 rounded-xl glass-panel font-label text-sm font-bold flex items-center gap-2 hover:text-primary transition-all border border-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
                กลับไป Dashboard
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Save className="w-5 h-5" />
                บันทึกการตั้งค่า
              </button>
              <button
                onClick={handleLogout}
                className="py-4 px-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-label text-sm font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
