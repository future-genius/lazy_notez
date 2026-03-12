import type { AppAnnouncement } from './announcements';
import { getAdminPanelHeaders, getApiBase } from './apiBase';

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
  const apiBase = getApiBase();
  if (!apiBase) return [];

  const res = await fetch(`${apiBase}/announcements?limit=50`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch announcements');
  const data = (await res.json()) as { announcements?: ApiAnnouncement[] };
  const announcements = data.announcements || [];
  return announcements.map(toAppAnnouncement);
}

export async function fetchAdminAnnouncements(): Promise<AppAnnouncement[]> {
  const apiBase = getApiBase();
  if (!apiBase) return [];

  const res = await fetch(`${apiBase}/announcements/admin?limit=200`, {
    credentials: 'include',
    headers: { ...getAdminPanelHeaders() }
  });

  if (!res.ok) throw new Error('Failed to fetch admin announcements');
  const data = (await res.json()) as { announcements?: ApiAnnouncement[] };
  return (data.announcements || []).map(toAppAnnouncement);
}

export async function createAdminAnnouncement(input: {
  title: string;
  description: string;
  date: string;
  department?: string;
  priority: 'normal' | 'important';
  published: boolean;
}) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/announcements`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAdminPanelHeaders() },
    body: JSON.stringify(input)
  });

  if (!res.ok) throw new Error('Failed to create announcement');
  return toAppAnnouncement((await res.json()) as ApiAnnouncement);
}

export async function updateAdminAnnouncement(id: string, updates: Partial<{
  title: string;
  description: string;
  date: string;
  department?: string;
  priority: 'normal' | 'important';
  published: boolean;
}>) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/announcements/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAdminPanelHeaders() },
    body: JSON.stringify(updates)
  });

  if (!res.ok) throw new Error('Failed to update announcement');
  return toAppAnnouncement((await res.json()) as ApiAnnouncement);
}

export async function setAdminAnnouncementPublished(id: string, published: boolean) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/announcements/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAdminPanelHeaders() },
    body: JSON.stringify({ published })
  });

  if (!res.ok) throw new Error('Failed to update publish status');
  return toAppAnnouncement((await res.json()) as ApiAnnouncement);
}

export async function deleteAdminAnnouncement(id: string) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { ...getAdminPanelHeaders() }
  });

  if (!res.ok) throw new Error('Failed to delete announcement');
}
