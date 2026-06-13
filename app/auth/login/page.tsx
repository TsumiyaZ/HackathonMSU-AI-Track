import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoAccounts } from "@/components/auth/DemoAccounts";
import { getSessionUserId } from "@/lib/session";
import { loadUsers } from "@/lib/users";
import { LoginAlert } from "./LoginAlert";

type SearchParams = Promise<{ redirect?: string }>;

export default async function LoginPage(props: { searchParams?: SearchParams }) {
  if (await getSessionUserId()) redirect("/");

  const sp = await props.searchParams;
  const redirectTo = sp?.redirect || "/";
  const users = await loadUsers();

  return (
    <div className="min-h-screen bg-background text-on-surface grid-bg flex items-start justify-center px-6 py-8 md:py-12 relative overflow-x-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="absolute top-6 left-6 md:left-12 px-5 py-2.5 rounded-xl glass-panel-strong font-label text-sm hover:text-primary transition-colors flex items-center gap-2 border border-white/10"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        กลับหน้าต้อนรับ
      </Link>

      {redirectTo !== "/" && <LoginAlert />}

      <div className="flex flex-col items-center gap-8 mt-16 w-full max-w-md">
        <AuthForm mode="login" redirectTo={redirectTo} />
        <DemoAccounts users={users} redirectTo={redirectTo} />
      </div>
    </div>
  );
}
