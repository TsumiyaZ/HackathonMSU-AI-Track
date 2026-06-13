import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "คำขอไม่ถูกต้อง" },
      { status: 400 },
    );
  }
  const result = await createUser({
    name: body.name ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
  });
  if (!result.ok || !result.user) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "สมัครไม่สำเร็จ" },
      { status: 400 },
    );
  }
  await setSession(result.user.user_id);
  return NextResponse.json({ ok: true, user: result.user });
}
