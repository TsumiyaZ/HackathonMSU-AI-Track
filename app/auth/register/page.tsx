import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSessionUserId } from "@/lib/session";

export default async function RegisterPage() {
  if (await getSessionUserId()) redirect("/");

  return (
    <div className="min-h-screen bg-background text-on-surface grid-bg flex items-center justify-center px-6 py-16 relative">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <Link
          href="/"
          className="absolute top-6 left-6 md:left-12 px-5 py-2.5 rounded-xl outline-soft font-label text-sm transition-colors flex items-center gap-2 dark:glass-panel-strong dark:border-white/10"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          กลับหน้าต้อนรับ
        </Link>

      <AuthForm mode="register" />
    </div>
  );
}
