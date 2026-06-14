import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { GlassCard } from "@/components/ui/GlassCard";
import { DirectBookButton } from "@/components/DirectBookButton";
import {
  getFlightById,
  getTicketsForFlight,
  getFlightTicketSummary,
  getAirportName,
  getFlightDuration,
  AIRLINE_COLORS,
} from "@/lib/flights";

const BAHT = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ChipVariant = "glass" | "primary" | "secondary" | "outline";

function statusVariant(status: string): ChipVariant {
  if (status === "CANCELLED") return "outline";
  if (status === "ISSUED") return "glass";
  if (status === "CHECKED_IN") return "secondary";
  return "primary";
}

function statusLabel(status: string) {
  switch (status) {
    case "ISSUED": return "ออกตั๋วแล้ว";
    case "CHECKED_IN": return "เช็คอินแล้ว";
    case "BOARDED": return "ขึ้นเครื่องแล้ว";
    case "CANCELLED": return "ยกเลิก";
    default: return status;
  }
}

export default async function FlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flight = await getFlightById(id);
  if (!flight) notFound();

  const [tickets, summary] = await Promise.all([
    getTicketsForFlight(id),
    getFlightTicketSummary(id),
  ]);

  const duration = getFlightDuration(flight.origin, flight.destination);
  const isDomestic = flight.price < 5000;
  const airlineColor =
    AIRLINE_COLORS[flight.airline] || "bg-primary/15 text-primary border-primary/30";

  // Estimated seat capacity based on flight type
  const totalSeats = isDomestic ? 180 : 300;
  const availableSeats = totalSeats - summary.total;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-on-surface-variant font-label text-sm">
        <Link
          href="/explore/flights"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          กลับสู่ผลการค้นหา
        </Link>
      </div>

      {/* Hero - Flight Route */}
      <GlassCard strong className="p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          {/* Airline & badge */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[28px]">flight</span>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
                {flight.airline}
              </h1>
              <p className="text-on-surface-variant text-sm mt-0.5">
                รหัสเที่ยวบิน: <span className="font-mono font-semibold">{flight.flight_id.toUpperCase()}</span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${airlineColor}`}>
                {flight.airline}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDomestic ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-violet-500/15 text-violet-500 border-violet-500/30"}`}>
                {isDomestic ? "ภายในประเทศ" : "ระหว่างประเทศ"}
              </span>
            </div>
          </div>

          {/* Giant route card */}
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 md:gap-8">
              {/* Origin */}
              <div className="flex-1 text-center md:text-left">
                <p className="font-display text-4xl md:text-6xl font-black text-on-surface">
                  {flight.origin}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {getAirportName(flight.origin)}
                </p>
                <p className="text-lg font-display font-bold text-primary mt-2">
                  {formatTime(flight.departure_time)}
                </p>
              </div>

              {/* Flight path */}
              <div className="flex-1 flex flex-col items-center px-2">
                <span className="font-label text-xs text-on-surface-variant mb-2">
                  {duration}
                </span>
                <div className="w-full flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="flex-1 relative">
                    <div className="border-t-2 border-dashed border-outline-variant" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container rounded-full p-2">
                      <span className="material-symbols-outlined text-primary text-[24px]">
                        flight
                      </span>
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                </div>
                <span className="font-label text-xs text-on-surface-variant mt-2">
                  บินตรง
                </span>
              </div>

              {/* Destination */}
              <div className="flex-1 text-center md:text-right">
                <p className="font-display text-4xl md:text-6xl font-black text-primary">
                  {flight.destination}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {getAirportName(flight.destination)}
                </p>
              </div>
            </div>

            {/* Date line */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                calendar_today
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {formatDateFull(flight.departure_time)}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Flight info cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-5 text-center">
              <span className="material-symbols-outlined text-primary text-[28px] mb-2">schedule</span>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">เวลาเดินทาง</p>
              <p className="font-display text-lg font-bold text-on-surface mt-1">{duration}</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <span className="material-symbols-outlined text-secondary text-[28px] mb-2">airline_seat_recline_normal</span>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">ที่นั่งว่าง</p>
              <p className="font-display text-lg font-bold text-on-surface mt-1">~{availableSeats}</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <span className="material-symbols-outlined text-emerald-500 text-[28px] mb-2">luggage</span>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">สัมภาระ</p>
              <p className="font-display text-lg font-bold text-on-surface mt-1">{isDomestic ? "20 กก." : "30 กก."}</p>
            </GlassCard>
            <GlassCard className="p-5 text-center">
              <span className="material-symbols-outlined text-amber-500 text-[28px] mb-2">restaurant</span>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">อาหาร</p>
              <p className="font-display text-lg font-bold text-on-surface mt-1">{isDomestic ? "ว่าง" : "รวม"}</p>
            </GlassCard>
          </div>

          {/* Fare details */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="font-display text-2xl text-on-surface mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              รายละเอียดค่าโดยสาร
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-on-surface-variant">ค่าตั๋วโดยสาร</span>
                <span className="font-semibold text-on-surface">{BAHT.format(flight.price * 0.82)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-on-surface-variant">ภาษีและค่าธรรมเนียม</span>
                <span className="font-semibold text-on-surface">{BAHT.format(flight.price * 0.12)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-on-surface-variant">ค่าประกัน</span>
                <span className="font-semibold text-on-surface">{BAHT.format(flight.price * 0.06)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-primary/5 rounded-xl px-4 -mx-4">
                <span className="font-display text-lg font-bold text-on-surface">รวมทั้งหมด</span>
                <span className="font-display text-2xl font-bold text-primary">{BAHT.format(flight.price)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Tickets table */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="font-display text-2xl text-on-surface mb-1 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">confirmation_number</span>
              ตั๋วที่มีบนเที่ยวบินนี้
            </h2>
            <p className="text-on-surface-variant text-sm mb-5">ข้อมูลรวมจาก flight_tickets ของระบบ</p>
            {tickets.length === 0 ? (
              <p className="text-on-surface-variant">ยังไม่มีตั๋วที่ออกสำหรับเที่ยวบินนี้</p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead className="text-left font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="px-2 py-2">รหัสตั๋ว</th>
                      <th className="px-2 py-2">ที่นั่ง</th>
                      <th className="px-2 py-2">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tickets.map((t) => (
                      <tr key={t.ticket_id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-2 py-3 font-mono text-xs text-on-surface-variant">{t.ticket_id}</td>
                        <td className="px-2 py-3 font-semibold">{t.seat}</td>
                        <td className="px-2 py-3">
                          <Chip variant={statusVariant(t.status)}>{statusLabel(t.status)}</Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            {/* Booking card */}
            <GlassCard strong className="p-6 ai-glow">
              <p className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">ราคาต่อท่าน</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl font-bold text-gradient">{BAHT.format(flight.price)}</span>
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">
                {isDomestic ? "รวมภาษี · สัมภาระ 20 กก." : "รวมภาษี · สัมภาระ 30 กก. · อาหาร"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <label className="glass-input rounded-xl px-3 py-2 flex flex-col">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant">ผู้ใหญ่</span>
                  <select className="bg-transparent outline-none text-on-surface text-sm">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                  </select>
                </label>
                <label className="glass-input rounded-xl px-3 py-2 flex flex-col">
                  <span className="font-label text-[10px] uppercase text-on-surface-variant">ชั้นโดยสาร</span>
                  <select className="bg-transparent outline-none text-on-surface text-sm">
                    <option>Economy</option>
                    <option>Business</option>
                    <option>First</option>
                  </select>
                </label>
              </div>

              <DirectBookButton
                item={{
                  type: "flight",
                  title: `${flight.airline} (${flight.origin} → ${flight.destination})`,
                  description: `เที่ยวบิน ${flight.flight_id.toUpperCase()} วันที่ ${formatDateFull(flight.departure_time)}`,
                  price: flight.price,
                  data: { flight_id: flight.flight_id },
                }}
                label="จองเที่ยวบินนี้"
                icon="bolt"
                className="mt-5 w-full py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              />
              <button className="mt-2 w-full py-3 rounded-xl glass-panel text-on-surface font-label text-sm hover:text-primary transition-colors">
                เพิ่มลงทริปกับ AI
              </button>
            </GlassCard>

            {/* Stats */}
            <GlassCard className="p-6">
              <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">insights</span>
                สถิติเที่ยวบิน
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-on-surface">{summary.total}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">ตั๋วทั้งหมด</p>
                </div>
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-emerald-500">{summary.boarded}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">ขึ้นเครื่องแล้ว</p>
                </div>
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-primary">{summary.checked_in}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">เช็คอินแล้ว</p>
                </div>
                <div className="bg-surface-container/40 rounded-xl p-3">
                  <p className="font-display text-xl font-bold text-on-surface-variant">{summary.cancelled}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">ยกเลิก</p>
                </div>
              </div>
            </GlassCard>

            {/* Included services */}
            <GlassCard className="p-6">
              <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">stars</span>
                สิ่งที่รวมอยู่ในตั๋ว
              </h3>
              <div className="space-y-3">
                {[
                  { icon: "luggage", label: `สัมภาระ ${isDomestic ? "20" : "30"} กก.`, included: true },
                  { icon: "backpack", label: "กระเป๋าถือขึ้นเครื่อง 7 กก.", included: true },
                  { icon: "restaurant", label: "อาหารบนเครื่อง", included: !isDomestic },
                  { icon: "wifi", label: "Wi-Fi บนเครื่อง", included: !isDomestic },
                  { icon: "headphones", label: "ระบบบันเทิงส่วนตัว", included: !isDomestic },
                  { icon: "swap_horiz", label: "เปลี่ยนเที่ยวบินได้", included: false },
                ].map((s) => (
                  <div key={s.icon} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${s.included ? "text-emerald-500" : "text-on-surface-variant/40"}`}>
                      {s.included ? "check_circle" : "cancel"}
                    </span>
                    <span className={`text-sm ${s.included ? "text-on-surface" : "text-on-surface-variant/60 line-through"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
