import Link from "next/link";
import { UserRound } from "lucide-react";
import { TRANSLATIONS } from "@/lib/translations";
import { getSessionUser } from "@/lib/session";

export async function AuthStatusButton() {
  const t = TRANSLATIONS.th;
  const user = await getSessionUser();
  const href = user ? "/profile" : "/auth/login";
  const label = user ? t.profile : t.signIn;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/14 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(4,19,55,0.16)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/18 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <UserRound className="h-5 w-5 text-white" />
      <span>{label}</span>
    </Link>
  );
}
