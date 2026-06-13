"use client";

import { useEffect, useState } from "react";

export function LoginAlert() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-6 left-1/2 z-50 animate-slide-down" style={{ transform: 'translateX(-50%)' }}>
      <div className="glass-panel-strong px-6 py-4 rounded-2xl border border-primary/30 shadow-xl shadow-primary/10 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[24px]">login</span>
        <div>
          <p className="font-semibold text-sm">กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
          <p className="text-xs text-on-surface-variant">เข้าสู่ระบบหรือสมัครสมาชิกเพื่อใช้ฟีเจอร์นี้</p>
        </div>
        <button onClick={() => setVisible(false)} className="text-on-surface-variant hover:text-on-surface ml-4">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
