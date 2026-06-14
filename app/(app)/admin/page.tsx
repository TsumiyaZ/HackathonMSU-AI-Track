import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/home');
  }

  // Pass user to AdminDashboard
  return <AdminDashboard initialUser={user} />;
}
