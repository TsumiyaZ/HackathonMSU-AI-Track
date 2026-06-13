import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { StarRating } from "@/components/ui/StarRating";
import { DirectBookButton } from "@/components/DirectBookButton";

import {
  getBookingsForHotel,
  getHotelById,
  getHotelBookingSummary,
  getHotelSentiment,
} from "@/lib/hotels";

const BAHT = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function sentimentTone(score: number) {
  if (score >= 0.5) return { label: "ยอดเยี่ยม", className: "text-emerald-400" };
  if (score >= 0.2) return { label: "ดี", className: "text-primary" };
  if (score >= -0.2) return { label: "ปานกลาง", className: "text-amber-400" };
  return { label: "ควรพิจารณา", className: "text-error" };
}

type ChipVariant = "glass" | "primary" | "secondary" | "outline";

function statusVariant(status: string): ChipVariant {
  if (status === "CANCELLED") return "outline";
  if (status === "PENDING") return "glass";
  return "primary";
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  if (!hotel) notFound();

  const [bookings, summary, sentiment] = await Promise.all([
    getBookingsForHotel(id),
    getHotelBookingSummary(id),
    getHotelSentiment(id),
  ]);

  const heroImages = [
    hotel.thumbnail_url,
    "https://placehold.co/800x600/0b0f10/adc6ff?text=Suite",
    "https://placehold.co/800x600/0b0f10/d0bcff?text=Spa",
    "https://placehold.co/800x600/0b0f10/adc6ff?text=Lounge",
    "https://placehold.co/800x600/0b0f10/d0bcff?text=Pool",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-on-surface-variant font-label text-sm">
        <Link
          href="/explore/hotels"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          กลับสู่ผลการค้นหา
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[420px] md:h-[480px] rounded-2xl overflow-hidden">
        <div
          className="md:col-span-2 md:row-span-2 relative bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImages[0]})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
        {heroImages.slice(1, 5).map((src, i) => (
          <div
            key={i}
            className="hidden md:block relative bg-cover bg-center"
            style={{ backgroundImage: `url(${src})` }}
          >
            {i === 3 && (
              <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                <span className="font-label text-sm text-primary font-bold glass-panel-strong px-4 py-2 rounded-full">
                  ดูรูปภาพทั้งหมด ({heroImages.length})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip variant="secondary">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI แนะนำ
          </Chip>
          {hotel.tags.map((t) => (
            <Chip key={t} variant="glass">{t}</Chip>
          ))}
        </div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-on-surface">{hotel.name}</h1>
            <p className="mt-2 text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              {hotel.city}, {hotel.country}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StarRating value={hotel.stars} size={22} />
            <span className="font-display text-2xl font-bold text-on-surface ml-2">
              {hotel.rating_avg.toFixed(1)}
            </span>
            <span className="text-on-surface-variant text-sm">
              ({sentiment?.sample_size ?? 0} รีวิว)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {sentiment && (
            <GlassCard strong className="p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <h2 className="font-display text-2xl text-on-surface mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">psychology</span>
                AI Sentiment Summary
                <span className={`ml-auto font-label text-sm ${sentimentTone(sentiment.score).className}`}>
                  {sentimentTone(sentiment.score).label}
                </span>
              </h2>
              <p className="text-on-surface-variant text-base leading-relaxed mb-6">
                {sentiment.summary}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container/40 p-5 rounded-xl border border-emerald-400/15">
                  <h3 className="font-label text-xs uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    จุดเด่น
                  </h3>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    {sentiment.highlights.length === 0 && <li>—</li>}
                    {sentiment.highlights.map((h, i) => (
                      <li key={i} className="flex gap-2"><span className="text-emerald-400">•</span> {h}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface-container/40 p-5 rounded-xl border border-amber-400/15">
                  <h3 className="font-label text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    ข้อควรพิจารณา
                  </h3>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    {sentiment.warnings.length === 0 && <li>—</li>}
                    {sentiment.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2"><span className="text-amber-400">•</span> {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6 md:p-8">
            <h2 className="font-display text-2xl text-on-surface mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">stars</span>
              สิ่งอำนวยความสะดวก
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hotel.amenities.map((a) => (
                <div key={a} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="text-sm capitalize text-on-surface">{a.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <h2 className="font-display text-2xl text-on-surface mb-1 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">event_note</span>
              การจองล่าสุด
            </h2>
            <p className="text-on-surface-variant text-sm mb-5">ข้อมูลรวมจาก hotel_bookings ของระบบ</p>
            {bookings.length === 0 ? (
              <p className="text-on-surface-variant">ยังไม่มีการจองสำหรับโรงแรมนี้</p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead className="text-left font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="px-2 py-2">รหัส</th>
                      <th className="px-2 py-2">Check in</th>
                      <th className="px-2 py-2">Check out</th>
                      <th className="px-2 py-2">ผู้เข้าพัก</th>
                      <th className="px-2 py-2">ราคา</th>
                      <th className="px-2 py-2">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.slice(0, 8).map((b) => (
                      <tr key={b.booking_id} className="hover:bg-white/5">
                        <td className="px-2 py-3 font-mono text-xs text-on-surface-variant">{b.booking_id}</td>
                        <td className="px-2 py-3">{b.check_in}</td>
                        <td className="px-2 py-3">{b.check_out}</td>
                        <td className="px-2 py-3">{b.guests}</td>
                        <td className="px-2 py-3 font-semibold">{BAHT.format(b.total_price)}</td>
                        <td className="px-2 py-3"><Chip variant={statusVariant(b.status)}>{b.status}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            <GlassCard strong className="p-6 ai-glow">
              <p className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">ราคาเริ่มต้น / คืน</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl font-bold text-gradient">{BAHT.format(hotel.price_per_night_thb)}</span>
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">{hotel.rooms_available} ห้องว่าง · รวมภาษีและบริการ</p>

              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <label className="glass-input rounded-xl px-3 py-2 flex flex-col">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant">Check-in</span>
                  <input type="date" defaultValue="2026-07-01" className="bg-transparent outline-none text-on-surface text-sm" />
                </label>
                <label className="glass-input rounded-xl px-3 py-2 flex flex-col">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant">Check-out</span>
                  <input type="date" defaultValue="2026-07-04" className="bg-transparent outline-none text-on-surface text-sm" />
                </label>
              </div>

              <DirectBookButton
                item={{
                  type: 'hotel',
                  title: hotel.name,
                  description: `เข้าพัก ${hotel.city}, ${hotel.country}`,
                  price: hotel.price_per_night_thb,
                  data: { hotel_id: hotel.id }
                }}
                label="จองทันที"
                icon="bolt"
                className="mt-5 w-full py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2"
              />
              <button className="mt-2 w-full py-3 rounded-xl glass-panel text-on-surface font-label text-sm hover:text-primary transition-colors">
                เพิ่มลงทริปกับ AI
              </button>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">insights</span>
                สถิติโรงแรม
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-on-surface">{summary.total}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">การจองทั้งหมด</p>
                </div>
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-emerald-400">{summary.upcoming}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">กำลังจะมา</p>
                </div>
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-primary">{summary.active}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">เช็คอินอยู่</p>
                </div>
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-on-surface">{BAHT.format(summary.revenue_thb)}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">รายได้รวม</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
