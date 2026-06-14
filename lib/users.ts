import prisma from "@/lib/prisma";

export type UserRole = "MEMBER" | "VIP" | "ADMIN";

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  role: UserRole;
}

export async function loadUsers(): Promise<User[]> {
  const dbUsers = await prisma.user.findMany();
  return dbUsers.map((u) => ({
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    loyalty_points: u.loyalty_points,
    role: u.role as UserRole,
  }));
}

// normalize เบอร์โทรเอาเฉพาะตัวเลข เพื่อ compare แบบยืดหยุ่น
// "081-111-1111" === "0811111111" === "081 111 1111"
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const u = await prisma.user.findFirst({
    where: {
      email: {
        equals: email.trim(),
        mode: "insensitive",
      },
    },
  });
  if (!u) return null;
  return {
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    loyalty_points: u.loyalty_points,
    role: u.role as UserRole,
  };
}

export async function getUserById(userId: string): Promise<User | null> {
  const u = await prisma.user.findUnique({
    where: { user_id: userId },
  });
  if (!u) return null;
  return {
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    loyalty_points: u.loyalty_points,
    role: u.role as UserRole,
  };
}

// verify ด้วย email + phone (phone ใช้แทน password)
export async function verifyCredentials(
  email: string,
  phone: string,
): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (normalizePhone(user.phone) !== normalizePhone(phone)) return null;
  return user;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
}

export interface CreateUserResult {
  ok: boolean;
  user?: User;
  error?: string;
}

export async function createUser(
  input: CreateUserInput,
): Promise<CreateUserResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!name) return { ok: false, error: "กรุณากรอกชื่อ" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  if (normalizePhone(phone).length < 9)
    return { ok: false, error: "กรุณากรอกเบอร์โทร (ขั้นต่ำ 9 หลัก)" };

  const existing = await findUserByEmail(email);
  if (existing)
    return { ok: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };

  // gen user_id ถัดจากเลขสูงสุดในรายการเดิม
  const users = await prisma.user.findMany();
  const maxNum = users.reduce((m, u) => {
    const n = parseInt(u.user_id.replace(/^u/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  const userId = `u${String(maxNum + 1).padStart(3, "0")}`;

  const u = await prisma.user.create({
    data: {
      user_id: userId,
      name,
      email,
      phone,
      loyalty_points: 0,
      role: "MEMBER",
    },
  });

  return {
    ok: true,
    user: {
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      loyalty_points: u.loyalty_points,
      role: u.role as UserRole,
    },
  };
}
