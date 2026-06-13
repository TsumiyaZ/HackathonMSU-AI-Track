import type { HTMLAttributes } from "react";

export function GlassCard({
  className = "",
  strong = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={
        (strong ? "glass-panel-strong" : "glass-panel") +
        " rounded-2xl " +
        className
      }
      {...props}
    />
  );
}
