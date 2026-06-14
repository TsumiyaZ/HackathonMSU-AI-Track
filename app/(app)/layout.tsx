import type { ReactNode } from "react";
import { AppLayoutClient } from "./_components/AppLayoutClient";
import "../material-symbols.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
