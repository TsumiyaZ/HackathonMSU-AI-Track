'use client';

import { useEffect, useState } from 'react';
import { useEventSource } from '@/hooks/useEventSource';
import { Hotel, PlaneTakeoff, User, X } from 'lucide-react';

type ToastItem = {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  NEW_HOTEL_BOOKING: <Hotel className="w-4 h-4" />,
  NEW_FLIGHT_BOOKING: <PlaneTakeoff className="w-4 h-4" />,
  NEW_USER: <User className="w-4 h-4" />,
};

const COLOR_MAP: Record<string, string> = {
  NEW_HOTEL_BOOKING: 'border-l-amber-500',
  NEW_FLIGHT_BOOKING: 'border-l-secondary',
  NEW_USER: 'border-l-emerald-500',
};

export default function RealtimeToast() {
  const { latestEvent } = useEventSource('/api/sse');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (!latestEvent || latestEvent.type === 'KEEPALIVE') return;

    const d = latestEvent.data;
    let title = '';
    let desc = '';

    switch (latestEvent.type) {
      case 'NEW_HOTEL_BOOKING':
        title = 'จองโรงแรมใหม่';
        desc = `${d.user} จอง ${d.hotel} ${d.nights} คืน ฿${d.amount.toLocaleString()}`;
        break;
      case 'NEW_FLIGHT_BOOKING':
        title = 'จองเที่ยวบินใหม่';
        desc = `${d.user} จอง ${d.airline} ${d.from} → ${d.to} ฿${d.amount.toLocaleString()}`;
        break;
      case 'NEW_USER':
        title = 'สมาชิกใหม่';
        desc = `${d.name} สมัครสมาชิก`;
        break;
    }

    if (!title) return;

    const toast: ToastItem = {
      id: d.id,
      icon: ICON_MAP[latestEvent.type],
      title,
      desc,
      color: COLOR_MAP[latestEvent.type],
    };

    setToasts((prev) => [toast, ...prev].slice(0, 5));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 6_000);
  }, [latestEvent]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto glass-panel-strong rounded-xl border-l-4 ${t.color} p-3 flex items-start gap-3 shadow-xl animate-[slide-up_0.3s_ease-out]`}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            {t.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface">{t.title}</p>
            <p className="text-[11px] text-on-surface-variant truncate">{t.desc}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
