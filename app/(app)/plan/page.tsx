"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore, useLanguage } from "@/lib/store";
import { Sparkles, Loader2, Settings } from "lucide-react";
import { requireAuth } from "@/lib/auth-check";
import { TRANSLATIONS } from "@/lib/translations";

export default function PlanPage() {
  const lang = useLanguage();
  const t = TRANSLATIONS[lang];

  const loadingStepsIcons = ["search", "flight_takeoff", "apartment", "restaurant", "auto_awesome"];
  const dynamicLoadingSteps = t.loadingSteps.map((label, idx) => ({
    icon: loadingStepsIcons[idx],
    label,
  }));

  const [promptInput, setPromptInput] = useState("");
  const [chatMessage, setChatMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("เชียงใหม่");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("medium");
  const [theme, setTheme] = useState("relaxation");
  
  // Date states for Check-in & Check-out
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

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
      }`;

      if (checkInDate) finalPrompt += `, วันที่เข้า: ${checkInDate}`;
      if (checkOutDate) finalPrompt += `, วันที่ออก: ${checkOutDate}`;
      finalPrompt += `)`;
    }

    const authed = await requireAuth("/plan");
    if (!authed) return;

    setPromptInput("");
    setLoading(true);
    setChatMessage(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, preferences: userPreferences || {} }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.needsPrompt) {
          setChatMessage(data.message);
          setLoading(false);
        } else {
          setTrip(data.itinerary);
          router.push(`/trip/${data.itinerary.id}`);
        }
      } else {
        setErrorMsg("ไม่สามารถจัดทริปได้: " + data.error);
        if (data.fallback) {
          setTrip(data.fallback);
          router.push(`/trip/${data.fallback.id}`);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อระบบจัดทริป กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider mb-3 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> {t.aiTripPlanner}
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-black text-on-surface tracking-tight">
          {t.headline} <span className="text-gradient">{t.headlineSub}</span>
        </h1>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-2 leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Main Form Box */}
      <div className="flex flex-col gap-4">
        {/* Prominent Prompt Input Area */}
        <div className="relative glass-panel-strong p-1.5 bg-surface rounded-2xl border border-border shadow-md interactive-input">
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={t.placeholderSearch}
            rows={3}
            disabled={loading}
            className="w-full bg-transparent border-0 text-on-surface placeholder:text-on-surface-variant/40 p-4 pb-14 focus:outline-none resize-none font-sans leading-relaxed text-sm md:text-base"
          />
          
          {/* Controls Bar at bottom of input */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`group flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer interactive-bounce ${
                showAdvanced
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface-variant"
              }`}
            >
              <Settings className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-90" />
              {showAdvanced ? t.hideAdvancedOptions : t.advancedOptions}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || !promptInput.trim()}
              className="btn-primary-gradient px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow disabled:opacity-40 disabled:pointer-events-none cursor-pointer interactive-bounce"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t.creatingTrip}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.createTrip}
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
                  {t.destination}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "เชียงใหม่", label: lang === 'th' ? "เชียงใหม่" : "Chiang Mai" },
                    { id: "ภูเก็ต", label: lang === 'th' ? "ภูเก็ต" : "Phuket" },
                    { id: "กรุงเทพฯ", label: lang === 'th' ? "กรุงเทพฯ" : "Bangkok" },
                    { id: "พัทยา", label: lang === 'th' ? "พัทยา" : "Pattaya" },
                    { id: "สมุย", label: lang === 'th' ? "สมุย" : "Samui" },
                    { id: "โตเกียว", label: lang === 'th' ? "โตเกียว" : "Tokyo" },
                  ].map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setSelectedCity(city.id)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all hover-lift press-scale cursor-pointer ${
                        selectedCity === city.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                    {t.duration}
                  </span>
                  <span className="text-primary font-bold text-xs">{days} {t.daysUnit} {days - 1} {t.nightsUnit}</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all hover-lift press-scale cursor-pointer ${
                        days === d
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {d} {t.daysUnit}
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
                  {t.budget}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "low", label: t.budgetLow },
                    { id: "medium", label: t.budgetMedium },
                    { id: "high", label: t.budgetHigh },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all hover-lift press-scale cursor-pointer ${
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
                  {t.style}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "relaxation", label: t.styleRelax },
                    { id: "food", label: t.styleFood },
                    { id: "cafe", label: t.styleCafe },
                    { id: "nature", label: t.styleNature },
                    { id: "adventure", label: t.styleAdventure },
                  ].map((styleOpt) => (
                    <button
                      key={styleOpt.id}
                      type="button"
                      onClick={() => setTheme(styleOpt.id)}
                      className={`py-2 rounded-lg text-[11px] font-bold border transition-all hover-lift press-scale cursor-pointer ${
                        theme === styleOpt.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface hover:bg-surface-hover border-border/50 text-on-surface"
                      }`}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Check-in / Check-out Dates */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                {t.checkInCheckOut}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-on-surface-variant/70 font-bold shrink-0">{t.checkIn}</span>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold border border-border/50 bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-on-surface-variant/70 font-bold shrink-0">{t.checkOut}</span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold border border-border/50 bg-surface text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Profile Settings Reminder */}
            {userPreferences && (
              <div className="text-[10px] text-on-surface-variant bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl flex items-center gap-2 mt-1">
                <Settings className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  {t.profilePreferencesActive} <strong>{userPreferences.budgetLevel === "low" ? t.budgetLow : userPreferences.budgetLevel === "medium" ? t.budgetMedium : t.budgetHigh}</strong>
                  {userPreferences.foodRestrictions.length > 0 && ` • ${t.foodAllergy}: ${userPreferences.foodRestrictions.join(", ")}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Response Message */}
      {chatMessage && (
        <div className="glass-panel p-5 rounded-2xl text-left bg-primary/5 border border-primary/20 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div className="text-sm whitespace-pre-line leading-relaxed text-on-surface">
              {chatMessage}
            </div>
          </div>
        </div>
      )}

      {/* Suggested Templates list */}
      <div className="flex flex-col gap-2.5 mt-2">
        <p className="text-xs font-bold text-on-surface-variant">{t.sampleTrips}</p>
        <div className="flex flex-wrap gap-2">
          {[
            {
              title: t.phuketTrip,
              prompt: lang === 'th'
                ? "วางแผนทริปภูเก็ต 3 วัน 2 คืน พักโรงแรมติดทะเล บรรยากาศเงียบสงบ เดินทางสะดวก"
                : "Plan a 3-day 2-night Phuket trip, beachfront hotel, quiet atmosphere, convenient travel",
              city: "ภูเก็ต",
              days: 3,
              budget: "high",
              theme: "relaxation",
            },
            {
              title: t.chiangmaiTrip,
              prompt: lang === 'th'
                ? "วางแผนทริปเชียงใหม่ 3 วัน เน้นไปร้านกาแฟ คาเฟ่สวยๆ บรรยากาศดี ถ่ายรูปสวย"
                : "Plan a 3-day Chiang Mai trip, focusing on beautiful cafes, great vibes, photo spots",
              city: "เชียงใหม่",
              days: 3,
              budget: "medium",
              theme: "cafe",
            },
            {
              title: t.tokyoTrip,
              prompt: lang === 'th'
                ? "วางแผนทริปโตเกียว 5 วัน เน้นชิมซูชิ ราเมน เนื้อย่าง และร้านอาหารยอดนิยมที่มีดาวมิชลิน"
                : "Plan a 5-day Tokyo trip, focusing on sushi, ramen, wagyu, and popular Michelin-starred restaurants",
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
              className="glass-panel text-xs px-3.5 py-1.5 rounded-full hover:bg-surface-hover hover:border-primary/35 text-on-surface cursor-pointer interactive-bounce"
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
                {t.loadingTitle}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs mx-auto">
                {t.loadingDesc}
              </p>
            </div>

            {/* Step-by-Step progress list */}
            <div className="w-full flex flex-col gap-3 bg-surface-container/60 border border-border/40 p-4.5 rounded-2xl text-left font-sans text-xs">
              {dynamicLoadingSteps.map((step, idx) => {
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
