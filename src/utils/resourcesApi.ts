import type { AppResource } from './localDb';
import { getAdminPanelHeaders, getApiBase } from './apiBase';

type ApiResource = {
  _id: string;
  title: string;
  category?: 'notes' | 'question_paper' | 'study_material';
  department: string;
  semester: string;
  subject: string;
  googleDriveUrl: string;
  uploadedByName: string;
  uploadDate: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
};

const toAppResource = (r: ApiResource): AppResource => ({
  id: r._id,
  title: r.title,
  category: r.category || 'study_material',
  department: r.department,
  semester: r.semester,
  subject: r.subject,
  driveLink: r.googleDriveUrl,
  uploadedBy: r.uploadedByName,
  uploadedByEmail: undefined,
  uploadedAt: r.uploadDate || r.createdAt,
  downloadCount: r.downloadCount || 0
});

export async function fetchResources(params?: {
  limit?: number;
  skip?: number;
  department?: string;
  semester?: string;
  subject?: string;
  search?: string;
  sortBy?: 'name' | 'date' | 'most_downloaded';
  category?: 'notes' | 'question_paper' | 'study_material' | '';
}) {
  const apiBase = getApiBase();
  if (!apiBase) return [];

  const q = new URLSearchParams();
  q.set('limit', String(params?.limit ?? 200));
  q.set('skip', String(params?.skip ?? 0));
  if (params?.department) q.set('department', params.department);
  if (params?.semester) q.set('semester', params.semester);
  if (params?.subject) q.set('subject', params.subject);
  if (params?.search) q.set('search', params.search);
  if (params?.category) q.set('category', params.category);

  // backend uses: recent/name/most_downloaded
  if (params?.sortBy === 'name') q.set('sortBy', 'name');
  else if (params?.sortBy === 'most_downloaded') q.set('sortBy', 'most_downloaded');
  else q.set('sortBy', 'recent');

  const res = await fetch(`${apiBase}/resources?${q.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch resources');
  const data = (await res.json()) as { resources?: ApiResource[] };
  return (data.resources || []).map(toAppResource);
}

export async function createAdminResource(input: {
  title: string;
  category: 'notes' | 'question_paper' | 'study_material';
  department: string;
  semester: string;
  subject: string;
  googleDriveUrl: string;
  uploadedByName: string;
}) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAdminPanelHeaders() },
    body: JSON.stringify(input)
  });

  if (!res.ok) throw new Error('Failed to create resource');
  return toAppResource((await res.json()) as ApiResource);
}

export async function deleteAdminResource(id: string) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { ...getAdminPanelHeaders() }
  });

  if (!res.ok) throw new Error('Failed to delete resource');
}

export async function trackDownload(resourceId: string) {
  const apiBase = getApiBase();
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/resources/${encodeURIComponent(resourceId)}/download`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) return null;
  return (await res.json()) as { downloadCount: number; googleDriveUrl: string };
}
