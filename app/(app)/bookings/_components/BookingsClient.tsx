"use client";

import { useState } from "react";
import Link from "next/link";

export type BookingUIItem = {
  id: string;
  title: string;
  destination: string;
  date: string;
  status: string;
  price: number;
  image: string;
};

interface BookingsClientProps {
  initialBookings: BookingUIItem[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, upcoming, completed, pending, cancelled

  const filteredBookings = initialBookings.filter((booking) => {
    const matchesSearch = 
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && booking.status === activeFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'CONFIRMED':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">กำลังจะมาถึง</span>;
      case 'completed':
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-white/10 text-on-surface-variant rounded-full text-xs border border-white/20">ไปมาแล้ว</span>;
      case 'pending':
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">รอชำระเงิน</span>;
      case 'cancelled':
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs border border-red-500/30">ยกเลิกแล้ว</span>;
      default:
        return <span className="px-2 py-1 bg-white/10 text-on-surface-variant rounded-full text-xs border border-white/20">{status}</span>;
    }
  };

  const getStatusFilterMapping = (filter: string) => {
    if (filter === 'upcoming') return ['upcoming', 'CONFIRMED'];
    if (filter === 'pending') return ['pending', 'PENDING'];
    if (filter === 'completed') return ['completed', 'COMPLETED'];
    if (filter === 'cancelled') return ['cancelled', 'CANCELLED'];
    return [];
  };

  const filteredByStatus = initialBookings.filter((booking) => {
    const matchesSearch = 
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && getStatusFilterMapping(activeFilter).includes(booking.status);
  });


  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface">การจองของฉัน</h1>
          <p className="text-on-surface-variant mt-1">จัดการและดูประวัติการเดินทางทั้งหมดของคุณ</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="ค้นหาทริป หรือสถานที่..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-on-surface placeholder:text-on-surface-variant/50" 
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'upcoming', label: 'กำลังจะมาถึง' },
          { id: 'pending', label: 'รอชำระเงิน' },
          { id: 'completed', label: 'ไปมาแล้ว' },
          { id: 'cancelled', label: 'ยกเลิก' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-label text-sm transition-all ${
              activeFilter === filter.id 
                ? "bg-primary text-background font-bold shadow-[0_0_15px_rgba(173,198,255,0.4)]" 
                : "bg-white/5 text-on-surface-variant hover:bg-white/10 border border-white/5"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredByStatus.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[64px] opacity-50">travel_explore</span>
          <p>ไม่พบรายการจองที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredByStatus.map(booking => (
            <Link href={`/bookings/${booking.id}`} key={booking.id} className="group glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(173,198,255,0.1)] flex flex-col">
              <div className="h-48 w-full relative overflow-hidden bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={booking.image} alt={booking.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-primary font-mono mb-1">{booking.id}</div>
                    <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{booking.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {booking.destination}
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  {booking.date}
                </div>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">ยอดรวมสุทธิ</span>
                  <span className="font-display font-bold text-lg">฿{booking.price.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
