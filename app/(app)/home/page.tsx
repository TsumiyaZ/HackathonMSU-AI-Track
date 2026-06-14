"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Hotel } from "@/lib/types";

/* ── Static quick actions / tips (no DB needed client-side) ── */
const quickActions = [
  {
    href: "/plan",
    icon: "auto_awesome",
    label: "วางแผนทริป AI",
    desc: "บอก AI ว่าอยากไปไหน จัดให้เลย",
    color: "text-blue-500",
    bg: "rgba(24,119,242,0.12)",
  },
  {
    href: "/explore/hotels",
    icon: "hotel",
    label: "สำรวจโรงแรม",
    desc: "ค้นหาที่พักที่ตรงใจทั่วไทย",
    color: "text-emerald-500",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    href: "/bookings",
    icon: "event_available",
    label: "การจองของฉัน",
    desc: "ตรวจสอบและจัดการทริปที่จองไว้",
    color: "text-violet-500",
    bg: "rgba(139,92,246,0.12)",
  },

];

const tips = [
  {
    icon: "tips_and_updates",
    title: "จองล่วงหน้าประหยัดกว่า",
    desc: "โรงแรมส่วนใหญ่ให้ราคาดีกว่าถ้าจองก่อน 7-14 วัน",
    color: "text-amber-500",
  },
  {
    icon: "explore",
    title: "ลองเที่ยว Off-Season",
    desc: "เดินทางนอกฤดูท่องเที่ยวราคาลดได้ถึง 40%",
    color: "text-sky-500",
  },
  {
    icon: "auto_awesome",
    title: "ให้ AI วางแผนให้คุณ",
    desc: "พิมพ์แค่ปลายทางและจำนวนวัน AI จัดตารางและแนะนำที่พักให้ทันที",
    color: "text-primary",
  },
];

const HERO_SLIDES = [
  {
    src: "/hero-ocean.jpg",
    label: "หมู่เกาะกระบี่",
    sublabel: "ทะเลสวรรค์แห่งอันดามัน",
  },
  {
    src: "/hero-temple.jpg",
    label: "วัดอรุณ กรุงเทพฯ",
    sublabel: "สัมผัสความงามแห่งสยาม",
  },
  {
    src: "/hero-mountain.jpg",
    label: "ดอยอินทนนท์ เชียงใหม่",
    sublabel: "หมอกเช้า ป่าเขียว อากาศบริสุทธิ์",
  },
];

/* ─────────────────────────────────────────────────────── */
/* Client component — handles slideshow + all sections    */
/* ─────────────────────────────────────────────────────── */
export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  /* Auto-advance slideshow every 5 s */
  useEffect(() => {
    setLoaded(true);
    const id = setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      5000
    );

    // Fetch recommended hotels
    fetch("/api/hotels")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          // Sort by rating_avg desc to get high-rated recommendations
          const sorted = [...res.data].sort((a: any, b: any) => b.rating_avg - a.rating_avg);
          setHotels(sorted.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error fetching hotels:", err))
      .finally(() => setLoadingHotels(false));

    return () => clearInterval(id);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "อรุณสวัสดิ์ 🌅" : hour < 17 ? "สวัสดีตอนบ่าย ☀️" : "สวัสดีตอนเย็น 🌆";

  return (
    <div className="flex flex-col w-full relative">

      {/* ══════════════════════════════════════════════════════ */}
      {/* DECORATIVE BG LAYER — theme-colored shapes            */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
        {/* Top half-circle arc */}
        <div
          style={{
            position: "absolute",
            top: "-220px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "440px",
            borderRadius: "9999px",
            background: "radial-gradient(ellipse at 50% 30%, rgba(24,119,242,0.22) 0%, rgba(24,119,242,0.06) 55%, transparent 75%)",
          }}
        />
        {/* Soft blob — top right */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "-80px",
            width: "280px",
            height: "280px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(24,119,242,0.13) 0%, transparent 70%)",
          }}
        />
        {/* Soft blob — lower left */}
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: "-100px",
            width: "320px",
            height: "320px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(24,119,242,0.10) 0%, transparent 70%)",
          }}
        />
        {/* Half-ring stroke top-left decorative */}
        <svg
          style={{ position: "absolute", top: "-60px", left: "-60px", opacity: 0.12 }}
          width="260" height="260" viewBox="0 0 260 260" fill="none"
        >
          <circle cx="130" cy="130" r="110" stroke="#1877f2" strokeWidth="28" strokeDasharray="200 500" strokeLinecap="round" />
        </svg>
        {/* Small accent ring — bottom right */}
        <svg
          style={{ position: "absolute", bottom: "120px", right: "-40px", opacity: 0.10 }}
          width="180" height="180" viewBox="0 0 180 180" fill="none"
        >
          <circle cx="90" cy="90" r="70" stroke="#1877f2" strokeWidth="18" strokeDasharray="120 400" strokeLinecap="round" />
        </svg>
        {/* Dot grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(24,119,242,0.18) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.35,
          }}
        />
      </div>

      {/* All content sits above the bg layer */}
      <div className="relative z-10 flex flex-col w-full">

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO — full-viewport photo slideshow                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden rounded-2xl mb-6"
        style={{ height: "min(85vh, 560px)", minHeight: 340 }}>

        {/* Background slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: loaded && slide === i ? 1 : 0,
            }}
          >
            <Image
              src={s.src}
              alt={s.label}
              fill
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Gradient overlays — top-to-bottom + bottom strong */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.65) 100%)" }} />

        {/* Top — greeting */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
          <div>
            <p className="text-white/80 text-xs font-label mb-0.5">{greeting}</p>
            <h1 className="font-display text-xl font-black text-white drop-shadow">
              ยินดีต้อนรับสู่ TicketHub
            </h1>
          </div>
          {/* Slide dots */}
          <div className="flex gap-1.5 mt-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all press-scale duration-300`}
                style={{
                  width: slide === i ? 20 : 6,
                  height: 6,
                  background: slide === i ? "white" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom — location label + CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          {/* Location tag */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-white/80 text-[16px]">location_on</span>
            <div>
              <p className="text-white font-display text-lg font-bold leading-tight drop-shadow">
                {HERO_SLIDES[slide].label}
              </p>
              <p className="text-white/70 text-xs">{HERO_SLIDES[slide].sublabel}</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <Link
                href="/plan"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-label text-sm font-bold text-white transition-all hover-lift press-scale"
                style={{ background: "#1877f2" }}
              >
              <span className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              วางแผนทริป AI
            </Link>
            <Link
              href="/explore/hotels"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-label text-sm font-bold text-white transition-all hover-lift press-scale"
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}
            >
              <span className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
              โรงแรม
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-28 right-5 z-10 flex flex-col items-center gap-1 opacity-60">
          <span className="text-white text-[10px] font-label">เลื่อนลง</span>
          <span className="material-symbols-outlined text-white text-[18px]"
            style={{ animation: "float 1.8s ease-in-out infinite" }}>
            keyboard_arrow_down
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* CONTENT — scrollable below                           */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-24 md:pb-6 px-0">

        {/* ── AI Trip Planner Banner ── */}
        <section className="relative overflow-hidden rounded-2xl p-5 md:p-6 border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-sm">
          {/* Decorative glowing blobs */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest font-black">ฟีเจอร์แนะนำ</span>
              </div>
              <h3 className="font-display text-lg font-black text-on-surface leading-tight mt-1">
                วางแผนทริปด้วย AI ในไม่กี่วินาที
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xl leading-relaxed">
                แค่อธิบายสไตล์การท่องเที่ยวและจำนวนวัน AI จะออกแบบตารางเวลา การเดินทาง และที่พักที่เหมาะสมที่สุดสำหรับคุณทันที!
              </p>
            </div>
            
            <Link
              href="/plan"
              className="btn-primary-gradient px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow transition-all disabled:opacity-40 disabled:pointer-events-none hover-lift press-scale"
              style={{ background: "#1877f2" }}
            >
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              เริ่มต้นวางแผน
            </Link>
          </div>
        </section>

        {/* ── Booking Services ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-on-surface">จองกับเรา</h2>
          </div>
          <div className="flex flex-col gap-3">

            {/* Hotel Booking Card */}
            <Link
              href="/explore/hotels"
              className="relative rounded-2xl overflow-hidden flex items-end group transition-transform hover:scale-[1.01] hover-lift press-scale"
              style={{ minHeight: 140 }}
            >
              {/* BG image */}
              <div className="absolute inset-0"
                style={{ backgroundImage: "url(/hero-temple.jpg)", backgroundSize: "cover", backgroundPosition: "center" }} />
              {/* Overlay */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(10,78,172,0.80) 0%, rgba(0,0,0,0.45) 100%)" }} />
              {/* Content */}
              <div className="relative z-10 p-5 flex items-end justify-between w-full">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-white text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                    <span className="font-label text-[11px] uppercase tracking-widest text-blue-200">บริการของเรา</span>
                  </div>
                  <p className="font-display text-xl font-black text-white leading-tight">จองโรงแรม</p>
                  <p className="text-white/70 text-xs mt-1">ค้นหาและจองที่พักคุณภาพทั่วไทย</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {["ราคาดีที่สุด", "ยกเลิกได้ฟรี", "จ่ายที่โรงแรม"].map((tag) => (
                      <span key={tag} className="text-[10px] font-label px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.20)", color: "white" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform"
                  style={{ background: "rgba(255,255,255,0.20)" }}>
                  <span className="material-symbols-outlined text-white text-[20px]">chevron_right</span>
                </div>
              </div>
            </Link>

            {/* Flight Ticket Card */}
            <Link
              href="/explore/flights"
              className="relative rounded-2xl overflow-hidden flex items-end group transition-transform hover:scale-[1.01] hover-lift press-scale"
              style={{ minHeight: 140 }}
            >
              {/* BG image */}
              <div className="absolute inset-0"
                style={{ backgroundImage: "url(/hero-ocean.jpg)", backgroundSize: "cover", backgroundPosition: "center top" }} />
              {/* Overlay */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(2,30,90,0.85) 0%, rgba(0,0,0,0.40) 100%)" }} />
              {/* Content */}
              <div className="relative z-10 p-5 flex items-end justify-between w-full">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-white text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
                    <span className="font-label text-[11px] uppercase tracking-widest text-blue-200">บริการของเรา</span>
                  </div>
                  <p className="font-display text-xl font-black text-white leading-tight">จองตั๋วเดินทาง</p>
                  <p className="text-white/70 text-xs mt-1">เที่ยวบินในประเทศและต่างประเทศ ราคาดีที่สุด</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {["เที่ยวบินตรง", "Low-cost", "เช็ค e-Ticket"].map((tag) => (
                      <span key={tag} className="text-[10px] font-label px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.20)", color: "white" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform"
                  style={{ background: "rgba(255,255,255,0.20)" }}>
                  <span className="material-symbols-outlined text-white text-[20px]">chevron_right</span>
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* ── Recommended Hotels ── */}
        <section className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  star
                </span>
                <h2 className="font-display text-lg font-bold text-on-surface tracking-tight">
                  ที่พักคัดสรรโดย AI
                </h2>
              </div>
              <p className="text-xs text-on-surface-variant">
                คัดสรรที่พักยอดนิยม เรตติ้งดีที่สุดเพื่อคุณ
              </p>
            </div>
            <Link 
              href="/explore/hotels" 
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline shrink-0 hover-lift press-scale"
            >
              ดูทั้งหมด
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loadingHotels ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
                  <div className="bg-white/10 rounded-xl w-full h-32" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="mt-auto h-6 bg-white/10 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {hotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={`/explore/hotel/${hotel.id}`}
                  className="group hover-lift press-scale"
                >
                  <div className="glass-panel overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
                    <div
                      className="relative h-32 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${hotel.thumbnail_url})` }}
                    >
                      
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-label text-[10px] text-white">
                          ว่าง {hotel.rooms_available} ห้อง
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs text-primary font-bold flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-[11px]">location_on</span>
                            {hotel.city}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {hotel.rating_avg.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="font-display text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors mt-1">
                          {hotel.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {hotel.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[9px] font-label px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-on-surface-variant">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-2 border-t border-white/5 flex items-end justify-between">
                        <div>
                          <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-wider">เริ่มต้น</p>
                          <p className="font-display text-sm font-bold text-on-surface">
                            ฿{hotel.price_per_night_thb.toLocaleString()}
                          </p>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Travel Tips ── */}
        <section>
          <h2 className="font-display text-lg font-bold text-on-surface mb-3">
            เคล็ดลับการเดินทาง
          </h2>
          <div className="flex flex-col gap-3">
            {tips.map((tip, i) => (
              <div key={i}
                className="glass-panel p-4 rounded-2xl flex flex-col justify-between gap-3 border border-white/5 hover:border-emerald-500/20 transition-all hover-lift press-scale">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(24,119,242,0.08)" }}>
                  <span className={`material-symbols-outlined text-[20px] ${tip.color}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}>{tip.icon}</span>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-on-surface">{tip.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
      </div>



    </div>
  );
}
