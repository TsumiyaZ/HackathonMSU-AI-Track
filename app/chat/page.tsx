"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MapPin, Loader2, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "ช่วยหาโรงแรมในภูเก็ตหน่อย",
  "มีร้านอาหารแนะนำในเชียงใหม่ไหม",
  "พิกัดสถานที่ท่องเที่ยวในกรุงเทพ",
  "ร้านอาหารใกล้ฉันที่เปิดตอนนี้",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "สวัสดี! ฉันคือ Travel Buddy 🧳 ผู้ช่วยส่วนตัวของคุณระหว่างเดินทาง ฉันสามารถช่วยคุณค้นหาพิกัดสถานที่ โรงแรม ร้านอาหาร และตอบคำถามเกี่ยวกับการเดินทางได้ พิมพ์ถามมาได้เลย!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: data.answer || "ขออภัย ฉันไม่สามารถหาคำตอบได้ในขณะนี้ ลองถามอย่างอื่นดูนะคะ",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="glass-panel-strong p-6 rounded-t-3xl border-b border-white/10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Bot className="w-6 h-6 text-background" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Travel Buddy</h1>
          <p className="text-sm text-on-surface-variant">ผู้ช่วยส่วนตัวระหว่างเดินทาง พร้อมตอบทุกคำถาม 24/7</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ออนไลน์
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-surface/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === "user" 
                ? "bg-primary/20 text-primary" 
                : "bg-gradient-to-tr from-primary/30 to-secondary/30 text-primary"
            }`}>
              {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] ${
              msg.role === "user" ? "order-1" : ""
            }`}>
              <div className={`p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-primary/15 border border-primary/20 text-on-surface rounded-tr-md"
                  : "glass-panel border border-white/5 rounded-tl-md"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1 px-1">
                {msg.timestamp.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="glass-panel p-4 rounded-2xl rounded-tl-md border border-white/5">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-panel-strong rounded-b-3xl border-t border-white/10 p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-on-surface transition-all"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความที่นี่..."
            disabled={loading}
            className="flex-1 glass-input rounded-xl px-5 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-primary text-background flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
