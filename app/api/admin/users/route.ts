import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getSessionUser } from '@/lib/session';
import type { UserRole } from '@/lib/users';

const USERS_PATH = path.join(process.cwd(), 'data', 'user', 'users.json');

async function readUsers() {
  const raw = await fs.readFile(USERS_PATH, 'utf8');
  return JSON.parse(raw);
}

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const users = await readUsers();
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { user_id, role } = await req.json();
  const validRoles: UserRole[] = ['MEMBER', 'VIP', 'ADMIN'];
  if (!validRoles.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  const users = await readUsers();
  const idx = users.findIndex((u: any) => u.user_id === user_id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  users[idx].role = role;
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
  return NextResponse.json({ success: true });
}
