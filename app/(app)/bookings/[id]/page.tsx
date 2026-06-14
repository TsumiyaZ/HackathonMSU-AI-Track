import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHotelById } from "@/lib/hotels";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let booking: any = null;
  let type: "hotel" | "flight" = "hotel";

  try {
    // 1. Check if it's a hotel booking
    booking = await prisma.hotelBooking.findUnique({
      where: { booking_id: id },
      include: { hotel: true, user: true },
    });

    if (booking) {
      type = "hotel";
      // Fetch normalized hotel to get the beautiful Unsplash thumbnail
      const normalized = await getHotelById(booking.hotel.hotel_id);
      if (normalized) {
        booking.hotel.thumbnail_url = normalized.thumbnail_url;
      }
    } else {
      // 2. Check if it's a flight ticket
      booking = await prisma.flightTicket.findUnique({
        where: { ticket_id: id },
        include: { flight: true, user: true },
      });
      if (booking) {
        type = "flight";
      }
    }
  } catch (err) {
    console.warn("⚠️ Database query failed. Falling back to mock details.");
    
    // Fallback logic for offline / mock dev
    if (id.startsWith("hb-")) {
      type = "hotel";
      booking = {
        booking_id: id,
        status: "CONFIRMED",
        total_price: 28300,
        check_in: new Date("2026-08-15"),
        check_out: new Date("2026-08-18"),
        guests: 2,
        hotel: {
          hotel_id: "H-1234",
          name: "Sri Panwa Phuket Luxury Pool Villa",
          location: "ภูเก็ต, ประเทศไทย",
          rating: 4.8,
          amenities: ["Free Wi-Fi", "Pool", "Spa", "Fitness Center"],
        },
        user: {
          name: "Test User",
          email: "test@example.com",
          phone: "081-234-5678",
        },
      };
      
      const normalized = await getHotelById(booking.hotel.hotel_id);
      if (normalized) {
        booking.hotel.thumbnail_url = normalized.thumbnail_url;
      }
    } else {
      type = "flight";
      booking = {
        ticket_id: id,
        status: "CONFIRMED",
        seat: "12A",
        flight: {
          flight_id: "FL-987",
          airline: "Thai Airways",
          origin: "Bangkok (BKK)",
          destination: "Phuket (HKT)",
          departure_time: new Date("2026-08-15T08:30:00Z"),
          price: 3200,
        },
        user: {
          name: "Test User",
          email: "test@example.com",
          phone: "081-234-5678",
        },
      };
    }
  }

  if (!booking) {
    return notFound();
  }

  // Format parameters
  const isHotel = type === "hotel";
  const statusLabel = booking.status;
  const priceFormatted = isHotel ? booking.total_price : booking.flight.price;
  
  // Header image logic
  const imageUrl = isHotel 
    ? (booking.hotel.thumbnail_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80")
    : "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80"; // Premium flight image

  const checkInStr = isHotel ? new Date(booking.check_in).toLocaleDateString("th-TH", { dateStyle: "long" }) : "";
  const checkOutStr = isHotel ? new Date(booking.check_out).toLocaleDateString("th-TH", { dateStyle: "long" }) : "";
  const flightTimeStr = !isHotel ? new Date(booking.flight.departure_time).toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "";
  const flightHourStr = !isHotel ? new Date(booking.flight.departure_time).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }) : "";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12 px-4 md:px-0">
      {/* Back button */}
      <Link href="/bookings" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit text-sm font-bold mt-4">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        กลับหน้ารายการจอง
      </Link>

      {/* Main Details Banner — styled like home page cards */}
      <div
        className="relative w-full rounded-2xl overflow-hidden group transition-transform"
        style={{ minHeight: 180 }}
      >
        {/* BG image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient overlay — same style as home */}
        <div
          className="absolute inset-0"
          style={{
            background: isHotel
              ? "linear-gradient(135deg, rgba(10,78,172,0.82) 0%, rgba(0,0,0,0.48) 100%)"
              : "linear-gradient(135deg, rgba(2,30,90,0.88) 0%, rgba(0,0,0,0.42) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4 min-h-[180px]">
          <div className="flex flex-col gap-2 justify-end flex-1">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isHotel ? "hotel" : "flight"}
              </span>
              <span className="font-label text-[11px] uppercase tracking-widest text-blue-200">
                {isHotel ? "โรงแรม" : "เที่ยวบิน"}
              </span>
            </div>

            {/* Booking ID pill */}
            <div className="inline-flex items-center gap-1.5 text-primary font-mono text-[10px] font-bold px-3 py-1 bg-primary/20 rounded-full border border-primary/20 backdrop-blur-md w-fit">
              {isHotel ? "หมายเลขการจอง:" : "หมายเลขตั๋วบิน:"}{" "}
              {isHotel ? booking.booking_id : booking.ticket_id}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl font-black text-white drop-shadow leading-tight">
              {isHotel ? booking.hotel.name : `เที่ยวบิน ${booking.flight.airline}`}
            </h1>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                isHotel
                  ? booking.hotel.location
                  : `${booking.flight.origin} ➔ ${booking.flight.destination}`,
                isHotel
                  ? `${checkInStr} – ${checkOutStr}`
                  : `${flightTimeStr} · ${flightHourStr} น.`,
              ].map((tag) => (
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

          {/* Price */}
          <div
            className="shrink-0 flex flex-col items-start md:items-end"
          >
            <p className="text-[10px] text-white/60 uppercase tracking-wider">ยอดชำระสุทธิ</p>
            <p className="font-display text-2xl md:text-3xl font-black text-primary drop-shadow">
              ฿{priceFormatted.toLocaleString()}
            </p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content panel */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {isHotel ? (
            /* Hotel Details Layout */
            <div className="glass-panel p-5 md:p-6 rounded-2xl border border-border/80 flex flex-col gap-5">
              <div className="flex justify-between items-center pb-3 border-b border-border/40">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    hotel
                  </span>
                  รายละเอียดที่พัก
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  statusLabel === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/25"
                }`}>
                  {statusLabel}
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
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">เช็คอิน - เช็คเอาท์</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{booking.guests} ท่าน</span>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">วันเช็คอิน</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{checkInStr} (หลัง 14:00)</span>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">วันเช็คเอาท์</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{checkOutStr} (ก่อน 12:00)</span>
                </div>

                <div className="col-span-2 pt-3 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">สิ่งอำนวยความสะดวก</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {booking.hotel.amenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-surface-container border border-border/40 px-2.5 py-1 rounded-md text-on-surface-variant">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Flight Ticket Layout */
            <div className="glass-panel p-5 md:p-6 rounded-2xl border border-border/80 flex flex-col gap-5">
              <div className="flex justify-between items-center pb-3 border-b border-border/40">
                <h2 className="font-display text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    flight
                  </span>
                  รายละเอียดเที่ยวบิน
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  statusLabel === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/25"
                }`}>
                  {statusLabel}
                </span>
              </div>

              {/* Visual Airport Route Indicator */}
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
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">ที่นั่ง (Seat)</span>
                  <span className="font-bold text-primary font-mono mt-0.5 block text-sm">{booking.seat}</span>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">วันที่ออกเดินทาง</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{flightTimeStr}</span>
                </div>

                <div className="pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">เวลาออกเดินทาง</span>
                  <span className="font-bold text-on-surface mt-0.5 block">{flightHourStr} น.</span>
                </div>
                
                <div className="col-span-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">รหัสเที่ยวบิน (Flight ID)</span>
                  <span className="font-mono text-on-surface mt-0.5 block">{booking.flight.flight_id}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional details note */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <div>
              <p className="text-xs font-bold text-primary mb-0.5">ข้อแนะนำการเดินทาง</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                กรุณาแสดงหน้าจอนี้แก่พนักงานต้อนรับขณะเช็คอินที่โรงแรมหรือเคาน์เตอร์สายการบิน เพื่อความสะดวกในการตรวจสอบข้อมูล หากคุณมีคำถามใดๆ สามารถคุยกับ Travel Buddy ได้ตลอดเวลา
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Info Panels */}
        <div className="flex flex-col gap-6">
          {/* User info panel */}
          <div className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col gap-4">
            <h3 className="font-display text-sm font-bold border-b border-border/40 pb-2.5">
              ผู้เดินทาง / ผู้จอง
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

          {/* Support options */}
          <div className="glass-panel p-5 rounded-2xl border border-border/80 flex flex-col gap-4">
            <h3 className="font-display text-sm font-bold border-b border-border/40 pb-2.5">
              ต้องการความช่วยเหลือ?
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              หากต้องการเลื่อนกำหนดการเดินทาง ยกเลิกรายการจอง หรือปรับเปลี่ยนเงื่อนไข สามารถสอบถาม Travel Buddy ได้ทันที
            </p>
            <Link href="/chat" className="w-full py-2.5 rounded-xl border border-primary/50 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-xs">
              <span className="material-symbols-outlined text-[16px]">forum</span>
              คุยกับ Travel Buddy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
