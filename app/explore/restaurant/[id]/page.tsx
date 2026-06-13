import Link from "next/link";
import { notFound } from "next/navigation";
import { getRestaurantById } from "@/lib/restaurants";
import { loadReviews } from "@/lib/hotels";
import { StarRating } from "@/components/ui/StarRating";
import { GlassCard } from "@/components/ui/GlassCard";
import { Chip } from "@/components/ui/Chip";

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);
  if (!restaurant) notFound();

  const allReviews = await loadReviews();
  const reviews = allReviews.filter((r) => r.target_type === "restaurant" && r.target_id === id);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : restaurant.rating;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <Link href="/explore/hotels" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        กลับสู่หน้าการค้นหา
      </Link>

      <div className="glass-panel-strong p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-background text-[32px]">restaurant</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{restaurant.name}</h1>
              <p className="text-on-surface-variant mt-1 flex items-center gap-2">
                <Chip variant="glass">{restaurant.cuisine}</Chip>
                <span>จัดส่งใน {restaurant.delivery_time_min} นาที</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-xl text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">คะแนน</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <StarRating value={Math.round(avgRating)} size={20} />
                <span className="font-display text-xl font-bold">{avgRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="glass-panel p-5 rounded-xl text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">ประเภทอาหาร</p>
              <p className="font-display text-xl font-bold mt-1 capitalize">{restaurant.cuisine}</p>
            </div>
            <div className="glass-panel p-5 rounded-xl text-center bg-secondary/10 border border-secondary/20">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">เวลาจัดส่ง</p>
              <p className="font-display text-xl font-bold text-secondary mt-1">{restaurant.delivery_time_min} นาที</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[20px]">motorcycle</span>
              สั่งอาหาร
            </button>
            <button className="flex-1 py-4 rounded-xl glass-panel font-label text-sm hover:text-primary transition-colors border border-white/10">
              <span className="material-symbols-outlined text-[20px]">bookmark</span>
              เก็บไว้ในทริป
            </button>
          </div>
        </div>
      </div>

      <GlassCard className="p-6">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">rate_review</span>
          รีวิว ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-on-surface-variant">ยังไม่มีรีวิวสำหรับร้านนี้</p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.review_id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={Math.round(r.rating)} size={14} />
                  <span className="text-sm font-semibold">{r.rating}/5</span>
                  <span className="text-xs text-on-surface-variant ml-auto">{new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                <p className="text-sm text-on-surface-variant">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
