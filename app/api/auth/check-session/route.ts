import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/lib/users";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ authenticated: false, userId: null, user: null });
  }
  const user = await getUserById(userId);
  return NextResponse.json({ authenticated: true, userId, user });
}
