"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { Sparkles, Loader2, Settings } from "lucide-react";
import { requireAuth } from "@/lib/auth-check";

const LOADING_STEPS = [
  { icon: "search", label: "กำลังวิเคราะห์เป้าหมายและงบประมาณ..." },
  { icon: "flight_takeoff", label: "กำลังค้นหาเที่ยวบินที่คุ้มค่าที่สุด..." },
  { icon: "apartment", label: "กำลังคัดเลือกโรงแรมเรตติ้งดีตามงบของคุณ..." },
  { icon: "restaurant", label: "กำลังจับคู่ร้านอาหารและกิจกรรมยอดนิยม..." },
  { icon: "auto_awesome", label: "กำลังประกอบตารางการเดินทางที่สมบูรณ์แบบ..." },
];

export default function PlanPage() {
  const [promptInput, setPromptInput] = useState("");
  const [selectedCity, setSelectedCity] = useState("เชียงใหม่");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("medium");
  const [theme, setTheme] = useState("relaxation");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const router = useRouter();
  const setTrip = useTripStore((state) => state.setTrip);
  const userPreferences = useTripStore((state) => state.userPreferences);

  // Increment loading step every 2 seconds during loading phase
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    // Construct the structured prompt based on primary input and advanced options
    let finalPrompt = promptInput.trim();
    if (showAdvanced) {
      finalPrompt += ` (ข้อมูลเพิ่มเติม - ปลายทาง: ${selectedCity}, ระยะเวลา: ${days} วัน, งบประมาณ: ${
        budget === "low" ? "ประหยัด" : budget === "medium" ? "ปานกลาง" : "หรูหราพรีเมียม"
      }, สไตล์: ${
        theme === "nature"
          ? "ธรรมชาติ"
          : theme === "food"
          ? "เน้นกินชิมอาหาร"
          : theme === "cafe"
          ? "ถ่ายรูปคาเฟ่"
          : theme === "relaxation"
          ? "พักผ่อนสบายๆ"
          : "ผจญภัยแอดเวนเจอร์"
      })`;
    }

    const authed = await requireAuth("/plan");
    if (!authed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, preferences: userPreferences || {} }),
      });

      const data = await res.json();
      if (data.success) {
        setTrip(data.itinerary);
        router.push(`/trip/${data.itinerary.id}`);
      } else {
        alert("Error: " + data.error);
        if (data.fallback) {
          setTrip(data.fallback);
          router.push(`/trip/${data.fallback.id}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider mb-3 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> AI Trip Planner
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-black text-on-surface tracking-tight">
          วางแผนทริปด้วย <span className="text-gradient">AI อัจฉริยะ</span>
        </h1>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-2 leading-relaxed">
          สร้างตารางเดินทาง โรงแรม เที่ยวบิน และร้านอาหารที่เหมาะสมกับคุณที่สุดในคลิกเดียว
        </p>
      </div>

      {/* Main Form Box */}
      <div className="flex flex-col gap-4">
        {/* Prominent Prompt Input Area */}
        <div className="relative glass-panel-strong p-1.5 bg-surface rounded-2xl border border-border shadow-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="บอกจุดหมายปลายทางหรือพิมพ์ความต้องการของคุณ เช่น 'ไปเที่ยวเชียงใหม่ 3 วัน เน้นไปร้านกาแฟ คาเฟ่สวยๆ บรรยากาศดี ถ่ายรูปสวย'..."
            rows={3}
            disabled={loading}
            className="w-full bg-transparent border-0 text-on-surface placeholder:text-on-surface-variant/40 p-4 pb-14 focus:outline-none resize-none font-sans leading-relaxed text-sm md:text-base"
          />
          
          {/* Controls Bar at bottom of input */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                showAdvanced
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface-variant"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              {showAdvanced ? "ซ่อนตัวเลือกเพิ่มเติม" : "ระบุตัวเลือกเพิ่มเติม"}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || !promptInput.trim()}
              className="btn-primary-gradient px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  กำลังสร้างทริป...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  สร้างแผนทริป
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Selections */}
        {showAdvanced && (
          <div className="glass-panel rounded-2xl p-5 border border-border/80 flex flex-col gap-5 animate-fade-in">
            {/* Row 1: Destination & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Destination */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  จุดหมายปลายทาง
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["เชียงใหม่", "ภูเก็ต", "กรุงเทพฯ", "พัทยา", "สมุย", "โตเกียว"].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                        selectedCity === city
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                    ระยะเวลา
                  </span>
                  <span className="text-primary font-bold text-xs">{days} วัน {days - 1} คืน</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        days === d
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {d} วัน
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Budget & Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Budget */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                  งบประมาณ
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "low", label: "ประหยัด" },
                    { id: "medium", label: "ปานกลาง" },
                    { id: "high", label: "พรีเมียม" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        budget === b.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">explore</span>
                  สไตล์ท่องเที่ยว
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "relaxation", label: "พักผ่อนชิลๆ" },
                    { id: "food", label: "เน้นกินร้านดัง" },
                    { id: "cafe", label: "คาเฟ่/ถ่ายรูป" },
                    { id: "nature", label: "ธรรมชาติป่าเขา" },
                    { id: "adventure", label: "แอดเวนเจอร์" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${
                        theme === t.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Settings Reminder */}
            {userPreferences && (
              <div className="text-[10px] text-on-surface-variant bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl flex items-center gap-2 mt-1">
                <Settings className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  กำลังใช้ค่าโปรไฟล์: <strong>{userPreferences.budgetLevel === "low" ? "ประหยัด" : userPreferences.budgetLevel === "medium" ? "ปานกลาง" : "พรีเมียม"}</strong>
                  {userPreferences.foodRestrictions.length > 0 && ` • แพ้อาหาร: ${userPreferences.foodRestrictions.join(", ")}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Templates list */}
      <div className="flex flex-col gap-2.5 mt-2">
        <p className="text-xs font-bold text-on-surface-variant">ทริปตัวอย่างแนะนำ:</p>
        <div className="flex flex-wrap gap-2">
          {[
            {
              title: "ภูเก็ตพักร้อน 3 วัน",
              prompt: "วางแผนทริปภูเก็ต 3 วัน 2 คืน พักโรงแรมติดทะเล บรรยากาศเงียบสงบ เดินทางสะดวก",
              city: "ภูเก็ต",
              days: 3,
              budget: "high",
              theme: "relaxation",
            },
            {
              title: "ชิลคาเฟ่เชียงใหม่ 3 วัน",
              prompt: "วางแผนทริปเชียงใหม่ 3 วัน เน้นไปร้านกาแฟ คาเฟ่สวยๆ บรรยากาศดี ถ่ายรูปสวย",
              city: "เชียงใหม่",
              days: 3,
              budget: "medium",
              theme: "cafe",
            },
            {
              title: "ตะลุยชิมร้านดังโตเกียว 5 วัน",
              prompt: "วางแผนทริปโตเกียว 5 วัน เน้นชิมซูชิ ราเมน เนื้อย่าง และร้านอาหารยอดนิยมที่มีดาวมิชลิน",
              city: "โตเกียว",
              days: 5,
              budget: "high",
              theme: "food",
            },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setPromptInput(item.prompt);
                setSelectedCity(item.city);
                setDays(item.days);
                setBudget(item.budget);
                setTheme(item.theme);
              }}
              className="glass-panel text-xs px-3.5 py-1.5 rounded-full hover:bg-surface-hover hover:border-primary/45 transition-colors text-on-surface"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Full Page Progress Loader during AI planning */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel-strong max-w-md w-full p-8 rounded-3xl border border-primary/20 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
            {/* Animated grid dots background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,102,219,0.06)_1px,transparent_1px)] bg-[size:16px_16px] opacity-70 pointer-events-none" />

            {/* Dynamic spinning glow robot/compass */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary animate-spin-slow opacity-60" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
                <Sparkles className="text-white w-7 h-7" />
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-black text-on-surface">
                กำลังสร้างแผนการเดินทางของคุณ...
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
                AI กำลังรวบรวมและวิเคราะห์ข้อมูลเพื่อสร้างทริปที่ตอบโจทย์คุณที่สุด
              </p>
            </div>

            {/* Step-by-Step progress list */}
            <div className="w-full flex flex-col gap-3 bg-surface-container/60 border border-border/40 p-4.5 rounded-2xl text-left font-sans text-xs">
              {LOADING_STEPS.map((step, idx) => {
                const isCompleted = loadingStep > idx;
                const isCurrent = loadingStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      isCompleted
                        ? "opacity-100 text-emerald-500 font-bold"
                        : isCurrent
                        ? "opacity-100 text-primary font-bold animate-pulse"
                        : "opacity-40 text-on-surface-variant"
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[18px] text-emerald-500 font-bold shrink-0">
                        check_circle
                      </span>
                    ) : isCurrent ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-primary shrink-0" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40 shrink-0">
                        {step.icon}
                      </span>
                    )}
                    <span className="leading-tight">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
