import type { AppAnnouncement } from './announcements';

type ApiAnnouncement = {
  _id: string;
  title: string;
  description: string;
  date: string;
  department?: string;
  priority: 'normal' | 'important';
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const resolveApiBase = () => {
  const raw = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
};

const toAppAnnouncement = (item: ApiAnnouncement): AppAnnouncement => ({
  id: item._id,
  title: item.title,
  description: item.description,
  date: item.date,
  department: item.department,
  priority: item.priority === 'important' ? 'important' : 'normal',
  published: Boolean(item.published),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt
});

export async function fetchPublishedAnnouncements(): Promise<AppAnnouncement[]> {
  const apiBase = resolveApiBase();
  if (!apiBase) return [];

  const res = await fetch(`${apiBase}/announcements?limit=50`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = (await res.json()) as { announcements?: ApiAnnouncement[] };
  const announcements = data.announcements || [];
  return announcements.map(toAppAnnouncement);
}

