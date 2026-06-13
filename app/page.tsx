import Link from "next/link";

type NavTile = {
  href: string;
  title: string;
  description: string;
  icon: string;
  ready: boolean;
};

const TILES: NavTile[] = [
  {
    href: "/explore/hotels",
    title: "สำรวจโรงแรม",
    description: "ค้นหาที่พักทั่วไทย พร้อมตัวกรองและบทสรุปจาก AI",
    icon: "hotel",
    ready: true,
  },
  {
    href: "/plan",
    title: "วางแผนทริปกับ AI",
    description: "พิมพ์สั้นๆ ว่าคุณอยากไปไหน AI จัดทริปให้ใน 1 คลิก",
    icon: "auto_awesome",
    ready: true,
  },
  {
    href: "/bookings",
    title: "การจองของฉัน",
    description: "ดู ค้นหา และจัดการการจองทั้งหมดในที่เดียว",
    icon: "event_available",
    ready: false,
  },
  {
    href: "/chat",
    title: "Travel Buddy",
    description: "แชทบอทผู้ช่วยถามพิกัด สถานที่ และไอเดียการเที่ยว",
    icon: "forum",
    ready: false,
  },
  {
    href: "/profile",
    title: "โปรไฟล์ของฉัน",
    description: "ตั้งค่าความชอบเพื่อให้ AI แนะนำทริปที่ตรงใจ",
    icon: "account_circle",
    ready: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface grid-bg">
      <section className="relative px-6 md:px-12 pt-16 md:pt-24 pb-12 max-w-[1280px] mx-auto">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center ai-glow-strong">
              <span className="material-symbols-outlined text-background" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <span className="font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant">Navigating the Nebula</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black leading-tight">
            ผู้ช่วยวางแผน<span className="text-gradient">ทริปอัจฉริยะ</span>
            <br className="hidden md:block" />
            จัดทริปในฝันได้ในคลิกเดียว
          </h1>
          <p className="max-w-2xl text-on-surface-variant text-base md:text-lg leading-relaxed">
            AI Trip Architect ผสานข้อมูลโรงแรม เที่ยวบิน ร้านอาหาร และรีวิวจริง มาช่วยจัดทริปที่ตรงใจคุณที่สุด พร้อมสรุปงบประมาณและแจ้งเตือนแบบเรียลไทม์
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link href="/explore/hotels" className="px-7 py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[18px]">explore</span>
              เริ่มสำรวจโรงแรม
            </Link>
            <Link href="/plan" className="px-7 py-3 rounded-xl glass-panel-strong font-label text-sm hover:text-primary transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              วางแผนกับ AI
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 md:px-12 pb-20 max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">เลือกหน้าที่คุณต้องการ</h2>
            <p className="text-on-surface-variant mt-1">ป้ายสีฟ้าคือหน้าที่พร้อมใช้งานแล้ว — หน้าอื่นกำลังพัฒนา</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map((tile) => (
            <Link key={tile.href} href={tile.href} className={"group glass-panel rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 " + (tile.ready ? "hover:ai-glow border border-primary/20" : "opacity-70 hover:opacity-100")}>
              <div className="flex items-center justify-between">
                <div className={"w-11 h-11 rounded-xl flex items-center justify-center " + (tile.ready ? "bg-gradient-to-tr from-primary/30 to-secondary/30 text-primary" : "bg-white/5 text-on-surface-variant")}>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tile.icon}</span>
                </div>
                <span className={"font-label text-[10px] uppercase tracking-widest px-2 py-1 rounded-full " + (tile.ready ? "bg-primary/15 text-primary" : "bg-white/5 text-on-surface-variant")}>
                  {tile.ready ? "พร้อมใช้" : "กำลังพัฒนา"}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-on-surface group-hover:text-primary transition-colors">{tile.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{tile.description}</p>
              <div className="mt-auto pt-3 flex items-center gap-1 font-label text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                เปิดหน้า
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
