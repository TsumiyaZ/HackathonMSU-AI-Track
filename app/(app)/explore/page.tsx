import Link from "next/link";
import { Hotel, Plane, UtensilsCrossed, Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">สำรวจสถานที่</h1>
          <p className="text-on-surface-variant mt-2">ค้นหาเที่ยวบิน โรงแรม และร้านอาหารด้วยตัวเอง</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/explore/hotels" className="group glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all" />
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
            <Hotel className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">โรงแรมและที่พัก</h2>
          <p className="text-on-surface-variant text-sm">ค้นหาที่พักระดับโลก พร้อมสรุปรีวิวจาก AI</p>
        </Link>

        <Link href="/explore/flights" className="group glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/30 transition-all" />
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
            <Plane className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">เที่ยวบิน</h2>
          <p className="text-on-surface-variant text-sm">เปรียบเทียบตั๋วเครื่องบินราคาประหยัดและคุ้มค่าที่สุด</p>
        </Link>

        <Link href="/explore/restaurants" className="group glass-panel p-8 rounded-3xl hover:bg-white/5 transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-all" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">ร้านอาหาร</h2>
          <p className="text-on-surface-variant text-sm">ค้นหาร้านเด็ด คาเฟ่ และสตรีทฟู้ดยอดฮิต</p>
        </Link>
      </div>
    </div>
  );
}
