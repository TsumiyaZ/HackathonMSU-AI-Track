import type { ReactNode } from "react";
import { Sidebar } from "./_components/Sidebar";
import { TopBar } from "./_components/TopBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface grid-bg">
      <Sidebar />
      <TopBar />
      <main className="md:ml-64 pt-16 min-h-screen pb-24 px-4 md:px-12">
        <div className="max-w-[1440px] mx-auto py-8 flex flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
