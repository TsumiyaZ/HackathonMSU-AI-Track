"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { Sparkles, CheckCircle, CreditCard, QrCode, ArrowLeft, Loader2 } from "lucide-react";
import { requireAuth } from "@/lib/auth-check";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const currentTrip = useTripStore((s) => s.currentTrip);
  const [step, setStep] = useState<"review" | "payment" | "success">("review");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
  const [loading, setLoading] = useState(false);
  const [finalTrip, setFinalTrip] = useState<any>(null); // To hold data for the success screen after clearing store

  if (!currentTrip && step !== "success") {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant">shopping_cart_off</span>
        <h2 className="font-display text-2xl font-bold mt-4">ไม่พบรายการทริป</h2>
        <p className="text-on-surface-variant mt-2">กรุณาสร้างทริปก่อนดำเนินการจอง</p>
        <Link href="/plan" className="mt-6 inline-block px-8 py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold">
          กลับไปสร้างทริป
        </Link>
      </div>
    );
  }

  const handleConfirm = async () => {
    const authed = await requireAuth("/checkout");
    if (!authed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip: currentTrip })
      });

      if (!res.ok) throw new Error("Payment failed");

      setFinalTrip(currentTrip);
      setStep("success");
      
      setTimeout(() => {
        alert("🔔 แจ้งเตือน: จองทริปสำเร็จ! ตั๋วเครื่องบินและที่พักของคุณถูกบันทึกลงระบบแล้ว");
        useTripStore.getState().setTrip(null); // Clear the trip from the store
      }, 500);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success" && finalTrip) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="glass-panel-strong p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">จองทริปสำเร็จ! 🎉</h1>
            <p className="text-on-surface-variant mb-2">ยินดีด้วย! ทริป {finalTrip.destination} ของคุณถูกยืนยันเรียบร้อย</p>
            <div className="glass-panel p-4 rounded-xl mt-6 text-left">
              <p className="text-sm text-on-surface-variant">รหัสการจอง: <span className="font-mono text-primary">TRP-{Date.now().toString(36).toUpperCase()}</span></p>
              <p className="text-sm text-on-surface-variant mt-1">ยอดชำระ: <span className="font-bold text-primary">฿{finalTrip.totalPrice.toLocaleString()}</span></p>
            </div>
            <div className="flex gap-3 mt-8 justify-center">
              <Link href="/bookings" className="px-6 py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold">
                ดูการจองของฉัน
              </Link>
              <Link href="/dashboard" className="px-6 py-3 rounded-xl glass-panel font-label text-sm hover:text-primary transition-colors">
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // To prevent TS errors below if currentTrip becomes null
  if (!currentTrip) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/plan" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit mb-6">
        <ArrowLeft className="w-4 h-4" />
        กลับไปแก้ไขทริป
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass-panel-strong p-6 rounded-2xl">
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              สรุปทริป
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-on-surface-variant">จุดหมาย</span>
                <span className="font-bold text-lg">{currentTrip.destination}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-on-surface-variant">จำนวนวัน</span>
                <span className="font-bold">{currentTrip.days} วัน</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-on-surface-variant font-medium">รายการในทริป:</p>
                {currentTrip.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        {item.type === "flight" ? "flight" : item.type === "hotel" ? "hotel" : item.type === "food" ? "restaurant" : "attraction"}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-on-surface-variant">{item.time}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm">฿{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel-strong p-6 rounded-2xl sticky top-24">
            <h2 className="font-display text-xl font-bold mb-4">ยอดสรุปคำสั่งจอง</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">รวมค่าบริการ</span>
                <span>฿{currentTrip.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">ภาษี (7%)</span>
                <span>฿{Math.round(currentTrip.totalPrice * 0.07).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">ค่าธรรมเนียม</span>
                <span>฿{Math.round(currentTrip.totalPrice * 0.03).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                <span>ยอดสุทธิ</span>
                <span className="text-primary">฿{Math.round(currentTrip.totalPrice * 1.1).toLocaleString()}</span>
              </div>
            </div>

            {step === "review" && (
              <button
                onClick={() => setStep("payment")}
                className="w-full mt-6 py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <CreditCard className="w-5 h-5" />
                ดำเนินการชำระเงิน
              </button>
            )}

            {step === "payment" && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 p-3 rounded-xl border text-center text-sm transition-all ${
                      paymentMethod === "card" ? "bg-primary/15 border-primary text-primary" : "bg-white/5 border-white/10 text-on-surface-variant"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1" />
                    บัตรเครดิต
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`flex-1 p-3 rounded-xl border text-center text-sm transition-all ${
                      paymentMethod === "qr" ? "bg-primary/15 border-primary text-primary" : "bg-white/5 border-white/10 text-on-surface-variant"
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1" />
                    สแกน QR
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <input type="text" placeholder="หมายเลขบัตร" className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" className="glass-input rounded-xl px-4 py-3 text-sm outline-none" />
                      <input type="text" placeholder="CVC" className="glass-input rounded-xl px-4 py-3 text-sm outline-none" />
                    </div>
                    <input type="text" placeholder="ชื่อบนบัตร" className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                )}

                {paymentMethod === "qr" && (
                  <div className="text-center py-6">
                    <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center border border-white/20">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>
                    <p className="text-sm text-on-surface-variant mt-3">สแกน QR Code เพื่อชำระเงิน</p>
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {loading ? "กำลังดำเนินการ..." : `ยืนยันการจอง ฿${Math.round(currentTrip.totalPrice * 1.1).toLocaleString()}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
