"use client";

import Link from "next/link";
import { useTripStore } from "@/lib/store";

export default function HelpPage() {
  const lang = useTripStore((s) => s.lang);

  const faqs = lang === 'th' ? [
    {
      q: "จะเริ่มต้นวางแผนการเดินทางด้วย AI ได้อย่างไร?",
      a: "เพียงไปที่เมนู 'วางแผน' กรอกจุดหมายปลายทาง วันที่ และสไตล์การท่องเที่ยวที่คุณชอบ AI จะสร้างแผนการเดินทางที่เหมาะสมที่สุดให้คุณทันที"
    },
    {
      q: "สามารถแก้ไขแผนการเดินทางที่ AI สร้างขึ้นได้หรือไม่?",
      a: "ได้แน่นอน! คุณสามารถปรับแต่ง ลบ หรือเพิ่มสถานที่และกิจกรรมต่างๆ ในแผนการเดินทางของคุณได้อย่างอิสระ"
    },
    {
      q: "การจองโรงแรมและเที่ยวบินผ่านแพลตฟอร์มปลอดภัยหรือไม่?",
      a: "ปลอดภัย 100% เราเชื่อมต่อกับผู้ให้บริการที่เชื่อถือได้และมีระบบรักษาความปลอดภัยในการชำระเงินระดับมาตรฐานสากล"
    },
    {
      q: "จะติดต่อเจ้าหน้าที่ได้อย่างไร?",
      a: "คุณสามารถติดต่อเราได้ทางอีเมล support@triparchitect.ai หรือผ่านทางแชทสดในเวลาทำการ 09:00 - 18:00 น."
    }
  ] : [
    {
      q: "How do I start planning a trip with AI?",
      a: "Just go to the 'Plan' menu, enter your destination, dates, and preferred travel style. The AI will immediately design the most suitable itinerary for you."
    },
    {
      q: "Can I edit the AI-generated itinerary?",
      a: "Absolutely! You can freely customize, delete, or add activities, hotels, and attractions in your itinerary."
    },
    {
      q: "Is booking hotels and flights through the platform safe?",
      a: "100% safe. We connect with reliable service providers and utilize international standard secure payment systems."
    },
    {
      q: "How can I contact support?",
      a: "You can reach us via email at support@triparchitect.ai or through live chat during our business hours from 9:00 AM to 6:00 PM."
    }
  ];

  return (
    <div className="flex flex-col w-full relative pb-12 px-4 md:px-0">
      {/* Decorative Background Layer */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col w-full max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 mt-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20 ai-glow">
            <span className="material-symbols-outlined text-white text-[32px]">support_agent</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black text-on-surface mb-4">
            {lang === 'th' ? (
              <>
                ศูนย์<span className="text-gradient">ช่วยเหลือ</span>
              </>
            ) : (
              <>
                Help <span className="text-gradient">Center</span>
              </>
            )}
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {lang === 'th'
              ? "มีคำถามหรือข้อสงสัย? เราพร้อมช่วยเหลือคุณเสมอ ค้นหาคำตอบที่พบบ่อยหรือติดต่อทีมงานของเรา"
              : "Have questions or concerns? We are always here to help. Find frequently asked questions or contact our support team."}
          </p>
        </header>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">mail</span>
            </div>
            <h3 className="font-display text-lg font-bold text-on-surface mb-2">
              {lang === 'th' ? "อีเมล" : "Email"}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              {lang === 'th'
                ? "ส่งคำถามของคุณมาหาเรา เราจะตอบกลับภายใน 24 ชั่วโมง"
                : "Send us your questions, and we will reply within 24 hours."}
            </p>
            <a href="mailto:support@triparchitect.ai" className="font-label text-sm text-teal-400 hover:text-teal-300 font-bold">
              support@triparchitect.ai
            </a>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">forum</span>
            </div>
            <h3 className="font-display text-lg font-bold text-on-surface mb-2">
              {lang === 'th' ? "แชทสด" : "Live Chat"}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              {lang === 'th'
                ? "พูดคุยกับเจ้าหน้าที่ของเรา (09:00 - 18:00 น.)"
                : "Chat with our support agents (09:00 AM - 06:00 PM)"}
            </p>
            <button className="font-label text-sm px-5 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-bold transition-colors">
              {lang === 'th' ? "เริ่มการสนทนา" : "Start Conversation"}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-teal-400">help</span>
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {lang === 'th' ? "คำถามที่พบบ่อย (FAQ)" : "Frequently Asked Questions (FAQ)"}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
                <h4 className="font-display text-base font-bold text-on-surface mb-2 flex items-start gap-2">
                  <span className="text-teal-500 shrink-0">Q:</span>
                  {faq.q}
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed flex items-start gap-2">
                  <span className="text-on-surface-variant/50 shrink-0 font-bold">A:</span>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
