import Link from "next/link";
import { AuthStatusButton } from "@/components/AuthStatusButton";

type NavTile = {
  href: string;
  title: string;
  description: string;
  icon: string;
  ready: boolean;
};

const TILES: NavTile[] = [
  {
    href: "/explore/hotels",
    title: "สำรวจโรงแรม",
    description: "ค้นหาที่พักทั่วไทย พร้อมตัวกรองและบทสรุปจาก AI",
    icon: "hotel",
    ready: true,
  },
  {
    href: "/plan",
    title: "วางแผนทริปกับ AI",
    description: "พิมพ์สั้นๆ ว่าคุณอยากไปไหน AI จัดทริปให้ใน 1 คลิก",
    icon: "auto_awesome",
    ready: true,
  },
  {
    href: "/bookings",
    title: "การจองของฉัน",
    description: "ดู ค้นหา และจัดการการจองทั้งหมดในที่เดียว",
    icon: "event_available",
    ready: true,
  },
  {
    href: "/chat",
    title: "Travel Buddy",
    description: "แชทบอทผู้ช่วยถามพิกัด สถานที่ และไอเดียการเที่ยว",
    icon: "forum",
    ready: true,
  },
  {
    href: "/checkout",
    title: "ชำระเงิน",
    description: "จองแบบ 1-Click พร้อมบริการชำระเงินจำลอง",
    icon: "credit_card",
    ready: true,
  },
  {
    href: "/profile",
    title: "โปรไฟล์ของฉัน",
    description: "ตั้งค่าความชอบเพื่อให้ AI แนะนำทริปที่ตรงใจ",
    icon: "account_circle",
    ready: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface">

      {/* ═══════════════════════════════════════════ */}
      {/* SPLASH HERO — Full-viewport blue gradient  */}
      {/* ═══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1877f2 0%, #0a4eac 45%, #042b80 100%)",
        }}
      >
        {/* World-map dot pattern overlay */}
        <div className="absolute inset-0 world-map-bg pointer-events-none" />

        {/* Atmospheric glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #60a5fa 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #93c5fd 0%, transparent 70%)" }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 splash-fade-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.20)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.35)" }}>
              <span className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
            </div>
            <span className="font-display text-xl font-black text-white tracking-tight">TicketHub</span>
          </div>
          {/* Auth */}
          <div className="splash-fade-1">
            <AuthStatusButton />
          </div>
        </div>

        {/* ── Airplane SVG hero ── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-8 pb-8">

          {/* 3D-style Airplane */}
          <div className="splash-airplane splash-fade-2 w-full max-w-sm md:max-w-md select-none">
            <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
              {/* Shadow/ground reflection */}
              <ellipse cx="240" cy="262" rx="130" ry="12" fill="rgba(0,0,0,0.18)" />
              {/* Main fuselage */}
              <path d="M60 148 Q80 120 160 118 L340 114 Q400 112 430 128 Q450 138 440 152 Q428 164 400 168 L160 172 Q80 175 60 162 Z"
                fill="white" />
              {/* Cockpit window */}
              <path d="M400 120 Q428 120 442 134 Q452 144 440 152 Q432 158 420 160 L380 160 L380 118 Z"
                fill="#bfdbfe" opacity="0.9"/>
              {/* Window row */}
              {[200, 230, 260, 290, 320, 350].map((x, i) => (
                <rect key={i} x={x} y="128" width="18" height="12" rx="5" fill="#bfdbfe" opacity="0.85" />
              ))}
              {/* Main wing */}
              <path d="M220 168 L160 240 L110 238 L170 168 Z"
                fill="white" opacity="0.92" />
              <path d="M220 168 L260 168 L240 240 L200 240 Z"
                fill="white" opacity="0.80" />
              {/* Wing shading */}
              <path d="M220 168 L160 240 L175 238 L230 168 Z"
                fill="#bfdbfe" opacity="0.4" />
              {/* Tail fin vertical */}
              <path d="M80 118 L60 60 L100 60 L120 118 Z"
                fill="white" opacity="0.95" />
              {/* Tail fin horizontal */}
              <path d="M80 148 L40 175 L55 175 L90 153 Z"
                fill="white" opacity="0.88" />
              <path d="M80 148 L125 175 L110 175 L90 153 Z"
                fill="white" opacity="0.75" />
              {/* Blue accent stripe */}
              <path d="M120 136 L400 128 L400 133 L120 141 Z"
                fill="#60a5fa" opacity="0.7" />
              {/* Engine pod */}
              <ellipse cx="200" cy="188" rx="28" ry="11" fill="#e2e8f0" />
              <ellipse cx="200" cy="188" rx="22" ry="8" fill="#cbd5e1" />
              <ellipse cx="270" cy="186" rx="24" ry="10" fill="#e2e8f0" />
              <ellipse cx="270" cy="186" rx="19" ry="7" fill="#cbd5e1" />
              {/* Contrail lines */}
              <line x1="432" y1="130" x2="478" y2="115" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round"/>
              <line x1="432" y1="140" x2="472" y2="132" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="432" y1="150" x2="468" y2="148" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Headline */}
          <div className="text-center flex flex-col gap-3 splash-fade-3">
            <p className="font-label text-[11px] uppercase tracking-[0.3em] text-blue-200">
              AeroStream · TicketHub
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight max-w-md mx-auto">
              Elevate Your<br />
              <span style={{ color: "#93c5fd" }}>Travel Experience</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xs mx-auto leading-relaxed opacity-90">
              จองตั๋วเครื่องบิน โรงแรม และวางแผนทริปด้วย AI ในที่เดียว
            </p>
          </div>

          {/* ── Ripple CTA Button ── */}
          <div className="splash-fade-4 flex flex-col items-center gap-4 mt-2">
            <Link
              href="/explore/hotels"
              id="splash-cta"
              className="ripple-btn relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "2.5px solid rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "white" }}>
                <span className="material-symbols-outlined text-[28px]"
                  style={{ color: "#1877f2", fontVariationSettings: "'FILL' 1" }}>
                  chevron_right
                </span>
              </div>
            </Link>
            <span className="text-white/70 text-xs font-label tracking-widest uppercase">
              เริ่มต้นใช้งาน
            </span>
          </div>

          {/* Quick nav pills */}
          <div className="splash-fade-4 flex flex-wrap justify-center gap-2 pb-4">
            {[
              { href: "/plan", label: "วางแผนทริป", icon: "auto_awesome" },
              { href: "/bookings", label: "การจอง", icon: "event_available" },
              { href: "/chat", label: "Travel Buddy", icon: "forum" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-label text-white transition-all"
                style={{
                  background: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <span className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="relative z-10 -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 L0 30 Q360 0 720 25 Q1080 50 1440 20 L1440 60 Z"
              className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ═════════════════════════════════ */}
      {/* FEATURE GRID — below the fold   */}
      {/* ═════════════════════════════════ */}
      <section className="hidden sm:block px-4 md:px-12 pt-10 pb-24 md:pb-20 max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-on-surface">
              เลือกหน้าที่คุณต้องการ
            </h2>
            <p className="text-on-surface-variant mt-1 text-sm">
              ป้ายสีฟ้าคือหน้าที่พร้อมใช้งานแล้ว
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={
                "group glass-panel rounded-2xl p-4 md:p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 " +
                (tile.ready
                  ? "border border-primary/20 hover:border-primary/50"
                  : "opacity-70 hover:opacity-100")
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    "w-10 h-10 rounded-xl flex items-center justify-center " +
                    (tile.ready
                      ? "text-primary"
                      : "text-on-surface-variant")
                  }
                  style={tile.ready ? { background: "rgba(24,119,242,0.10)" } : { background: "rgba(0,0,0,0.05)" }}
                >
                  <span className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {tile.icon}
                  </span>
                </div>
                <span
                  className={
                    "font-label text-[10px] uppercase tracking-widest px-2 py-1 rounded-full " +
                    (tile.ready
                      ? "text-primary"
                      : "text-on-surface-variant")
                  }
                  style={tile.ready ? { background: "rgba(24,119,242,0.08)" } : { background: "rgba(0,0,0,0.04)" }}
                >
                  {tile.ready ? "พร้อมใช้" : "กำลังพัฒนา"}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                {tile.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{tile.description}</p>
              <div className="mt-auto pt-2 flex items-center gap-1 font-label text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                เปิดหน้า
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
