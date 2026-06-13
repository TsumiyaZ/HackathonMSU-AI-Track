import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSessionUserId } from "@/lib/session";

export default async function RegisterPage() {
  if (await getSessionUserId()) redirect("/profile");

  return (
    <div className="min-h-screen bg-background text-on-surface grid-bg flex items-center justify-center px-6 py-16">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <AuthForm mode="register" />
    </div>
  );
}
