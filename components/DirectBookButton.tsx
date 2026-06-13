"use client";

import { requireAuth } from "@/lib/auth-check";
import { useTripStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function DirectBookButton({ 
  item, 
  label = "จองทันที", 
  icon = "bolt", 
  className 
}: {
  item: any;
  label?: string;
  icon?: string;
  className?: string;
}) {
  const router = useRouter();
  const setTrip = useTripStore((s) => s.setTrip);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    const authed = await requireAuth("/checkout");
    if (!authed) return;

    setLoading(true);

    // Create a single-item trip
    const singleTrip = {
      id: `direct-trip-${Date.now()}`,
      destination: item.title,
      days: 1,
      budget: item.price,
      totalPrice: item.price,
      items: [
        {
          id: `item-${Date.now()}`,
          type: item.type, // 'hotel', 'flight', 'restaurant'
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          title: item.title,
          description: item.description || "Direct booking",
          price: item.price,
          data: item.data
        }
      ]
    };

    setTrip(singleTrip);
    router.push("/checkout");
  };

  return (
    <button onClick={handleBook} disabled={loading} className={`${className} disabled:opacity-50`}>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {loading ? "กำลังเตรียมการ..." : label}
    </button>
  );
}
