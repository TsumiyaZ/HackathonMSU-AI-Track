"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";

export default function PlanPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setTrip = useTripStore(state => state.setTrip);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, preferences: {} }),
      });

      const data = await res.json();
      if (data.success) {
        setTrip(data.itinerary);
        router.push(`/trip/${data.itinerary.id}`);
      } else {
        alert("Error: " + data.error);
        if (data.fallback) {
           setTrip(data.fallback);
           router.push(`/trip/${data.fallback.id}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="glass-panel p-8 text-center rounded-3xl relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            AI Trip Architect
          </h1>
          <p className="text-on-surface/70 text-lg mb-8 max-w-lg mx-auto">
            ให้ AI ผู้เชี่ยวชาญออกแบบทริปที่สมบูรณ์แบบสำหรับคุณ เพียงบอกเราว่าคุณอยากไปไหน ทำอะไร และมีงบเท่าไหร่
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="พิมพ์ความต้องการ เช่น 'ไปภูเก็ต 3 วัน งบ 15,000 เน้นกิน'"
              disabled={loading}
              className="w-full bg-surface/80 border border-border/50 text-on-surface rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-inner backdrop-blur-sm transition-all"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => setPrompt("เที่ยวภูเก็ต 3 วัน 2 คืน พักหรูติดทะเล")} className="glass text-sm px-4 py-2 rounded-full hover:bg-surface/80 transition-colors">
              🏖️ ภูเก็ต พักหรู
            </button>
            <button onClick={() => setPrompt("ไปเชียงใหม่ งบ 8000 บาท สายคาเฟ่")} className="glass text-sm px-4 py-2 rounded-full hover:bg-surface/80 transition-colors">
              ☕ เชียงใหม่ สายคาเฟ่
            </button>
            <button onClick={() => setPrompt("โตเกียว 5 วัน ตะลุยชิมอาหารญี่ปุ่น")} className="glass text-sm px-4 py-2 rounded-full hover:bg-surface/80 transition-colors">
              🍣 โตเกียว สายกิน
            </button>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="mt-12 text-center animate-pulse">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-lg font-medium text-primary">กำลังประมวลผลข้อมูลนับพันรายการ...</p>
          <p className="text-sm text-on-surface/50 mt-2">AI กำลังคัดกรองโรงแรม เที่ยวบิน และร้านอาหารที่ตรงใจคุณที่สุด</p>
        </div>
      )}
    </div>
  );
}
