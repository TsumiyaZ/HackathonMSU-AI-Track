import { promises as fs } from "node:fs";
import path from "node:path";

export interface Notification {
  notif_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  timestamp: string;
  action_link: string;
}

const NOTIFICATIONS_PATH = path.join(process.cwd(), "data", "common", "notifications.json");

let _notifications: Notification[] | null = null;

export async function loadNotifications(): Promise<Notification[]> {
  if (!_notifications) {
    const raw = await fs.readFile(NOTIFICATIONS_PATH, "utf8");
    _notifications = JSON.parse(raw) as Notification[];
  }
  return _notifications;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const all = await loadNotifications();
  return all
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getUnreadCount(userId: string): Promise<number> {
  const all = await loadNotifications();
  return all.filter((n) => n.user_id === userId && !n.is_read).length;
}
