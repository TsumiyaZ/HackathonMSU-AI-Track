import Link from "next/link";
import { UserRound } from "lucide-react";
import { TRANSLATIONS } from "@/lib/translations";

export function AuthStatusButton() {
  const t = TRANSLATIONS.th;

  return (
    <Link
      href="/auth/login"
      className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-md shadow-black/5 transition-all duration-200 hover:bg-slate-50 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <UserRound className="h-5 w-5 text-primary" />
      <span>{t.signIn}</span>
    </Link>
  );
}
