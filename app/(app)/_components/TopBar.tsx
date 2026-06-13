export function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 h-16 bg-surface/30 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(173,198,255,0.08)] flex items-center justify-between px-4 md:px-12">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-base md:text-lg font-semibold text-on-surface">
          AI Trip Architect
        </h2>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <button
          aria-label="การแจ้งเตือน"
          className="relative text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface" />
        </button>
        <button
          aria-label="ตั้งค่า"
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/15 bg-gradient-to-tr from-primary/40 to-secondary/40 flex items-center justify-center font-display text-sm font-semibold text-background">
          T
        </div>
      </div>
    </header>
  );
}
