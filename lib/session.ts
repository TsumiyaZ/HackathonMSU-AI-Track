import { cookies } from "next/headers";
import { getUserById, type User } from "./users";

const SESSION_COOKIE = "ata_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 วัน

export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getUserById(userId);
}
