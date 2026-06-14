"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Sparkles, Navigation, X } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "🏖️ โรงแรมหรูติดทะเลภูเก็ต",
  "✈️ เที่ยวบินไปเชียงใหม่ราคาถูก",
  "📍 สถานที่ยอดฮิตกรุงเทพ",
];

export function ChatDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "สวัสดีครับ! ฉันคือ Travel Buddy 🧳 ผู้ช่วยส่วนตัวของคุณ\n\nถามเรื่องโรงแรม เที่ยวบิน หรือทริปได้เลยครับ ✨",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat?q=${encodeURIComponent(text.trim())}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: data.answer || "ขออภัย ไม่สามารถหาคำตอบได้ในขณะนี้ครับ",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่ครับ",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Drawer panel ──
          Mobile: slides up from bottom (bottom sheet)
          md+:    slides in from the right as a side panel
      */}
      <div
        role="dialog"
        aria-label="Travel Buddy Chat"
        aria-modal="true"
        className={`
          fixed z-50 flex flex-col
          transition-transform duration-300 ease-out

          /* Mobile — bottom sheet */
          bottom-0 left-0 right-0
          h-[82dvh] rounded-t-3xl
          translate-y-0

          /* md+ — right panel */
          md:bottom-4 md:right-4 md:left-auto md:top-4
          md:w-[400px] md:h-auto md:rounded-2xl

          glass-panel-strong border border-white/10 shadow-2xl

          ${isOpen
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-[110%]"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 flex-shrink-0">
          {/* Drag handle (mobile) */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20 md:hidden" />

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.3)] shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary truncate">
                Travel Buddy
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold tracking-wider flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">ผู้ช่วย AI เพื่อการเดินทาง 24/7</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="ปิดแชท"
            className="w-8 h-8 rounded-full glass flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-sm shadow-lg shadow-primary/20"
                      : "glass-panel rounded-tl-sm text-on-surface"
                  }`}
                >
                  {msg.text}
                </div>
                <p
                  suppressHydrationWarning
                  className="text-[10px] text-on-surface-variant mt-1 px-1 opacity-60"
                >
                  {msg.timestamp.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 border border-white/10">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 border border-white/10">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          {/* Quick suggestions */}
          <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hidden pb-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full glass hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all whitespace-nowrap flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ถามเรื่องทริป โรงแรม เที่ยวบิน..."
              disabled={loading}
              className="flex-1 glass-panel rounded-full pl-4 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface placeholder:text-on-surface-variant"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="ส่ง"
              className="w-10 h-10 rounded-full btn-primary-gradient flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Navigation className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
