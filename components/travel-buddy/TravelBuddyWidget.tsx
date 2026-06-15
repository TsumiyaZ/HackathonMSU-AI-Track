"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  LoaderCircle,
  MessageCircleMore,
  Plane,
  SendHorizonal,
  X,
} from "lucide-react";

type ChatAction = {
  href: string;
  label: string;
};

type ChatMessage = {
  actions?: ChatAction[];
  id: string;
  role: "assistant" | "user";
  text: string;
};

const DEFAULT_SUGGESTIONS = [
  "ช่วยหาโรงแรมวิวดีในเชียงใหม่",
  "มีไฟลต์ราคาประหยัดไปภูเก็ตไหม",
  "ช่วยวางทริป 3 วันแบบชิล ๆ ให้หน่อย",
];

export function TravelBuddyWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "สวัสดี ฉันคือ Travel Buddy ช่วยแนะนำโรงแรม เที่ยวบิน ร้านอาหาร และชี้ทางไปหน้าใช้งานที่เหมาะกับทริปของคุณได้เลย",
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const canSend = input.trim().length > 0 && !isSending;
  const starterPrompts = useMemo(() => suggestions.slice(0, 3), [suggestions]);
  const isLandingPage = pathname === "/";
  const isAppShellPage = [
    "/home",
    "/explore",
    "/plan",
    "/bookings",
    "/profile",
    "/checkout",
    "/trip",
    "/admin",
    "/help",
  ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isLandingPage) {
    return null;
  }

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/travel-buddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Travel Buddy ตอบกลับไม่สำเร็จ");
      }

      setSuggestions(Array.isArray(data.suggestions) && data.suggestions.length > 0 ? data.suggestions : DEFAULT_SUGGESTIONS);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: data.reply,
          actions: data.actions,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "ตอนนี้ Travel Buddy มีปัญหานิดหน่อย ลองถามใหม่อีกครั้ง หรือเปิดหน้า Explore / Plan ตรง ๆ ก่อนได้เลย",
          actions: [
            { href: "/plan", label: "เปิด AI Planner" },
            { href: "/explore", label: "เปิด Explore" },
          ],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className={`pointer-events-none fixed right-4 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 sm:right-6 ${
        isAppShellPage
          ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6"
          : "bottom-4 sm:bottom-6"
      }`}
    >
      {isOpen ? (
        <section className="pointer-events-auto flex h-[min(560px,76dvh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-[#b7cdf5]/70 bg-white/96 shadow-[0_30px_80px_rgba(18,51,111,0.24)] backdrop-blur-2xl">
          <div className="relative overflow-hidden border-b border-[#d6e4fb] bg-[linear-gradient(145deg,#1d67da_0%,#11377f_100%)] px-5 py-4 text-white">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/14">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-black">Travel Buddy</p>
                  <p className="mt-1 max-w-[220px] text-xs text-blue-100/90">
                    ผู้ช่วยแนะนำโรงแรม เที่ยวบิน และทริปเที่ยวแบบตอบไว
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 transition-colors hover:bg-white/16"
                aria-label="Close Travel Buddy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-[22px] rounded-br-md bg-[#1b63d8] px-4 py-3 text-sm leading-relaxed text-white shadow-[0_14px_36px_rgba(27,99,216,0.25)]"
                      : "max-w-[88%] rounded-[22px] rounded-bl-md border border-[#d5e2fa] bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-[0_16px_36px_rgba(71,109,173,0.08)]"
                  }
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.actions && message.actions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Link
                          key={`${message.id}-${action.href}`}
                          href={action.href}
                          className="inline-flex items-center gap-1 rounded-full border border-[#c8daf8] bg-[#eff5ff] px-3 py-1.5 text-xs font-semibold text-[#12336f] transition-colors hover:bg-[#dfeafd]"
                        >
                          <Plane className="h-3.5 w-3.5" />
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d5e2fa] bg-white px-4 py-2 text-sm text-slate-500 shadow-[0_16px_36px_rgba(71,109,173,0.08)]">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Travel Buddy กำลังช่วยคิดอยู่...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#d6e4fb] bg-white px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-[#d2def6] bg-[#f4f8ff] px-3 py-1.5 text-left text-xs font-medium text-[#21467f] transition-colors hover:bg-[#e6f0ff]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
              className="flex items-end gap-2"
            >
              <label className="sr-only" htmlFor="travel-buddy-input">
                Ask Travel Buddy
              </label>
              <textarea
                id="travel-buddy-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="ถามเรื่องโรงแรม เที่ยวบิน หรือให้ช่วยเริ่มแพลนทริป..."
                className="min-h-12 flex-1 resize-none rounded-2xl border border-[#cad8f2] bg-[#f9fbff] px-4 py-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#4d84df]"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#1d67da_0%,#11377f_100%)] text-white shadow-[0_18px_36px_rgba(18,51,111,0.22)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Send message"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#bfd2f5] bg-white/92 shadow-[0_18px_44px_rgba(18,51,111,0.18)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
        aria-expanded={isOpen}
        aria-label="Open Travel Buddy"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1d67da_0%,#11377f_100%)] text-white shadow-[0_10px_24px_rgba(18,51,111,0.22)]">
          <MessageCircleMore className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
}
