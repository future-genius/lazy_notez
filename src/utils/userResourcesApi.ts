import { getApiBase } from './apiBase';

export async function submitUserResource(
  input: {
    title: string;
    department: string;
    semester: string;
    subject: string;
    driveLink: string;
  },
  actor: { userId: string; name: string; email: string }
) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources/submit`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      uploadedByName: actor.name,
      uploadedByEmail: actor.email,
      uploadedByUserId: actor.userId,
      category: 'notes'
    })
  });

  if (!res.ok) throw new Error('Failed to submit note');
  return res.json();
}

export async function fetchMyResources(actor: { userId: string; email: string }) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const q = new URLSearchParams();
  q.set('uploadedByUserId', actor.userId);
  q.set('uploadedByEmail', actor.email);

  const res = await fetch(`${apiBase}/resources/mine?${q.toString()}`, {
    credentials: 'include',
    cache: 'no-store'
  });

  if (!res.ok) throw new Error('Failed to load my notes');
  return res.json() as Promise<{ resources: any[]; total: number }>;
}

export async function updateUserSubmission(
  id: string,
  updates: Partial<{
    title: string;
    department: string;
    semester: string;
    subject: string;
    driveLink: string;
  }>,
  actor: { userId: string; email: string }
) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources/submissions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, uploadedByUserId: actor.userId, uploadedByEmail: actor.email })
  });

  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteUserSubmission(id: string, actor: { userId: string; email: string }) {
  const apiBase = getApiBase();
  if (!apiBase) throw new Error('API base not configured');

  const res = await fetch(`${apiBase}/resources/submissions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadedByUserId: actor.userId, uploadedByEmail: actor.email })
  });

  if (!res.ok) throw new Error('Failed to delete note');
}
