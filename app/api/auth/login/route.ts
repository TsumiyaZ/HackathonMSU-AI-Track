import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/users";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "คำขอไม่ถูกต้อง" },
      { status: 400 },
    );
  }
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (!email || !phone) {
    return NextResponse.json(
      { ok: false, error: "กรุณากรอกอีเมลและเบอร์โทร" },
      { status: 400 },
    );
  }
  const user = await verifyCredentials(email, phone);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "อีเมลหรือเบอร์โทรไม่ถูกต้อง" },
      { status: 401 },
    );
  }
  await setSession(user.user_id);
  return NextResponse.json({ ok: true, user });
}
