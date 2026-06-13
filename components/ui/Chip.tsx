import type { HTMLAttributes } from "react";

type Variant = "glass" | "primary" | "secondary" | "outline";

const BASE =
  "inline-flex items-center gap-1 px-3 py-1 rounded-full font-label text-xs whitespace-nowrap";

const VARIANTS: Record<Variant, string> = {
  glass: "glass-panel text-on-surface-variant",
  primary: "bg-primary/15 border border-primary/30 text-primary",
  secondary: "bg-secondary-container/20 border border-secondary/30 text-secondary",
  outline: "border border-white/15 text-on-surface-variant",
};

type Props = HTMLAttributes<HTMLSpanElement> & { variant?: Variant };

export function Chip({ variant = "glass", className = "", ...props }: Props) {
  return (
    <span className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />
  );
}
