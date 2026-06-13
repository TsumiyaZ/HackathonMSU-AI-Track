import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  // In Next.js 15, params is a promise, but in 16.2.9 with Turbopack, it can be accessed directly or awaited depending on the exact version behavior.
  // Next.js 15+ convention:
  const { id } = await params;

  // Fetch from DB
  let booking: any = null;
  try {
    booking = await prisma.hotelBooking.findUnique({
      where: { booking_id: id },
      include: { hotel: true, user: true }
    });
  } catch (err) {
    console.warn("⚠️ Database connection failed. Falling back to mock data.");
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
        amenities: ["Free Wi-Fi", "Pool", "Spa", "Fitness Center"]
      },
      user: {
        name: "Test User",
        email: "test@example.com",
        phone: "081-234-5678"
      }
    };
  }

  if (!booking) {
    return notFound();
  }

  // Format dates
  const checkInStr = new Date(booking.check_in).toLocaleDateString('th-TH');
  const checkOutStr = new Date(booking.check_out).toLocaleDateString('th-TH');
  const checkInTime = "14:00"; // Default
  const checkOutTime = "12:00"; // Default

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <Link href="/bookings" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        กลับหน้ารายการจอง
      </Link>

      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200" alt={booking.hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-primary font-mono text-sm mb-2 px-3 py-1 bg-primary/20 rounded-full inline-block backdrop-blur-md border border-primary/30">
                หมายเลขการจอง: {booking.booking_id}
              </div>
              <h1 className="font-display text-4xl font-black text-white">ทริป {booking.hotel.name}</h1>
              <div className="flex items-center gap-4 text-white/80 mt-2">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">location_on</span> {booking.hotel.location}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_month</span> {checkInStr} - {checkOutStr}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">ยอดชำระสุทธิ</div>
              <div className="font-display text-3xl font-bold text-primary ai-glow-text">฿{booking.total_price.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Main Details */}
        <div className="md:col-span-2 flex flex-col gap-6">

          {/* Hotel Details */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">hotel</span>
                </div>
                รายละเอียดที่พัก
              </h2>
              <div className={`px-3 py-1 rounded-full text-xs border ${
                booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {booking.status}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <p className="font-semibold text-lg">{booking.hotel.name}</p>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  {booking.hotel.rating}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-on-surface-variant mb-1">จำนวนผู้เข้าพัก</p>
                <p className="font-semibold">{booking.guests} ท่าน</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-on-surface-variant mb-1">สิ่งอำนวยความสะดวก</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.hotel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                    <span key={idx} className="text-xs bg-white/10 px-2 py-0.5 rounded">{amenity}</span>
                  ))}
                  {booking.hotel.amenities.length > 3 && <span className="text-xs text-on-surface-variant">+{booking.hotel.amenities.length - 3}</span>}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-on-surface-variant mb-1">เช็คอิน</p>
                <p className="font-semibold">{checkInStr}, {checkInTime}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-on-surface-variant mb-1">เช็คเอาท์</p>
                <p className="font-semibold">{checkOutStr}, {checkOutTime}</p>
              </div>
              <div className="mt-2 sm:col-span-2">
                <p className="text-xs text-on-surface-variant mb-1">รหัสอ้างอิงของโรงแรม (ID)</p>
                <p className="font-mono text-primary">{booking.hotel.hotel_id}</p>
              </div>
            </div>
          </div>
          
          {/* Note on Flight & Activities */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <div>
              <p className="text-sm font-semibold text-primary mb-1">ข้อมูลเพิ่มเติม</p>
              <p className="text-xs text-on-surface-variant">ตั๋วเครื่องบินและกิจกรรมต่างๆ ถูกดึงจากประวัติการสั่งซื้อแยกต่างหากในฐานข้อมูล หากคุณมีการจองควบคู่กับโรงแรม ระบบจะพยายามจับคู่ให้อัตโนมัติในอนาคต</p>
            </div>
          </div>

        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="font-display font-semibold border-b border-white/10 pb-3">ผู้ทำรายการจอง</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {booking.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold">{booking.user?.name || "ผู้ใช้งานระบบ"}</p>
                <p className="text-xs text-on-surface-variant">{booking.user?.email || ""}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{booking.user?.phone || ""}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="font-display font-semibold border-b border-white/10 pb-3">ต้องการความช่วยเหลือ?</h3>
            <p className="text-sm text-on-surface-variant">คุณสามารถส่งข้อความหา Travel Buddy เพื่อขอปรับเปลี่ยนแผนหรือสอบถามข้อมูลเพิ่มเติมได้ตลอดเวลา</p>
            <Link href="/chat" className="w-full py-3 rounded-xl border border-primary/50 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">forum</span>
              เปิดแชท Travel Buddy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
