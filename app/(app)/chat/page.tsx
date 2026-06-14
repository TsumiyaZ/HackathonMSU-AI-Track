"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Sparkles, Navigation } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "🏖️ หาโรงแรมหรูติดทะเลภูเก็ต",
  "✈️ เที่ยวบินไปเชียงใหม่ราคาถูก",
  "🏨 ที่พักใกล้ทะเลสมุย",
  "📍 สถานที่ท่องเที่ยวยอดฮิตกรุงเทพ",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "สวัสดีครับ! ฉันคือ Travel Buddy 🧳 ผู้ช่วยส่วนตัวของคุณระหว่างเดินทาง ฉันช่วยค้นหาโรงแรม เที่ยวบิน สถานที่เที่ยว และตอบคำถามเกี่ยวกับการเดินทางได้ครับ\n\nมีแพลนไปเที่ยวไหนหรือกำลังมองหาอะไรอยู่ พิมพ์ถามมาได้เลยครับ ✨",
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
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Premium Header */}
      <div className="glass-panel-strong p-6 rounded-3xl border border-glass-border shadow-lg mb-6 flex items-center gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] relative z-10 shrink-0">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Travel Buddy</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-wider flex items-center gap-2 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">ผู้ช่วย AI ส่วนตัว อัจฉริยะทุกการเดินทางของคุณ 24/7</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hidden">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            
            {msg.role === "bot" && (
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 shadow-inner border border-glass-border">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`p-5 rounded-3xl shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-sm border border-primary/20 shadow-primary/20 shadow-lg"
                  : "glass-panel rounded-tl-sm"
              }`}>
                <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "text-white" : "text-on-surface"}`}>
                  {msg.text}
                </p>
              </div>
              <p suppressHydrationWarning className="text-[11px] text-on-surface-variant mt-2 px-2 font-medium opacity-70">
                {msg.timestamp.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {msg.role === "user" && (
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 shadow-inner border border-glass-border">
                <User className="w-5 h-5 text-secondary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 w-full justify-start">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0 shadow-inner border border-glass-border">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="glass-panel p-5 rounded-3xl rounded-tl-sm flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 pt-4 relative">
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs font-medium px-4 py-2 rounded-full glass hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-sm flex items-center gap-2"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ถามเส้นทาง หาโรงแรม เที่ยวบิน หรือขอให้ AI ช่วยจัดทริป..."
            disabled={loading}
            className="w-full glass-panel-strong rounded-full pl-6 pr-16 py-4 text-base outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-on-surface placeholder:text-on-surface-variant"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-full btn-primary-gradient flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <Navigation className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
