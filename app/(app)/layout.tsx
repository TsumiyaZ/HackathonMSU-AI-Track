import type { ReactNode } from "react";
import { AppLayoutClient } from "./_components/AppLayoutClient";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
