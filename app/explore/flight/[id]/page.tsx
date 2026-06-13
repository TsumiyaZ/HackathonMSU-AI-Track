import Link from "next/link";
import { notFound } from "next/navigation";
import { getFlightById, loadTickets } from "@/lib/flights";

export default async function FlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = await getFlightById(id);
  if (!flight) notFound();

  const tickets = await loadTickets();
  const flightTickets = tickets.filter((t) => t.flight_id === id);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <Link href="/explore/hotels" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        กลับสู่หน้าการค้นหา
      </Link>

      <div className="glass-panel-strong p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-background text-[32px]">flight</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{flight.airline}</h1>
              <p className="text-on-surface-variant mt-1">รหัสเที่ยวบิน: {flight.flight_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-xl text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">ต้นทาง</p>
              <p className="font-display text-2xl font-bold mt-1">{flight.origin}</p>
            </div>
            <div className="glass-panel p-5 rounded-xl text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">ปลายทาง</p>
              <p className="font-display text-2xl font-bold mt-1">{flight.destination}</p>
            </div>
            <div className="glass-panel p-5 rounded-xl text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">เวลาเดินทาง</p>
              <p className="font-display text-lg font-bold mt-1">{new Date(flight.departure_time).toLocaleDateString('th-TH')}</p>
            </div>
            <div className="glass-panel p-5 rounded-xl text-center bg-primary/10 border border-primary/20">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">ราคา</p>
              <p className="font-display text-2xl font-bold text-primary mt-1">฿{flight.price.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8">
            <button className="w-full py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              จองเที่ยวบินนี้
            </button>
          </div>
        </div>
      </div>

      {flightTickets.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">confirmation_number</span>
            ตั๋วที่มี ({flightTickets.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-2 py-2">รหัสตั๋ว</th>
                  <th className="px-2 py-2">ที่นั่ง</th>
                  <th className="px-2 py-2">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {flightTickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-white/5">
                    <td className="px-2 py-3 font-mono text-xs">{t.ticket_id}</td>
                    <td className="px-2 py-3">{t.seat}</td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.status === 'ISSUED' ? 'bg-primary/20 text-primary' :
                        t.status === 'BOARDED' ? 'bg-emerald-500/20 text-emerald-400' :
                        t.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
