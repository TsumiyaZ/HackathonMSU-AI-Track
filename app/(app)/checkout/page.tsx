"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/lib/store";
import { Sparkles, CheckCircle, CreditCard, QrCode, ArrowLeft, Loader2 } from "lucide-react";
import { requireAuth } from "@/lib/auth-check";
import Link from "next/link";
import { TRANSLATIONS } from "@/lib/translations";

export default function CheckoutPage() {
  const router = useRouter();
  const currentTrip = useTripStore((s) => s.currentTrip);
  const lang = useTripStore((s) => s.lang);
  const t = TRANSLATIONS[lang];

  const [step, setStep] = useState<"review" | "payment" | "success">("review");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
  const [loading, setLoading] = useState(false);
  const [finalTrip, setFinalTrip] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!currentTrip && step !== "success") {
    return (
      <div className="max-w-2xl mx-auto py-10 md:py-20 text-center px-4">
        <span className="material-symbols-outlined text-[56px] md:text-[64px] text-on-surface-variant">
          shopping_cart_off
        </span>
        <h2 className="font-display text-xl md:text-2xl font-bold mt-4">{t.checkoutNoTrip}</h2>
        <p className="text-on-surface-variant mt-2 text-sm md:text-base">{t.checkoutNoTripDesc}</p>
        <Link
          href="/plan"
          className="mt-6 inline-block px-6 md:px-8 py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold"
        >
          {t.checkoutBackToPlan}
        </Link>
      </div>
    );
  }

  const handleConfirm = async () => {
    const authed = await requireAuth("/checkout");
    if (!authed) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip: currentTrip }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      setBookingId(`TRP-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`);
      setFinalTrip(currentTrip);
      setStep("success");
      // Clear trip from store after success
      setTimeout(() => {
        useTripStore.getState().setTrip(null);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || t.checkoutErrorDefault);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (step === "success" && finalTrip) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{t.checkoutSuccess}</h1>
            <p className="text-on-surface-variant text-sm md:text-base mb-2">
              {t.checkoutConfirmed.replace("{destination}", finalTrip.destination)}
            </p>
            <div className="glass-panel p-4 rounded-xl mt-4 md:mt-6 text-left">
              <p className="text-sm text-on-surface-variant">
                {t.checkoutBookingIdLabel}{" "}
                <span className="font-mono text-primary">{bookingId}</span>
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                {t.checkoutPaidAmountLabel} <span className="font-bold text-primary">฿{finalTrip.totalPrice.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8 justify-center">
              <Link
                href="/bookings"
                className="px-6 py-3 rounded-xl btn-primary-gradient font-label text-sm font-bold text-center hover-lift press-scale"
              >
                {t.checkoutViewBookingsBtn}
              </Link>
              <Link
                href="/home"
                className="px-6 py-3 rounded-xl glass-panel font-label text-sm hover:text-primary transition-colors text-center hover-lift press-scale"
              >
                {t.checkoutBackHomeBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTrip) return null;

  const tax = Math.round(currentTrip.totalPrice * 0.07);
  const fee = Math.round(currentTrip.totalPrice * 0.03);
  const total = currentTrip.totalPrice + tax + fee;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top Actions */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Link
          href="/plan"
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm md:text-base hover-lift press-scale"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.checkoutBackToEdit}
        </Link>
        <button
          onClick={() => setShowCancelModal(true)}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm md:text-base font-medium hover-lift press-scale"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          {t.checkoutCancelTripBtn}
        </button>
      </div>

      {/* Main content — single column on mobile, 5-col grid on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* ── Left: Trip Summary ── */}
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6">
          <div className="glass-panel-strong p-4 md:p-6 rounded-2xl">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t.checkoutTripSummary}
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-white/10">
                <span className="text-on-surface-variant text-sm md:text-base">{t.checkoutDestination}</span>
                <span className="font-bold text-base md:text-lg">{currentTrip.destination}</span>
              </div>
              <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-white/10">
                <span className="text-on-surface-variant text-sm md:text-base">{t.checkoutDays}</span>
                <span className="font-bold text-sm md:text-base">{currentTrip.days} {t.daysUnit}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs md:text-sm text-on-surface-variant font-medium">{t.checkoutItineraryItems}</p>
                {currentTrip.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2.5 md:p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <span className="material-symbols-outlined text-primary text-[18px] md:text-[20px] flex-shrink-0">
                        {item.type === "flight"
                          ? "flight"
                          : item.type === "hotel"
                            ? "hotel"
                            : item.type === "food"
                              ? "restaurant"
                              : "attraction"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-[10px] md:text-xs text-on-surface-variant">{item.time}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs md:text-sm flex-shrink-0 ml-2">
                      ฿{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Price Summary + Payment ── */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          <div className="glass-panel-strong p-4 md:p-6 rounded-2xl lg:sticky lg:top-24">
            <h2 className="font-display text-lg md:text-xl font-bold mb-3 md:mb-4">{t.checkoutOrderSummary}</h2>

            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{t.checkoutSubtotal}</span>
                <span>฿{currentTrip.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{t.checkoutTax}</span>
                <span>฿{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{t.checkoutFee}</span>
                <span>฿{fee.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-2 md:pt-3 flex justify-between font-bold text-base md:text-lg">
                <span>{t.checkoutTotal}</span>
                <span className="text-primary">฿{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Step: review → go to payment */}
            {step === "review" && (
              <button
                onClick={() => setStep("payment")}
                className="w-full mt-4 md:mt-6 py-3 md:py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover-lift press-scale"
              >
                <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                {t.checkoutProceedPayment}
              </button>
            )}

            {/* Step: payment */}
            {step === "payment" && (
              <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                {/* Payment method tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 p-2.5 md:p-3 rounded-xl border text-center text-xs md:text-sm transition-all hover-lift press-scale ${paymentMethod === "card"
                      ? "bg-primary/15 border-primary text-primary"
                      : "bg-white/5 border-white/10 text-on-surface-variant"
                      }`}
                  >
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 mx-auto mb-1" />
                    {t.checkoutCreditCard}
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`flex-1 p-2.5 md:p-3 rounded-xl border text-center text-xs md:text-sm transition-all hover-lift press-scale ${paymentMethod === "qr"
                      ? "bg-primary/15 border-primary text-primary"
                      : "bg-white/5 border-white/10 text-on-surface-variant"
                      }`}
                  >
                    <QrCode className="w-4 h-4 md:w-5 md:h-5 mx-auto mb-1" />
                    {t.checkoutScanQR}
                  </button>
                </div>

                {/* Card form */}
                {paymentMethod === "card" && (
                  <div className="space-y-2 md:space-y-3">
                    <input
                      type="text"
                      placeholder={t.checkoutCardNumber}
                      className="w-full glass-input rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="glass-input rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="glass-input rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={t.checkoutCardholderName}
                      className="w-full glass-input rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none"
                    />
                  </div>
                )}

                {/* QR code */}
                {paymentMethod === "qr" && (
                  <div className="text-center py-4 md:py-6">
                    <div className="w-36 h-36 md:w-48 md:h-48 mx-auto bg-white rounded-xl flex items-center justify-center border border-white/20">
                      <QrCode className="w-24 h-24 md:w-32 md:h-32 text-black" />
                    </div>
                    <p className="text-xs md:text-sm text-on-surface-variant mt-3">{t.checkoutScanQRDesc}</p>
                  </div>
                )}

                {/* Inline error message */}
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                    {errorMsg}
                  </div>
                )}

                {/* Confirm button */}
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-3 md:py-4 rounded-xl btn-primary-gradient font-label text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 hover-lift press-scale"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                  {loading ? t.checkoutProcessing : t.checkoutConfirmBtn.replace("{total}", total.toLocaleString())}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Custom Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center animate-[slide-up_0.3s_ease-out]">
            <div className="w-16 h-16 mx-auto bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <span className="material-symbols-outlined text-red-500 text-[32px]">delete_forever</span>
            </div>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">{t.checkoutCancelConfirmTitle}</h3>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              {t.checkoutCancelConfirmDesc}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-on-surface hover:bg-white/5 transition-colors"
              >
                {t.checkoutBack}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  useTripStore.getState().setTrip(null);
                  router.push("/checkout");
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-[0_8px_20px_rgba(239,68,68,0.25)] transition-all active:scale-95"
              >
                {t.checkoutConfirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
