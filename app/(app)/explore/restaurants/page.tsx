import { readJSON, DATA } from "@/lib/json-db";
import { UtensilsCrossed, Star, Clock } from "lucide-react";
import Link from "next/link";

export default async function ExploreRestaurantsPage() {
  const all = await readJSON<any[]>(DATA.restaurants);
  const restaurants = all.sort((a: any, b: any) => b.rating - a.rating).slice(0, 50);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/explore" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; กลับหน้า Explore</Link>
        <h1 className="font-display text-3xl font-black mb-2 flex items-center gap-3">
          <UtensilsCrossed className="w-8 h-8 text-emerald-500" />
          ค้นหาร้านอาหาร
        </h1>
        <p className="text-on-surface-variant">รวบรวมร้านอาหารเด็ด คาเฟ่ และร้านอร่อยยอดฮิต</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((res) => (
          <div key={res.res_id} className="glass-panel p-0 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 overflow-hidden flex flex-col">
            <div className="h-40 bg-gradient-to-tr from-emerald-900/40 to-surface flex items-center justify-center relative">
              <UtensilsCrossed className="w-12 h-12 text-emerald-500/20" />
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold">{res.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-xl font-bold line-clamp-1">{res.name}</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-4 inline-block bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md w-fit">
                {res.cuisine}
              </p>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  รออาหาร ~{res.delivery_time_min} นาที
                </div>
                <Link href={`/explore/restaurant/${res.res_id}`} className="text-emerald-400 font-bold hover:underline">
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
