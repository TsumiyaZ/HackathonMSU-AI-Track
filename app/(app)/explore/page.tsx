import Link from "next/link";
import { readJSON, DATA } from "@/lib/json-db";
import { listHotels } from "@/lib/hotels";

export const dynamic = 'force-dynamic';

const FLIGHT_FALLBACK = [
  { flight_id: "FL-987", airline: "Thai Airways", origin: "BKK", destination: "HKT", departure_time: new Date("2026-08-15T08:30:00Z"), price: 3200 },
  { flight_id: "FL-502", airline: "AirAsia", origin: "DMK", destination: "CNX", departure_time: new Date("2026-08-16T10:15:00Z"), price: 1800 },
  { flight_id: "FL-334", airline: "Nok Air", origin: "DMK", destination: "UBP", departure_time: new Date("2026-08-17T14:45:00Z"), price: 1500 },
];

const RESTAURANT_FALLBACK = [
  { res_id: "res-001", name: "เจ๊โอว (Jae Oh)", cuisine: "มาม่าต้มยำ / อาหารตามสั่ง", rating: 4.8, delivery_time_min: 45 },
  { res_id: "res-002", name: "Factory Coffee", cuisine: "กาแฟพิเศษ / เบเกอรี่", rating: 4.7, delivery_time_min: 20 },
  { res_id: "res-003", name: "สมบูรณ์โภชนา", cuisine: "อาหารทะเล / ปูผัดผงกะหรี่", rating: 4.6, delivery_time_min: 35 },
];

async function safeReadJSON<T>(relPath: string, fallback: T): Promise<T> {
  try { return await readJSON<any[]>(relPath) as unknown as T; }
  catch { return fallback; }
}

async function safeListHotels() {
  try { return await listHotels(); }
  catch { return []; }
}

export default async function ExplorePage() {
  const [hotels, flights, restaurants] = await Promise.all([
    safeListHotels(),
    safeReadJSON<any[]>(DATA.flights, FLIGHT_FALLBACK),
    safeReadJSON<any[]>(DATA.restaurants, RESTAURANT_FALLBACK),
  ]);

  const recommendedHotels = [...hotels].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 3);
  const recommendedFlights = [...flights].sort((a: any, b: any) => a.price - b.price).slice(0, 3);
  const recommendedRestaurants = [...restaurants].sort((a: any, b: any) => b.rating - a.rating).slice(0, 3);

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
          <h1 className="font-display text-4xl md:text-6xl font-black text-on-surface leading-tight">
            สำรวจ <span className="text-gradient">สถานที่และบริการ</span>
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mt-3 max-w-xl leading-relaxed">
            เลือกเดินทางในสไตล์คุณ ค้นหาเที่ยวบินราคาประหยัด ที่พักระดับห้าดาว หรือร้านอร่อยยอดฮิตทั่วไทย
          </p>
        </header>

        {/* ── Category cards grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {categories.map((c, i) => (
            <Link
              key={i}
              href={c.href}
              className="relative rounded-3xl overflow-hidden flex items-end group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 border border-white/10 hover-lift press-scale"
              style={{ minHeight: 180 }}
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
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-on-surface">โรงแรมแนะนำ</h2>
                  <p className="text-sm text-on-surface-variant/80 mt-1">คัดสรรโรงแรมยอดนิยมที่มีรีวิวสูงสุด</p>
                </div>
                <Link href="/explore/hotels" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 hover-lift press-scale bg-primary/10 px-4 py-2 rounded-xl transition-all">
                  ดูทั้งหมด <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recommendedHotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    href={`/explore/hotel/${hotel.id}`}
                    className="group block focus:outline-none"
                  >
                    <div className="glass-panel overflow-hidden rounded-3xl h-full flex flex-col transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 border border-white/5">
                      <div
                        className="relative h-44 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${hotel.thumbnail_url})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="backdrop-blur-md bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20">
                            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {hotel.rating_avg.toFixed(1)}
                          </span>
                          {hotel.stars && (
                            <span className="backdrop-blur-md bg-amber-500/25 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-amber-400/20">
                              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
                              {hotel.stars} ดาว
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-[11px] text-white/80 font-medium flex items-center gap-1 drop-shadow-lg">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                            {hotel.city}, {hotel.country}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div>
                          <h4 className="font-display text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                            {hotel.name}
                          </h4>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {hotel.amenities?.slice(0, 3).map((a: string) => (
                            <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-on-surface-variant border border-white/5">
                              {a}
                            </span>
                          ))}
                          {(hotel.amenities?.length || 0) > 3 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-on-surface-variant">
                              +{hotel.amenities.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto pt-3 border-t border-white/5 flex items-end justify-between">
                          <div>
                            <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider font-medium">เริ่มต้นเพียง</p>
                            <p className="font-display text-lg font-black text-primary">
                              ฿{hotel.price_per_night_thb.toLocaleString()}
                              <span className="text-[11px] text-on-surface-variant/60 font-normal"> / คืน</span>
                            </p>
                          </div>
                          <span className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5">
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Recommended Restaurants ── */}
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-on-surface">ร้านอาหารแนะนำ</h2>
                  <p className="text-sm text-on-surface-variant/80 mt-1">ลิ้มลองความอร่อยกับร้านเด็ดยอดฮิต</p>
                </div>
                <Link href="/explore/restaurants" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 hover-lift press-scale bg-primary/10 px-4 py-2 rounded-xl transition-all">
                  ดูทั้งหมด <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recommendedRestaurants.map((res) => (
                  <Link key={res.res_id} href={`/explore/restaurant/${res.res_id}`} className="group block focus:outline-none">
                    <div className="glass-panel p-5 rounded-3xl flex flex-col gap-3 border border-white/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/25 h-full">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/15">
                          {res.cuisine}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold bg-amber-500/10 px-2 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {res.rating.toFixed(1)}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold text-on-surface group-hover:text-emerald-400 transition-colors">{res.name}</h4>
                      <p className="text-xs text-on-surface-variant/70 leading-relaxed line-clamp-2">{res.description || 'ร้านอาหารชื่อดังพร้อมเสิร์ฟความอร่อย'}</p>
                      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          ~{res.delivery_time_min} นาที
                        </span>
                        <span className="text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
                          ดูรายละเอียด <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </div>

          {/* ── Right Column: Flights (1 col width on desktop) ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* ── Budget Flights Panel ── */}
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-on-surface">เที่ยวบินราคาสุดคุ้ม</h2>
                  <p className="text-sm text-on-surface-variant/80 mt-1">จองเที่ยวบินราคาสบายกระเป๋า</p>
                </div>
                <Link href="/explore/flights" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 hover-lift press-scale bg-primary/10 px-4 py-2 rounded-xl transition-all">
                  ดูทั้งหมด <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {recommendedFlights.map((flight) => (
                  <Link
                    key={flight.flight_id}
                    href={`/explore/flight/${flight.flight_id}`}
                    className="group block focus:outline-none"
                  >
                    <div className="glass-panel p-5 rounded-2xl border border-white/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/5 hover:border-secondary/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] bg-secondary/15 text-secondary font-bold px-3 py-1 rounded-full border border-secondary/10">
                          {flight.airline}
                        </span>
                        <span className="text-[9px] font-mono text-on-surface-variant/50">{flight.flight_id}</span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="text-center flex-1">
                          <p className="font-display text-lg font-black text-on-surface">{flight.origin}</p>
                          <p className="text-[10px] text-on-surface-variant/60 font-medium">ต้นทาง</p>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center px-4 relative">
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-1/2" />
                          <span className="material-symbols-outlined text-[18px] text-secondary rotate-90 relative z-10 bg-surface px-2">
                            flight
                          </span>
                          <span className="text-[8px] text-on-surface-variant/40 mt-0.5">ตรง</span>
                        </div>

                        <div className="text-center flex-1">
                          <p className="font-display text-lg font-black text-secondary">{flight.destination}</p>
                          <p className="text-[10px] text-on-surface-variant/60 font-medium">ปลายทาง</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider">ราคาเริ่มต้น</p>
                          <p className="font-display text-lg font-black text-emerald-400">฿{flight.price.toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-primary font-bold group-hover:underline flex items-center gap-1 bg-primary/10 px-3 py-2 rounded-xl transition-all group-hover:bg-primary/20">
                          เลือกบิน <span className="material-symbols-outlined text-[14px]">chevron_right</span>
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
