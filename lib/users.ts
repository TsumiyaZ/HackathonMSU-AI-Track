import { promises as fs } from "node:fs";
import path from "node:path";

export type UserRole = "MEMBER" | "VIP" | "ADMIN";

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  role: UserRole;
}

const USERS_PATH = path.join(process.cwd(), "data", "user", "users.json");

// อ่านสด ๆ ทุกครั้ง เพราะ register จะเขียนทับไฟล์
export async function loadUsers(): Promise<User[]> {
  const raw = await fs.readFile(USERS_PATH, "utf8");
  return JSON.parse(raw) as User[];
}

async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

// normalize เบอร์โทรเอาเฉพาะตัวเลข เพื่อ compare แบบยืดหยุ่น
// "081-111-1111" === "0811111111" === "081 111 1111"
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await loadUsers();
  const target = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === target) ?? null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find((u) => u.user_id === userId) ?? null;
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

  const users = await loadUsers();
  if (users.some((u) => u.email.toLowerCase() === email))
    return { ok: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };

  // gen user_id ถัดจากเลขสูงสุดในรายการเดิม
  const maxNum = users.reduce((m, u) => {
    const n = parseInt(u.user_id.replace(/^u/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  const userId = `u${String(maxNum + 1).padStart(3, "0")}`;

  const user: User = {
    user_id: userId,
    name,
    email,
    phone,
    loyalty_points: 0,
    role: "MEMBER",
  };

  await saveUsers([...users, user]);
  return { ok: true, user };
}
