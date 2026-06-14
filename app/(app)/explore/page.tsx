import Link from "next/link";
import prisma from "@/lib/prisma";
import { listHotels } from "@/lib/hotels";

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  // 1. Fetch recommended hotels (normalized)
  let recommendedHotels: any[] = [];
  try {
    const hotels = await listHotels();
    recommendedHotels = [...hotels]
      .sort((a, b) => b.rating_avg - a.rating_avg)
      .slice(0, 3);
  } catch (err) {
    console.error("Error loading hotels in explore:", err);
  }

  // 2. Fetch cheapest flights
  let recommendedFlights: any[] = [];
  try {
    recommendedFlights = await prisma.flight.findMany({
      take: 3,
      orderBy: { price: 'asc' }
    });
  } catch (err) {
    console.error("Error loading flights in explore:", err);
    // Fallback mock flights
    recommendedFlights = [
      { flight_id: "FL-987", airline: "Thai Airways", origin: "BKK", destination: "HKT", departure_time: new Date("2026-08-15T08:30:00Z"), price: 3200 },
      { flight_id: "FL-502", airline: "AirAsia", origin: "DMK", destination: "CNX", departure_time: new Date("2026-08-16T10:15:00Z"), price: 1800 },
      { flight_id: "FL-334", airline: "Nok Air", origin: "DMK", destination: "UBP", departure_time: new Date("2026-08-17T14:45:00Z"), price: 1500 },
    ];
  }

  // 3. Fetch popular restaurants
  let recommendedRestaurants: any[] = [];
  try {
    recommendedRestaurants = await prisma.restaurant.findMany({
      take: 3,
      orderBy: { rating: 'desc' }
    });
  } catch (err) {
    console.error("Error loading restaurants in explore:", err);
    // Fallback mock restaurants
    recommendedRestaurants = [
      { res_id: "res-001", name: "เจ๊โอว (Jae Oh)", cuisine: "มาม่าต้มยำ / อาหารตามสั่ง", rating: 4.8, delivery_time_min: 45 },
      { res_id: "res-002", name: "Factory Coffee", cuisine: "กาแฟพิเศษ / เบเกอรี่", rating: 4.7, delivery_time_min: 20 },
      { res_id: "res-003", name: "สมบูรณ์โภชนา", cuisine: "อาหารทะเล / ปูผัดผงกะหรี่", rating: 4.6, delivery_time_min: 35 },
    ];
  }

  const categories = [
    {
      href: "/explore/hotels",
      icon: "hotel",
      title: "จองโรงแรม",
      sublabel: "บริการของเรา",
      desc: "ค้นหาและจองที่พักคุณภาพทั่วไทย",
      tags: ["ราคาดีที่สุด", "ยกเลิกได้ฟรี", "จ่ายที่โรงแรม"],
      bgImage: "/hero-temple.jpg",
      gradient: "linear-gradient(135deg, rgba(10,78,172,0.80) 0%, rgba(0,0,0,0.45) 100%)",
      colorClass: "text-blue-200"
    },
    {
      href: "/explore/flights",
      icon: "flight",
      title: "จองตั๋วเดินทาง",
      sublabel: "บริการของเรา",
      desc: "เที่ยวบินในประเทศและต่างประเทศ ราคาดีที่สุด",
      tags: ["เที่ยวบินตรง", "Low-cost", "เช็ค e-Ticket"],
      bgImage: "/hero-ocean.jpg",
      gradient: "linear-gradient(135deg, rgba(2,30,90,0.85) 0%, rgba(0,0,0,0.40) 100%)",
      colorClass: "text-blue-200"
    },
    {
      href: "/explore/restaurants",
      icon: "restaurant",
      title: "ร้านอาหารและคาเฟ่",
      sublabel: "บริการของเรา",
      desc: "สัมผัสความอร่อยจากร้านอาหารเด็ด เมนูยอดฮิต และคาเฟ่ชิคๆ",
      tags: ["ร้านเด็ดแนะนำ", "คาเฟ่ชิค", "รีวิวเพียบ"],
      bgImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
      gradient: "linear-gradient(135deg, rgba(6,78,59,0.85) 0%, rgba(0,0,0,0.45) 100%)",
      colorClass: "text-emerald-200"
    },
  ];

  return (
    <div className="flex flex-col w-full relative pb-12 px-4 md:px-0">
      
      {/* ── Decorative Background Layer ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
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
        <div
          style={{
            position: "absolute",
            top: "120px",
            right: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(24,119,242,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.3,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col w-full max-w-6xl mx-auto">
        
        {/* ── Header ── */}
        <header className="mb-8 mt-6">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">explore</span>
            ค้นพบสิ่งใหม่ๆ
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-black text-on-surface">
            สำรวจ <span className="text-gradient">สถานที่และบริการ</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-xl leading-relaxed">
            เลือกเดินทางในสไตล์คุณ ค้นหาเที่ยวบินราคาประหยัด ที่พักระดับห้าดาว หรือร้านอร่อยยอดฮิตทั่วไทย
          </p>
        </header>

        {/* ── Category cards grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {categories.map((c, i) => (
            <Link
              key={i}
              href={c.href}
              className="relative rounded-2xl overflow-hidden flex items-end group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 border border-white/10"
              style={{ minHeight: 160 }}
            >
              {/* BG image */}
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${c.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              {/* Overlay */}
              <div className="absolute inset-0"
                style={{ background: c.gradient }} />
              {/* Content */}
              <div className="relative z-10 p-5 flex items-end justify-between w-full">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-white text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                    <span className={`font-label text-[11px] uppercase tracking-widest ${c.colorClass}`}>{c.sublabel}</span>
                  </div>
                  <p className="font-display text-xl font-black text-white leading-tight">{c.title}</p>
                  <p className="text-white/70 text-xs mt-1">{c.desc}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {c.tags.map((tag) => (
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
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Hotels (2 cols width on desktop) ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* ── Recommended Hotels ── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-on-surface">โรงแรมแนะนำระดับ 5 ดาว</h2>
                  <p className="text-xs text-on-surface-variant">คัดสรรโรงแรมยอดนิยมที่มีรีวิวสูงสุดจากผู้เข้าพัก</p>
                </div>
                <Link href="/explore/hotels" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  ดูทั้งหมด <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedHotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    href={`/explore/hotel/${hotel.id}`}
                    className="group flex flex-col focus:outline-none"
                  >
                    <div className="glass-panel overflow-hidden rounded-2xl h-full flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35">
                      <div
                        className="relative h-28 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${hotel.thumbnail_url})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary/95 text-[8px] font-label font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <span className="material-symbols-outlined text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                            {hotel.rating_avg.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <div>
                          <p className="text-[9px] text-primary font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">location_on</span>
                            {hotel.city}
                          </p>
                          <h4 className="font-display text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors mt-0.5">
                            {hotel.name}
                          </h4>
                        </div>
                        <div className="mt-auto pt-2 border-t border-white/5 flex items-end justify-between">
                          <div>
                            <p className="text-[8px] text-on-surface-variant uppercase tracking-wider">เริ่มต้น / คืน</p>
                            <p className="font-display text-xs font-bold text-on-surface">
                              ฿{hotel.price_per_night_thb.toLocaleString()}
                            </p>
                          </div>
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Recommended Restaurants ── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-on-surface">ร้านอาหารแนะนำยอดฮิต</h2>
                  <p className="text-xs text-on-surface-variant font-label text-on-surface-variant/80">ลิ้มลองความอร่อยกับร้านเด็ด คาเฟ่ดังที่มีรีวิวดีเยี่ยม</p>
                </div>
                <Link href="/explore/restaurants" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  ดูทั้งหมด <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedRestaurants.map((res) => (
                  <div key={res.res_id} className="glass-panel p-4 rounded-2xl flex flex-col justify-between gap-3 border border-white/5 hover:border-emerald-500/20 transition-all">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">
                          {res.cuisine}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500 text-[9px] font-bold">
                          <span className="material-symbols-outlined text-[10px] fill-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {res.rating.toFixed(1)}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold mt-2 text-on-surface truncate">{res.name}</h4>
                    </div>
                    
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        รออาหาร ~{res.delivery_time_min} นาที
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── Right Column: Flights (1 col width on desktop) ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* ── Budget Flights Panel ── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-on-surface">เที่ยวบินราคาสุดคุ้ม</h2>
                  <p className="text-xs text-on-surface-variant">จองเที่ยวบินราคาสบายกระเป๋า</p>
                </div>
                <Link href="/explore/flights" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  ดูทั้งหมด <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {recommendedFlights.map((flight) => (
                  <Link
                    key={flight.flight_id}
                    href={`/explore/flight/${flight.flight_id}`}
                    className="group"
                  >
                    <div className="glass-panel p-4 rounded-xl border border-white/5 hover:border-secondary/30 transition-all flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                        <span className="bg-secondary/15 text-secondary font-bold px-2 py-0.5 rounded-full border border-secondary/10">
                          {flight.airline}
                        </span>
                        <span className="font-mono">{flight.flight_id}</span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div className="text-center">
                          <p className="font-display text-sm font-black">{flight.origin}</p>
                          <p className="text-[9px] text-on-surface-variant">ต้นทาง</p>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center px-3 relative">
                          <div className="w-full border-t border-dashed border-white/10 absolute top-1/2 -translate-y-1/2" />
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant rotate-90 relative z-10 bg-surface px-1.5">
                            flight
                          </span>
                        </div>

                        <div className="text-center">
                          <p className="font-display text-sm font-black text-primary">{flight.destination}</p>
                          <p className="text-[9px] text-on-surface-variant">ปลายทาง</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">฿{flight.price.toLocaleString()}</span>
                        <span className="text-[10px] text-primary font-bold group-hover:underline flex items-center gap-0.5">
                          เลือกบิน <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
