import Link from "next/link";
import { ArrowRight, CalendarCheck2, Plane, Sparkles } from "lucide-react";
import { AuthStatusButton } from "@/components/AuthStatusButton";
import { FeatureGrid } from "@/components/FeatureGrid";
import { TRANSLATIONS } from "@/lib/translations";

export default function Home() {
  const t = TRANSLATIONS.th;
  const quickLinks = [
    { href: "/plan", label: t.navPlan, icon: Sparkles },
    { href: "/bookings", label: t.navBookings, icon: CalendarCheck2 },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <section
        className="relative flex min-h-screen flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1877f2 0%, #0a4eac 45%, #042b80 100%)",
        }}
      >
        <div className="world-map-bg pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[600px] -translate-x-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse, #60a5fa 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #93c5fd 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center justify-between px-6 pb-4 pt-12">
          <Link href="/home" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.20)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.35)",
              }}
            >
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-3xl font-black tracking-tight text-white">TicketHub</span>
          </Link>

          <div className="relative z-20">
            <AuthStatusButton />
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10">
          <div className="text-center">
            <p className="font-label text-[11px] uppercase tracking-[0.32em] text-blue-200">
              AEROSTREAM · TICKETHUB
            </p>
            <h1 className="mt-5 font-display text-6xl font-black tracking-tight text-white sm:text-7xl md:text-8xl">
              TicketHub
            </h1>
            <h2 className="mt-4 font-display text-3xl font-black leading-tight text-blue-100 sm:text-4xl md:text-5xl">
              {t.landingTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-blue-100/92 md:text-base">
              {t.landingSub}
            </p>
          </div>

          <div className="splash-airplane w-full max-w-sm select-none md:max-w-md">
            <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
              <ellipse cx="240" cy="262" rx="130" ry="12" fill="rgba(0,0,0,0.18)" />
              <path
                d="M60 148 Q80 120 160 118 L340 114 Q400 112 430 128 Q450 138 440 152 Q428 164 400 168 L160 172 Q80 175 60 162 Z"
                fill="white"
              />
              <path
                d="M400 120 Q428 120 442 134 Q452 144 440 152 Q432 158 420 160 L380 160 L380 118 Z"
                fill="#bfdbfe"
                opacity="0.9"
              />
              {[200, 230, 260, 290, 320, 350].map((x) => (
                <rect key={x} x={x} y="128" width="18" height="12" rx="5" fill="#bfdbfe" opacity="0.85" />
              ))}
              <path d="M220 168 L160 240 L110 238 L170 168 Z" fill="white" opacity="0.92" />
              <path d="M220 168 L260 168 L240 240 L200 240 Z" fill="white" opacity="0.8" />
              <path d="M220 168 L160 240 L175 238 L230 168 Z" fill="#bfdbfe" opacity="0.4" />
              <path d="M80 118 L60 60 L100 60 L120 118 Z" fill="white" opacity="0.95" />
              <path d="M80 148 L40 175 L55 175 L90 153 Z" fill="white" opacity="0.88" />
              <path d="M80 148 L125 175 L110 175 L90 153 Z" fill="white" opacity="0.75" />
              <path d="M120 136 L400 128 L400 133 L120 141 Z" fill="#60a5fa" opacity="0.7" />
              <ellipse cx="200" cy="188" rx="28" ry="11" fill="#e2e8f0" />
              <ellipse cx="200" cy="188" rx="22" ry="8" fill="#cbd5e1" />
              <ellipse cx="270" cy="186" rx="24" ry="10" fill="#e2e8f0" />
              <ellipse cx="270" cy="186" rx="19" ry="7" fill="#cbd5e1" />
              <line x1="432" y1="130" x2="478" y2="115" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
              <line x1="432" y1="140" x2="472" y2="132" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
              <line x1="432" y1="150" x2="468" y2="148" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/home"
              id="splash-cta"
              className="ripple-btn relative flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "2.5px solid rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <ArrowRight className="h-7 w-7 text-[#1877f2]" />
              </div>
            </Link>
            <span className="font-label text-xs uppercase tracking-widest text-white/70">{t.landingStartBtn}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pb-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-white transition-all"
                  style={{
                    background: "rgba(255,255,255,0.13)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 L0 30 Q360 0 720 25 Q1080 50 1440 20 L1440 60 Z" className="fill-background" />
          </svg>
        </div>
      </section>

      <FeatureGrid />
    </div>
  );
}
