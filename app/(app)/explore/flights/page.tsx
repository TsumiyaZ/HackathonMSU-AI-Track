import prisma from "@/lib/prisma";
import { Plane, Search } from "lucide-react";
import Link from "next/link";

export default async function ExploreFlightsPage() {
  const flights = await prisma.flight.findMany({
    take: 50,
    orderBy: { price: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/explore" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; กลับหน้า Explore</Link>
        <h1 className="font-display text-3xl font-black mb-2 flex items-center gap-3">
          <Plane className="w-8 h-8 text-secondary" />
          ค้นหาเที่ยวบิน
        </h1>
        <p className="text-on-surface-variant">จองตั๋วเครื่องบินราคาประหยัด บินตรงสู่ทุกจุดหมาย</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flights.map((flight) => (
          <div key={flight.flight_id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-secondary/30 transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/20">
                {flight.airline}
              </div>
              <div className="text-xs text-on-surface-variant bg-surface-variant px-2 py-1 rounded-md">
                {flight.flight_id}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <div className="font-display text-2xl font-black">{flight.origin}</div>
                <div className="text-xs text-on-surface-variant">{new Date(flight.departure_time).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div className="flex-1 flex flex-col items-center px-4 relative">
                <div className="w-full border-t border-dashed border-white/20 absolute top-1/2 -translate-y-1/2" />
                <Plane className="w-5 h-5 text-on-surface-variant rotate-90 relative z-10 bg-background px-1" />
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-black text-primary">{flight.destination}</div>
                <div className="text-xs text-on-surface-variant">ปลายทาง</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                <div className="text-xs text-on-surface-variant mb-1">ราคาเริ่มต้น</div>
                <div className="font-display text-xl font-bold text-emerald-400">{flight.price.toLocaleString()} ฿</div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-transform">
                เลือกเที่ยวบิน
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
