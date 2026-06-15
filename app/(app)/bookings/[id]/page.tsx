import Link from "next/link";
import { notFound } from "next/navigation";
import { getHotelById } from "@/lib/hotels";
import { getFlightTicketById, getFoodOrderById, getHotelBookingById } from "@/lib/bookings";

function getStatusBadgeClass(status: string) {
  if (["CONFIRMED", "CHECKED_IN", "ISSUED", "BOARDED", "DELIVERED", "PICKED_UP"].includes(status)) {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
  }

  if (["PENDING", "COOKING"].includes(status)) {
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/25";
  }

  if (status === "CANCELLED") {
    return "bg-red-500/10 text-red-500 border-red-500/25";
  }

  return "bg-surface/70 text-on-surface-variant border-border/60";
}

function formatThaiDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("th-TH", { dateStyle: "long" });
}

function formatThaiTime(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let booking: any = await getHotelBookingById(id);
  let type: "hotel" | "flight" | "food" | null = booking ? "hotel" : null;

  if (!booking) {
    booking = await getFlightTicketById(id);
    if (booking) type = "flight";
  }

  if (!booking) {
    booking = await getFoodOrderById(id);
    if (booking) type = "food";
  }

  if (type === "hotel" && booking?.hotel?.hotel_id) {
    const normalized = await getHotelById(booking.hotel.hotel_id);
    if (normalized) {
      booking.hotel.thumbnail_url = normalized.thumbnail_url;
    }
  }

  if (!booking || !type) {
    return notFound();
  }

  const isHotel = type === "hotel";
  const isFlight = type === "flight";
  const isFood = type === "food";

  const imageUrl = isHotel
    ? booking.hotel.thumbnail_url ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    : isFlight
      ? "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

  const headerLabel = isHotel ? "โรงแรม" : isFlight ? "เที่ยวบิน" : "อาหาร";
  const headerIcon = isHotel ? "hotel" : isFlight ? "flight" : "restaurant";
  const headerTitle = isHotel
    ? booking.hotel.name
    : isFlight
      ? `เที่ยวบิน ${booking.flight.airline}`
      : booking.restaurant.name;
  const bookingRef = isHotel ? booking.booking_id : isFlight ? booking.ticket_id : booking.order_id;
  const price = isHotel ? booking.total_price : isFlight ? booking.flight.price : booking.total_price;
  const metaTags = isHotel
    ? [
        booking.hotel.location,
        `${formatThaiDate(booking.check_in)} - ${formatThaiDate(booking.check_out)}`,
      ]
    : isFlight
      ? [
          `${booking.flight.origin} → ${booking.flight.destination}`,
          `${formatThaiDate(booking.flight.departure_time)} · ${formatThaiTime(booking.flight.departure_time)} น.`,
        ]
      : [
          `${booking.restaurant.cuisine || "Restaurant"} · ${booking.restaurant.rating || "-"} / 5`,
          `สั่งเมื่อ ${formatThaiDate(booking.created_at)} · ${formatThaiTime(booking.created_at)} น.`,
        ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12 px-4 md:px-0">
      <Link
        href="/bookings"
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit text-sm font-bold mt-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        กลับหน้ารายการจอง
      </Link>

      <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: 180 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isFood
              ? "linear-gradient(135deg, rgba(6,78,59,0.88) 0%, rgba(0,0,0,0.42) 100%)"
              : isHotel
                ? "linear-gradient(135deg, rgba(10,78,172,0.82) 0%, rgba(0,0,0,0.48) 100%)"
                : "linear-gradient(135deg, rgba(2,30,90,0.88) 0%, rgba(0,0,0,0.42) 100%)",
          }}
        />

        <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4 min-h-[180px]">
          <div className="flex flex-col gap-2 justify-end flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {headerIcon}
              </span>
              <span className="font-label text-[11px] uppercase tracking-widest text-blue-200">
                {headerLabel}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-primary font-mono text-[10px] font-bold px-3 py-1 bg-primary/20 rounded-full border border-primary/20 backdrop-blur-md w-fit">
              รหัสรายการ: {bookingRef}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-black text-white drop-shadow leading-tight">
              {headerTitle}
            </h1>

            <div className="flex flex-wrap gap-2 mt-1">
              {metaTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-label px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.20)", color: "white" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end">
            <p className="text-[10px] text-white/60 uppercase tracking-wider">ยอดชำระสุทธิ</p>
            <p className="font-display text-2xl md:text-3xl font-black text-primary drop-shadow">
              ฿{price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          {isHotel ? (
            <div className="glass-panel p-5 md:p-6 rounded-2xl border border-border/80 flex flex-col gap-5">
              <div className="flex justify-between items-center pb-3 border-b border-border/40">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    hotel
                  </span>
                  รายละเอียดที่พัก
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="font-bold text-on-surface text-base">{booking.hotel.name}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {booking.hotel.location}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">จำนวนผู้เข้าพัก</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{booking.guests} ท่าน</span>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">เช็คอิน - เช็คเอาต์</span>
                  <span className="font-bold text-on-surface mt-0.5 block">
                    {formatThaiDate(booking.check_in)} → {formatThaiDate(booking.check_out)}
                  </span>
                </div>

                <div className="col-span-2 pt-3 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">สิ่งอำนวยความสะดวก</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {booking.hotel.amenities.map((amenity: string) => (
                      <span key={amenity} className="text-[10px] bg-surface-container border border-border/40 px-2.5 py-1 rounded-md text-on-surface-variant">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isFlight ? (
            <div className="glass-panel p-5 md:p-6 rounded-2xl border border-border/80 flex flex-col gap-5">
              <div className="flex justify-between items-center pb-3 border-b border-border/40">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    flight
                  </span>
                  รายละเอียดเที่ยวบิน
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-4 bg-primary/5 border border-primary/10 flex items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <p className="font-display text-xl font-black text-on-surface">{booking.flight.origin}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">สนามบินต้นทาง</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <div className="w-full border-t-2 border-dashed border-primary/30 absolute top-1/2 -translate-y-1/2" />
                  <span className="material-symbols-outlined text-primary text-[20px] bg-surface relative z-10 px-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                    flight_takeoff
                  </span>
                </div>
                <div className="text-center flex-1">
                  <p className="font-display text-xl font-black text-on-surface">{booking.flight.destination}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">สนามบินปลายทาง</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">สายการบิน</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{booking.flight.airline}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">ที่นั่ง</span>
                  <span className="font-bold text-primary font-mono mt-0.5 block text-sm">{booking.seat}</span>
                </div>
                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">วันเดินทาง</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{formatThaiDate(booking.flight.departure_time)}</span>
                </div>
                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">เวลาเดินทาง</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{formatThaiTime(booking.flight.departure_time)} น.</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">รหัสเที่ยวบิน</span>
                  <span className="font-mono text-on-surface mt-0.5 block">{booking.flight.flight_id}</span>
                </div>
              </div>
            </div>
          ) : null}

          {isFood ? (
            <div className="glass-panel p-5 md:p-6 rounded-2xl border border-border/80 flex flex-col gap-5">
              <div className="flex justify-between items-center pb-3 border-b border-border/40">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    restaurant
                  </span>
                  รายละเอียดคำสั่งอาหาร
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">ร้านอาหาร</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{booking.restaurant.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">ประเภทอาหาร</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{booking.restaurant.cuisine || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">เวลาสั่ง</span>
                  <span className="font-bold text-on-surface mt-0.5 block">
                    {formatThaiDate(booking.created_at)} · {formatThaiTime(booking.created_at)} น.
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">เวลาจัดส่งโดยประมาณ</span>
                  <span className="font-bold text-on-surface mt-0.5 block">
                    {booking.restaurant.delivery_time_min || "-"} นาที
                  </span>
                </div>
                <div className="sm:col-span-2 pt-3 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">รายการอาหาร</span>
                  <div className="mt-2 flex flex-col gap-2">
                    {booking.menu_items.map((item: string, index: number) => (
                      <div key={`${item}-${index}`} className="flex items-center justify-between rounded-xl bg-surface-container/70 px-3 py-2 border border-border/40">
                        <span className="text-sm text-on-surface">{item}</span>
                        <span className="text-[10px] text-on-surface-variant">#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {booking.rider_name ? (
                  <div className="sm:col-span-2 pt-3 border-t border-border/20">
                    <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">ผู้จัดส่ง</span>
                    <span className="font-bold text-on-surface mt-0.5 block">{booking.rider_name}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <div>
              <p className="text-xs font-bold text-primary mb-0.5">ข้อมูลเพิ่มเติม</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {isFood
                  ? "หากต้องการเปลี่ยนร้านอาหารหรือหาเมนูเพิ่มเติม สามารถใช้ Travel Buddy เพื่อช่วยแนะนำตัวเลือกใกล้เคียงได้ทันที"
                  : "หากต้องการเปลี่ยนแผน ยกเลิก หรือขอคำแนะนำเพิ่มเติม สามารถคุยกับ Travel Buddy ได้ตลอดเวลา"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col gap-4">
            <h3 className="font-display text-sm font-bold border-b border-border/40 pb-2.5">
              ผู้ใช้งาน
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {booking.user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-on-surface truncate">{booking.user?.name || "ผู้ใช้งานระบบ"}</p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">{booking.user?.email || ""}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{booking.user?.phone || ""}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col gap-4">
            <h3 className="font-display text-sm font-bold border-b border-border/40 pb-2.5">
              ต้องการความช่วยเหลือ?
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              สอบถามเรื่องแผนการเดินทาง การย้ายวันเข้าพัก เที่ยวบิน หรือหาร้านอาหารใหม่เพิ่มเติมได้จาก Travel Buddy
            </p>
            <Link
              href="/help"
              className="w-full py-2.5 rounded-xl border border-primary/50 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              เปิดหน้าช่วยเหลือ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
