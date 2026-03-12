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
  uploadedByEmail?: string;
  uploadedByUserId?: string;
  approved?: boolean;
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
  uploadedByEmail: r.uploadedByEmail,
  uploadedByUserId: r.uploadedByUserId,
  uploadedAt: r.uploadDate || r.createdAt,
  downloadCount: r.downloadCount || 0,
  approved: typeof r.approved === 'boolean' ? r.approved : true
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

  const res = await fetch(`${apiBase}/resources?${q.toString()}`, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch resources');
  const data = (await res.json()) as { resources?: ApiResource[] };
  return (data.resources || []).map(toAppResource);
}

export async function fetchAdminResources(params?: { approved?: 'true' | 'false' | '' }) {
  const apiBase = getApiBase();
  if (!apiBase) return [];

  const q = new URLSearchParams();
  q.set('limit', '500');
  if (params?.approved) q.set('approved', params.approved);

  const res = await fetch(`${apiBase}/resources/admin?${q.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { ...getAdminPanelHeaders() }
  });

  if (!res.ok) throw new Error('Failed to fetch admin resources');
  const data = (await res.json()) as { resources?: ApiResource[] };
  return (data.resources || []).map(toAppResource);
}

export async function setAdminResourceApproved(id: string, approved: boolean) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...getAdminPanelHeaders() },
    body: JSON.stringify({ approved })
  });

  if (!res.ok) throw new Error('Failed to approve resource');
  return toAppResource((await res.json()) as ApiResource);
}

export async function createAdminResource(input: {
  title: string;
  category: 'notes' | 'question_paper' | 'study_material';
  department: string;
  semester: string;
  subject: string;
  googleDriveUrl: string;
  uploadedByName: string;
  uploadedByEmail?: string;
  uploadedByUserId?: string;
}) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
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
    cache: 'no-store',
    headers: { ...getAdminPanelHeaders() }
  });

  if (!res.ok) throw new Error('Failed to delete resource');
}

export async function updateAdminResource(
  id: string,
  updates: Partial<{
    title: string;
    category: 'notes' | 'question_paper' | 'study_material';
    department: string;
    semester: string;
    subject: string;
    googleDriveUrl: string;
    uploadedByName: string;
    uploadedByEmail?: string;
    uploadedByUserId?: string;
  }>
) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...getAdminPanelHeaders() },
    body: JSON.stringify(updates)
  });

  if (!res.ok) throw new Error('Failed to update resource');
  return toAppResource((await res.json()) as ApiResource);
}

export async function trackDownload(resourceId: string) {
  const apiBase = getApiBase();
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/resources/${encodeURIComponent(resourceId)}/download`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return (await res.json()) as { downloadCount: number; googleDriveUrl: string };
}
