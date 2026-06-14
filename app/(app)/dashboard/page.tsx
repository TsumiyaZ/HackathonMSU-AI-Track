import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { DashboardCharts } from './_components/DashboardCharts';

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  let hotelBookings: any[] = [];
  let flightTickets: any[] = [];
  let foodOrders: any[] = [];

  try {
    hotelBookings = await prisma.hotelBooking.findMany({
      where: { user_id: userId! },
      include: { hotel: true },
      orderBy: { check_in: 'desc' }
    });

    flightTickets = await prisma.flightTicket.findMany({
      where: { user_id: userId! },
      include: { flight: true }
    });

    foodOrders = await prisma.foodOrder.findMany({
      where: { user_id: userId! }
    });
  } catch (error) {
    console.warn("⚠️ Database connection failed. Falling back to empty arrays.");
  }

  const now = new Date();

  // KPIs Calculations
  const totalHotelSpend = hotelBookings.reduce((sum, b) => sum + b.total_price, 0);
  const totalFlightSpend = flightTickets.reduce((sum, t) => sum + t.flight.price, 0);
  const totalFoodSpend = foodOrders.reduce((sum, f) => sum + f.total_price, 0);
  const totalSpend = totalHotelSpend + totalFlightSpend + totalFoodSpend;

  const upcomingTrips = hotelBookings.filter(b => new Date(b.check_in) > now).length;
  const completedTrips = hotelBookings.filter(b => new Date(b.check_out) < now).length;

  // Aggregate Data for Charts
  // 1. Expense by Category
  const expenseData = [
    { name: 'โรงแรม', value: totalHotelSpend },
    { name: 'ตั๋วเครื่องบิน', value: totalFlightSpend },
    { name: 'อาหาร', value: totalFoodSpend },
  ].filter(item => item.value > 0);

  // 2. Monthly Spend (Dynamic calculation from Hotel and Flight)
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const spendByMonth = new Array(12).fill(0);

  hotelBookings.forEach(b => {
    const month = new Date(b.check_in).getMonth();
    spendByMonth[month] += b.total_price;
  });

  flightTickets.forEach(t => {
    const month = new Date(t.flight.departure_time).getMonth();
    spendByMonth[month] += t.flight.price;
  });

  // Get last 6 months
  const currentMonth = now.getMonth();
  const monthlySpend = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    if (m < 0) m += 12;
    monthlySpend.push({
      name: monthNames[m],
      spend: spendByMonth[m]
    });
  }

  // Recent Bookings (taking top 2)
  const recentBookings = hotelBookings.slice(0, 2);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-on-surface">ภาพรวม (Overview)</h1>
        <p className="text-on-surface-variant mt-1">สรุปข้อมูลการเดินทาง งบประมาณ และการแจ้งเตือน</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[20px] text-primary">account_balance_wallet</span>
            <span className="font-label text-sm font-semibold">ยอดใช้จ่ายรวม</span>
          </div>
          <div className="font-display text-3xl font-black text-on-surface">฿{totalSpend.toLocaleString()}</div>
          <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            -12% เทียบกับปีที่แล้ว
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">flight_takeoff</span>
            <span className="font-label text-sm font-semibold">ทริปที่กำลังจะมาถึง</span>
          </div>
          <div className="font-display text-3xl font-black text-on-surface">{upcomingTrips}</div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
            รอตรวจสอบการจอง 1 รายการ
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[20px] text-purple-400">check_circle</span>
            <span className="font-label text-sm font-semibold">ทริปที่ไปมาแล้ว</span>
          </div>
          <div className="font-display text-3xl font-black text-on-surface">{completedTrips}</div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
            ครอบคลุม 8 ประเทศ
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-[20px] text-yellow-400">campaign</span>
            <span className="font-label text-sm font-semibold">คำแนะนำจาก AI</span>
          </div>
          <div className="font-display text-3xl font-black text-on-surface">3</div>
          <div className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            ควรจองโรงแรมทริปด่วน!
          </div>
        </div>
      </div>

      {/* Charts Section (Client Component) */}
      <DashboardCharts expenseData={expenseData} monthlySpend={monthlySpend} />

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold">การจองล่าสุด</h3>
            <Link href="/bookings" className="text-sm text-primary hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentBookings.length === 0 ? (
              <p className="text-on-surface-variant text-sm">ไม่พบการจองล่าสุด</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.booking_id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">hotel</span>
                    </div>
                    <div>
                      <div className="font-semibold text-on-surface">{booking.hotel.name}</div>
                      <div className="text-sm text-on-surface-variant">
                        {new Date(booking.check_in).toLocaleDateString('th-TH')} - {new Date(booking.check_out).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-on-surface">฿{booking.total_price.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="font-display text-lg font-semibold mb-6">เมนูด่วน</h3>
          <div className="flex flex-col gap-3">
            <Link href="/plan" className="w-full py-3 px-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center gap-3 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[20px]">add</span>
              สร้างทริปใหม่ด้วย AI
            </Link>
            <Link href="/explore/flights" className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 font-label text-sm flex items-center gap-3 transition-colors border border-white/5">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
              ดูเที่ยวบินทั้งหมด
            </Link>
            <Link href="/explore/hotels" className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 font-label text-sm flex items-center gap-3 transition-colors border border-white/5">
              <span className="material-symbols-outlined text-[20px]">explore</span>
              สำรวจโรงแรมใหม่ๆ
            </Link>
            <Link href="/chat" className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 font-label text-sm flex items-center gap-3 transition-colors border border-white/5">
              <span className="material-symbols-outlined text-[20px]">forum</span>
              ถาม Travel Buddy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
