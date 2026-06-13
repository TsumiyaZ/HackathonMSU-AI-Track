export async function requireAuth(redirectTo?: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/check-session");
    const data = await res.json();
    if (data.authenticated) return true;

    const dest = redirectTo || window.location.pathname;
    window.location.href = `/auth/login?redirect=${encodeURIComponent(dest)}`;
    return false;
  } catch {
    window.location.href = "/auth/login";
    return false;
  }
}
