"use client";

import { useState } from "react";
import { Search, Filter, CalendarDays, Receipt } from "lucide-react";

interface Booking {
  id: string;
  type: string;
  title: string;
  date: string;
  price: number;
  status: string;
}

export default function BookingsClient({ initialData }: { initialData: Booking[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = initialData.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || b.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="glass-panel-strong p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อโรงแรม, สายการบิน หรือ Booking ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl glass-input outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="pl-12 pr-8 py-3 rounded-xl glass-input outline-none appearance-none cursor-pointer text-on-surface"
          >
            <option value="all" className="text-black">ทุกประเภท</option>
            <option value="โรงแรม" className="text-black">โรงแรม</option>
            <option value="เที่ยวบิน" className="text-black">เที่ยวบิน</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-on-surface-variant text-sm">
              <th className="pb-4 pl-4 font-medium">Booking ID</th>
              <th className="pb-4 font-medium">รายละเอียด</th>
              <th className="pb-4 font-medium">ประเภท</th>
              <th className="pb-4 font-medium">วันที่</th>
              <th className="pb-4 font-medium text-right">ยอดชำระ</th>
              <th className="pb-4 pr-4 font-medium text-right">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                  ไม่พบข้อมูลการจอง
                </td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 pl-4 font-mono text-sm text-primary">{b.id}</td>
                  <td className="py-4 font-medium">{b.title}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold border border-white/10 bg-white/5">
                      {b.type}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-on-surface-variant flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(b.date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-4 text-right font-mono font-medium">{b.price.toLocaleString()} ฿</td>
                  <td className="py-4 pr-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      b.status === 'CONFIRMED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
