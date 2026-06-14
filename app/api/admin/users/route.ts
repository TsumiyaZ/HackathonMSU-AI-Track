import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { loadUsers, updateUserRole } from '@/lib/users';
import type { UserRole } from '@/lib/users';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const users = await loadUsers();
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { user_id, role } = await req.json();
  const validRoles: UserRole[] = ['MEMBER', 'VIP', 'ADMIN'];
  if (!validRoles.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  const updated = await updateUserRole(user_id, role);
  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
