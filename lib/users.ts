import { readJSON, writeJSON, DATA } from "./json-db";

export type UserRole = "MEMBER" | "VIP" | "ADMIN";

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  loyalty_points: number;
  role: UserRole;
}

// normalize เบอร์โทรเอาเฉพาะตัวเลข เพื่อ compare แบบยืดหยุ่น
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export async function loadUsers(): Promise<User[]> {
  return readJSON<User[]>(DATA.users);
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

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<User | null> {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.user_id === userId);
  if (idx === -1) return null;
  users[idx].role = role;
  await writeJSON(DATA.users, users);
  return users[idx];
}

export async function deleteUser(userId: string): Promise<boolean> {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.user_id === userId);
  if (idx === -1) return false;
  users.splice(idx, 1);
  await writeJSON(DATA.users, users);
  return true;
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
  const existing = users.find((u) => u.email.toLowerCase() === email);
  if (existing) return { ok: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };

  const maxNum = users.reduce((m, u) => {
    const n = parseInt(u.user_id.replace(/^u/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  const userId = `u${String(maxNum + 1).padStart(3, "0")}`;

  const newUser: User = {
    user_id: userId,
    name,
    email,
    phone,
    loyalty_points: 0,
    role: "MEMBER",
  };

  users.push(newUser);
  await writeJSON(DATA.users, users);

  return { ok: true, user: newUser };
}
