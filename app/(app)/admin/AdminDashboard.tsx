"use client";

import { useState, useEffect } from "react";
import { useEventSource } from "@/hooks/useEventSource";
import { Hotel, PlaneTakeoff, User, Radio, Wifi, WifiOff } from 'lucide-react';
import RealtimeToast from "@/components/realtime/RealtimeToast";

export default function AdminDashboard({ initialUser }: { initialUser: any }) {
  const [user] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'dashboard' | 'hotels' | 'users'>('dashboard');

  const { events: liveEvents, connected } = useEventSource('/api/sse');
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editingHotel, setEditingHotel] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [searchHotel, setSearchHotel] = useState('');
  const [notification, setNotification] = useState<{ message: string, amount: number, id: number } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/hotels').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]).then(([s, h, u]) => {
      setStats(s);
      setAllHotels(h);
      setAllUsers(u);
    }).catch(err => {
      console.error("Failed to load admin data:", err);
    }).finally(() => setLoading(false));
  }, []);

  // Real-time booking simulation (Hackathon Bonus)
  useEffect(() => {
    const interval = setInterval(() => {
      const generatedRevenue = Math.floor(Math.random() * 12000) + 3000;
      const hotels = ["H-BKK-01", "H-CNX-02", "H-HKT-03", "H-KBV-04", "H-SMU-05"];
      const hotelId = hotels[Math.floor(Math.random() * hotels.length)];

      setNotification({
        message: `มีรายการจองที่พัก ${hotelId}`,
        amount: generatedRevenue,
        id: Date.now()
      });

      setStats((prev: any) => {
        if (!prev) return prev;

        const newTotalRevenue = prev.totalRevenue + generatedRevenue;
        const newBookings = prev.bookings + 1;

        const newBooking = {
          id: `SIM-${Math.floor(Math.random() * 100000)}`,
          hotel_id: hotelId,
          nights: Math.floor(Math.random() * 4) + 1,
          total: generatedRevenue,
          status: 'CONFIRMED'
        };

        return {
          ...prev,
          totalRevenue: newTotalRevenue,
          revenue: newTotalRevenue, // Update both if needed
          bookings: newBookings,
          recentBookings: [newBooking, ...(prev.recentBookings || [])].slice(0, 10)
        };
      });
    }, 5000); // Every 12 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-8 skeleton-shimmer rounded-xl w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton-shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const startEdit = (hotel: any) => { setEditingHotel(hotel.hotel_id); setEditForm({ ...hotel }); };
  const saveHotel = async () => {
    const res = await fetch('/api/admin/hotels', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    if (res.ok) { setAllHotels(prev => prev.map(h => h.hotel_id === editForm.hotel_id ? editForm : h)); setEditingHotel(null); }
  };
  const deleteHotel = async (id: string) => {
    if (!confirm('ลบโรงแรมนี้?')) return;
    const res = await fetch(`/api/admin/hotels?id=${id}`, { method: 'DELETE' });
    if (res.ok) setAllHotels(prev => prev.filter(h => h.hotel_id !== id));
  };
  const promoteUser = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, role }) });
    if (res.ok) setAllUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role } : u));
  };

  const filteredHotels = allHotels.filter(h => h.name?.toLowerCase().includes(searchHotel.toLowerCase()) || h.location?.toLowerCase().includes(searchHotel.toLowerCase()));

  const totalRole = stats?.roleBreakdown?.reduce((s: number, r: any) => s + r.value, 0) || 1;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-strong p-6 md:p-8 mb-8 border border-amber-500/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">
                สวัสดี <span className="font-bold text-amber-400">{user?.name}</span> — ภาพรวมระบบวันนี้
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 glass-panel p-1 rounded-2xl w-fit">
        {[
          { key: 'dashboard' as const, label: 'แดชบอร์ด', icon: 'bar_chart' },
          { key: 'hotels' as const, label: 'จัดการโรงแรม', icon: 'hotel' },
          { key: 'users' as const, label: 'จัดการผู้ใช้', icon: 'group' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${tab === t.key ? 'bg-amber-500/20 text-amber-400 shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}>
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════ TAB: DASHBOARD ═══════════════════════════════════════ */}
      {tab === 'dashboard' && stats && (
        <div className="flex flex-col gap-6">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'รายได้ทั้งหมด', value: `฿${(stats.revenue || 0).toLocaleString()}`, sub: 'จากการจองที่ดำเนินการ', icon: 'payments', color: 'from-emerald-400 to-green-600', bg: 'bg-emerald-500/10' },
              { label: 'ผู้ใช้ทั้งหมด', value: stats.users, sub: `${stats.roleBreakdown?.[0]?.value || 0} MEMBER · ${stats.roleBreakdown?.[1]?.value || 0} VIP`, icon: 'group', color: 'from-blue-400 to-indigo-600', bg: 'bg-blue-500/10' },
              { label: 'จุดหมาย', value: stats.totalItems, sub: `${stats.hotels} โรงแรม · ${stats.flights} เที่ยวบิน · ${stats.restaurants} ร้านอาหาร`, icon: 'explore', color: 'from-violet-400 to-purple-600', bg: 'bg-violet-500/10' },
              { label: 'การจองทั้งหมด', value: stats.bookings + stats.tickets, sub: `แต้มสะสม ${(stats.totalLoyaltyPoints || 0).toLocaleString()} pts`, icon: 'event_available', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10' },
            ].map(s => (
              <div key={s.label} className="glass-panel rounded-2xl p-5 hover:border-amber-500/20 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1", color: s.color.match(/(emerald|green|blue|indigo|violet|purple|amber|orange)/)?.[0] === 'emerald' ? '#34d399' : s.color.match(/(emerald|green|blue|indigo|violet|purple|amber|orange)/)?.[0] === 'blue' ? '#60a5fa' : s.color.match(/(emerald|green|blue|indigo|violet|purple|amber|orange)/)?.[0] === 'violet' ? '#a78bfa' : '#f59e0b' }}>{s.icon}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
                {s.sub && <p className="text-[10px] text-on-surface-variant/60 mt-1 leading-tight">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Role Distribution */}
            <div className="glass-panel rounded-2xl p-5 md:p-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400">pie_chart</span>
                สัดส่วนผู้ใช้ตาม Role
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {stats.roleBreakdown?.map((r: any, i: number) => {
                      const pct = r.value / totalRole;
                      const circumference = 2 * Math.PI * 14;
                      const offset = stats.roleBreakdown.slice(0, i).reduce((s: number, x: any) => s + (x.value / totalRole) * circumference, 0);
                      return (
                        <circle key={r.name} cx="18" cy="18" r="14" fill="none"
                          stroke={r.color} strokeWidth="4"
                          strokeDasharray={`${pct * circumference} ${circumference - pct * circumference}`}
                          strokeDashoffset={-offset} className="transition-all duration-700"
                        />
                      );
                    })}
                    <text x="18" y="18" textAnchor="middle" dominantBaseline="central"
                      className="fill-on-surface text-[8px] font-bold">
                      {stats.users}
                    </text>
                    <text x="18" y="22" textAnchor="middle" dominantBaseline="central"
                      className="fill-on-surface-variant text-[3px]">คน</text>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {stats.roleBreakdown?.map((r: any) => (
                    <div key={r.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-on-surface-variant flex-1">{r.name === 'ADMIN' ? 'ผู้ดูแลระบบ' : r.name === 'VIP' ? 'สมาชิก VIP' : 'สมาชิกทั่วไป'}</span>
                      <span className="text-xs font-bold">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotel Price Distribution */}
            <div className="glass-panel rounded-2xl p-5 md:p-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400">bar_chart</span>
                ราคาโรงแรมเฉลี่ย ฿{stats.avgHotelPrice?.toLocaleString()}/คืน
              </h3>
              <div className="flex flex-col gap-2.5">
                {stats.priceRanges?.map((r: any) => {
                  const maxCount = Math.max(...(stats.priceRanges?.map((x: any) => x.count) || [1]));
                  const pct = (r.count / maxCount) * 100;
                  return (
                    <div key={r.range} className="flex items-center gap-3">
                      <span className="text-[11px] text-on-surface-variant w-20 shrink-0">{r.range}</span>
                      <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 3)}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="glass-panel rounded-2xl p-5 md:p-6">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              กิจกรรมเรียลไทม์
              {connected ? (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
                  <Wifi className="w-3 h-3" /> เชื่อมต่ออยู่
                </span>
              ) : (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-red-400">
                  <WifiOff className="w-3 h-3" /> ขาดการเชื่อมต่อ
                </span>
              )}
            </h3>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {liveEvents.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-4">รอข้อมูลเรียลไทม์...</p>
              )}
              {liveEvents.map((evt, i) => {
                const d = evt.data;
                let icon = <Radio className="w-3.5 h-3.5" />;
                let label = '';
                let color = 'text-on-surface-variant';
                switch (evt.type) {
                  case 'NEW_HOTEL_BOOKING':
                    icon = <Hotel className="w-3.5 h-3.5 text-amber-400" />;
                    label = `${d.user} จอง ${d.hotel} ฿${d.amount.toLocaleString()}`;
                    color = 'text-amber-400';
                    break;
                  case 'NEW_FLIGHT_BOOKING':
                    icon = <PlaneTakeoff className="w-3.5 h-3.5 text-secondary" />;
                    label = `${d.user} จอง ${d.airline} ${d.from}→${d.to}`;
                    color = 'text-secondary';
                    break;
                  case 'NEW_USER':
                    icon = <User className="w-3.5 h-3.5 text-emerald-400" />;
                    label = `${d.name} สมัครสมาชิกใหม่`;
                    color = 'text-emerald-400';
                    break;
                }
                return (
                  <div key={d.id || i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                    {icon}
                    <span className="text-[11px] text-on-surface-variant flex-1 truncate">{label}</span>
                    <span className={`text-[10px] font-mono ${color}`}>{d.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Distribution + Recent Bookings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Locations */}
            <div className="glass-panel rounded-2xl p-5 md:p-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400">location_on</span>
                โรงแรมแยกตามจังหวัด
              </h3>
              <div className="flex flex-col gap-2">
                {stats.locationStats?.map((loc: any) => {
                  const maxLoc = Math.max(...(stats.locationStats?.map((x: any) => x.count) || [1]));
                  const pct = (loc.count / maxLoc) * 100;
                  return (
                    <div key={loc.name} className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant flex-1 truncate">{loc.name}</span>
                      <div className="w-32 h-4 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${Math.max(pct, 3)}%` }} />
                      </div>
                      <span className="text-xs font-bold w-6 text-right">{loc.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="glass-panel rounded-2xl p-5 md:p-6">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-400">receipt_long</span>
                การจองล่าสุด
              </h3>
              <div className="flex flex-col gap-2">
                {stats.recentBookings?.slice(0, 6).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.status === 'CONFIRMED' ? 'bg-emerald-400' :
                        b.status === 'CHECKED_IN' ? 'bg-blue-400' :
                          b.status === 'CHECKED_OUT' ? 'bg-violet-400' :
                            b.status === 'CANCELLED' ? 'bg-red-400' : 'bg-amber-400'
                        }`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{b.hotel_id}</p>
                        <p className="text-[10px] text-on-surface-variant">{b.nights} คืน · ฿{(b.total || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                      b.status === 'CHECKED_IN' ? 'bg-blue-500/10 text-blue-400' :
                        b.status === 'CHECKED_OUT' ? 'bg-violet-500/10 text-violet-400' :
                          b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>{b.status === 'CHECKED_IN' ? 'กำลังพัก' : b.status === 'CHECKED_OUT' ? 'เช็คเอาท์แล้ว' : b.status === 'CANCELLED' ? 'ยกเลิก' : b.status === 'CONFIRMED' ? 'ยืนยันแล้ว' : 'รอดำเนินการ'}</span>
                  </div>
                ))}
                {(!stats.recentBookings || stats.recentBookings.length === 0) && (
                  <p className="text-xs text-on-surface-variant text-center py-4">ยังไม่มีการจอง</p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'รายได้รวมทั้งหมด', value: `฿${(stats.totalRevenue || 0).toLocaleString()}`, icon: 'account_balance' },
              { label: 'ค่าที่พักเฉลี่ย/คืน', value: `฿${(stats.avgHotelPrice || 0).toLocaleString()}`, icon: 'hotel' },
              { label: 'แต้มสะสมผู้ใช้', value: (stats.totalLoyaltyPoints || 0).toLocaleString(), icon: 'loyalty' },
              { label: 'อัตราการจอง', value: `${stats.hotels ? Math.round((stats.bookings / stats.hotels) * 100) : 0}%`, icon: 'trending_up' },
            ].map(s => (
              <div key={s.label} className="glass-panel rounded-xl p-3 text-center">
                <span className="material-symbols-outlined text-[16px] text-amber-400">{s.icon}</span>
                <p className="text-sm font-bold mt-0.5">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                <p className="text-[10px] text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ TAB: HOTELS ═══════════════════════════════════════ */}
      {tab === 'hotels' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
              <input type="text" placeholder="ค้นหาโรงแรม..." value={searchHotel} onChange={e => setSearchHotel(e.target.value)}
                className="w-full bg-surface/50 border border-border/50 text-on-surface rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <span className="text-sm text-on-surface-variant">{filteredHotels.length} รายการ</span>
          </div>
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left text-on-surface-variant">
                    <th className="p-3 font-semibold">ชื่อ</th>
                    <th className="p-3 font-semibold">ที่ตั้ง</th>
                    <th className="p-3 font-semibold">ราคา/คืน</th>
                    <th className="p-3 font-semibold">คะแนน</th>
                    <th className="p-3 font-semibold text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotels.map(h => (
                    <tr key={h.hotel_id} className="border-b border-border/20 hover:bg-amber-500/5 transition-colors">
                      {editingHotel === h.hotel_id ? (
                        <>
                          <td className="p-2"><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-surface/80 border border-border/50 rounded-lg px-2 py-1 text-sm" /></td>
                          <td className="p-2"><input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-surface/80 border border-border/50 rounded-lg px-2 py-1 text-sm" /></td>
                          <td className="p-2"><input type="number" value={editForm.price_per_night} onChange={e => setEditForm({ ...editForm, price_per_night: +e.target.value })} className="w-24 bg-surface/80 border border-border/50 rounded-lg px-2 py-1 text-sm" /></td>
                          <td className="p-2"><input type="number" step="0.1" value={editForm.rating} onChange={e => setEditForm({ ...editForm, rating: +e.target.value })} className="w-20 bg-surface/80 border border-border/50 rounded-lg px-2 py-1 text-sm" /></td>
                          <td className="p-2 text-right">
                            <button onClick={saveHotel} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 mr-1"><span className="material-symbols-outlined text-[14px]">save</span> บันทึก</button>
                            <button onClick={() => setEditingHotel(null)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-on-surface-variant text-xs hover:bg-white/20"><span className="material-symbols-outlined text-[14px]">close</span></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-medium">{h.name}</td>
                          <td className="p-3 text-on-surface-variant">{h.location}</td>
                          <td className="p-3">฿{h.price_per_night?.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${h.rating >= 4 ? 'bg-emerald-500/20 text-emerald-400' : h.rating >= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                              }`}>{h.rating}</span>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => startEdit(h)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20 mr-1"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                            <button onClick={() => deleteHotel(h.hotel_id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ TAB: USERS ═══════════════════════════════════════ */}
      {tab === 'users' && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-on-surface-variant">
                  <th className="p-3 font-semibold">ชื่อ</th>
                  <th className="p-3 font-semibold">อีเมล</th>
                  <th className="p-3 font-semibold">แต้ม</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.user_id} className="border-b border-border/20 hover:bg-amber-500/5 transition-colors">
                    <td className="p-3 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white">{u.name?.charAt(0).toUpperCase()}</div>
                      {u.name}
                    </td>
                    <td className="p-3 text-on-surface-variant">{u.email}</td>
                    <td className="p-3">{u.loyalty_points?.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        u.role === 'VIP' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>{u.role}</span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => promoteUser(u.user_id, u.role === 'VIP' ? 'MEMBER' : 'VIP')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20">
                          <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                          {u.role === 'VIP' ? 'ลดเป็น MEMBER' : 'เลื่อนเป็น VIP'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-[slide-up_0.4s_ease-out]">
          <div className="glass-panel-strong border border-emerald-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(16,185,129,0.25)] flex items-center gap-4 bg-surface/95 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="material-symbols-outlined text-emerald-500 text-[24px]">payments</span>
            </div>
            <div className="pr-2">
              <p className="text-xs text-on-surface-variant font-medium mb-0.5">{notification.message}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">สำเร็จ</span>
                <p className="font-display font-black text-emerald-500 text-lg leading-tight">
                  +฿{notification.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <RealtimeToast />
    </div>
  );
}
