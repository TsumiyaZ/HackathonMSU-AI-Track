"use client";

import { requireAuth } from "@/lib/auth-check";

export function AuthButton({ label, icon, redirectTo, className }: {
  label: string;
  icon: string;
  redirectTo?: string;
  className?: string;
}) {
  const handleClick = async () => {
    const authed = await requireAuth(redirectTo);
    if (!authed) return;
    // If authenticated, would proceed
    alert("🔔 การจองจำลองสำเร็จแล้ว! (ระบบจำลอง)");
  };

  return (
    <button onClick={handleClick} className={className}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}
