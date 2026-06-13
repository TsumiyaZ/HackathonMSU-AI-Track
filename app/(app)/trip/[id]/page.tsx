"use client";

import { useTripStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlaneTakeoff, Hotel, Utensils, MapPin, Sparkles, AlertCircle } from "lucide-react";
import React from "react";

export default function TripResultPage({ params }: { params: { id: string } }) {
  const trip = useTripStore(state => state.currentTrip);
  const swapActivity = useTripStore(state => state.swapActivity);
  const router = useRouter();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const openSwapModal = async (item: any) => {
    setSwapTarget(item);
    setIsModalOpen(true);
    setModalLoading(true);
    
    try {
       const res = await fetch(`/api/alternatives?type=${item.type}`);
       const data = await res.json();
       if (data.success) {
         setAlternatives(data.alternatives);
       }
    } catch (e) {
       console.error(e);
    } finally {
       setModalLoading(false);
    }
  };

  const handleSwapConfirm = (alt: any) => {
     if (swapTarget) {
       swapActivity(swapTarget.id, alt);
       setIsModalOpen(false);
     }
  };

  useEffect(() => {
    if (!trip) {
      router.push('/plan');
    }
  }, [trip, router]);

  if (!trip) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="glass p-8 rounded-3xl mb-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10">
           <h1 className="text-4xl font-bold mb-2">ทริป {trip.destination}</h1>
           <p className="text-xl text-on-surface/70 mb-4">{trip.days} วัน • งบประมาณรวม ฿{trip.totalPrice.toLocaleString()}</p>
           
           {trip.sentimentSummary && (
             <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3 mt-6">
               <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
               <p className="text-on-surface/80">{trip.sentimentSummary}</p>
             </div>
           )}
         </div>
      </div>
      
      {/* Timeline */}
      <div className="space-y-0">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
           <MapPin className="w-6 h-6 text-primary" /> แผนการเดินทาง (Itinerary)
        </h2>
        
        {trip.items.map((item, index) => (
          <div key={item.id} className="flex gap-6">
             {/* Timeline Line */}
             <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                  {item.type === 'flight' && <PlaneTakeoff className="w-5 h-5 text-primary" />}
                  {item.type === 'hotel' && <Hotel className="w-5 h-5 text-primary" />}
                  {item.type === 'food' && <Utensils className="w-5 h-5 text-primary" />}
                  {item.type === 'activity' && <MapPin className="w-5 h-5 text-primary" />}
                </div>
                {index !== trip.items.length - 1 && (
                  <div className="w-1 h-full bg-gradient-to-b from-primary/50 to-primary/10 flex-grow my-2 rounded-full"></div>
                )}
             </div>
             
             {/* Card */}
             <div className="flex-grow pb-10">
                <div className="glass p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--primary),0.1)] border border-border/50 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
                   <div className="flex justify-between items-start mb-3">
                     <span className="text-sm font-semibold text-primary/80 bg-primary/10 px-3 py-1 rounded-full">{item.time}</span>
                     <span className="text-xl font-bold">฿{item.price.toLocaleString()}</span>
                   </div>
                   <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                   <p className="text-on-surface/70 leading-relaxed">{item.description}</p>
                   
                   {/* Actions */}
                   <div className="mt-5 flex gap-3">
                     <button 
                       onClick={() => openSwapModal(item)}
                       className="text-sm bg-surface hover:bg-surface-hover px-4 py-2 rounded-lg transition-colors border border-border flex items-center gap-2 font-medium"
                     >
                        <AlertCircle className="w-4 h-4" /> สลับตัวเลือก
                     </button>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      {/* CTA */}
      <div className="mt-16 mb-8 text-center">
         <button onClick={() => alert("จำลองการจอง (1-Click Checkout) กำลังจะเริ่มขึ้น")} className="bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold px-12 py-5 rounded-full shadow-[0_10px_40px_rgba(var(--primary),0.4)] hover:scale-105 transition-transform hover:shadow-[0_15px_50px_rgba(var(--primary),0.5)] flex items-center gap-3 mx-auto">
            <Sparkles className="w-6 h-6" /> ยืนยันและจองทริปทั้งหมด (1-Click Booking)
         </button>
      </div>

      {/* Swap Modal */}
      {isModalOpen && swapTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-border/50 flex flex-col max-h-[80vh]">
             <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface/50">
                <h3 className="text-2xl font-bold">สลับตัวเลือก: {swapTarget.title}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-on-surface/50 hover:text-on-surface">
                  ✕
                </button>
             </div>
             <div className="p-6 overflow-y-auto flex-grow">
                {modalLoading ? (
                  <div className="text-center py-12 animate-pulse">กำลังค้นหาตัวเลือกที่ดีที่สุด...</div>
                ) : (
                  <div className="space-y-4">
                    {alternatives.map(alt => (
                      <div key={alt.id} className="flex justify-between items-center p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleSwapConfirm(alt)}>
                         <div>
                            <h4 className="font-bold text-lg">{alt.title}</h4>
                            <p className="text-sm text-on-surface/70">{alt.description}</p>
                         </div>
                         <div className="text-right">
                            <span className="font-bold text-lg text-primary">฿{alt.price.toLocaleString()}</span>
                            <div className="text-xs text-primary/70 mt-1">เลือกรายการนี้ ➜</div>
                         </div>
                      </div>
                    ))}
                    {alternatives.length === 0 && <div className="text-center py-8">ไม่มีตัวเลือกอื่นในหมวดหมู่นี้</div>}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
