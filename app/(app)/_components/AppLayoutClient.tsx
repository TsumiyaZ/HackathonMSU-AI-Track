"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const pathname = usePathname();
  const isChat = pathname === '/chat';

  return (
    <div className="min-h-screen bg-background text-on-surface grid-bg">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`transition-all duration-300 pt-16 min-h-screen ${isChat ? 'pb-4' : 'pb-24'} px-4 md:px-12 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        <div className={`max-w-[1440px] mx-auto ${isChat ? 'pt-4' : 'py-8'} flex flex-col gap-6`}>
          {children}
        </div>
      </main>
    </div>
  );
}
