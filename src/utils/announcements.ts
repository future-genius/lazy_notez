export type AnnouncementPriority = 'normal' | 'important';

export type AppAnnouncement = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  department?: string;
  priority: AnnouncementPriority;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const ANNOUNCEMENTS_KEY = 'lazyNotez.db.announcements.v1';

const nowIso = () => new Date().toISOString();

const createId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getAnnouncements(): AppAnnouncement[] {
  return parseJSON<AppAnnouncement[]>(localStorage.getItem(ANNOUNCEMENTS_KEY), []).map((item) => ({
    ...item,
    priority: item.priority === 'important' ? 'important' : 'normal',
    published: Boolean(item.published)
  }));
}

export function saveAnnouncements(next: AppAnnouncement[]) {
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(next.slice(0, 500)));
}

export function getPublishedAnnouncements(input?: { department?: string }) {
  const department = (input?.department || '').trim();
  const published = getAnnouncements().filter((item) => item.published);
  const scoped = department ? published.filter((item) => !item.department || item.department === department) : published;
  return [...scoped].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function createAnnouncement(input: {
  title: string;
  description: string;
  date?: string;
  department?: string;
  priority?: AnnouncementPriority;
  published?: boolean;
}) {
  const createdAt = nowIso();
  const next: AppAnnouncement = {
    id: createId('announcement'),
    title: input.title.trim(),
    description: input.description.trim(),
    date: input.date || createdAt,
    department: input.department?.trim() || undefined,
    priority: input.priority === 'important' ? 'important' : 'normal',
    published: Boolean(input.published),
    createdAt,
    updatedAt: createdAt
  };

  const announcements = getAnnouncements();
  saveAnnouncements([next, ...announcements]);
  return next;
}

export function updateAnnouncement(id: string, updates: Partial<Omit<AppAnnouncement, 'id' | 'createdAt'>>) {
  const announcements = getAnnouncements();
  const index = announcements.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const updated: AppAnnouncement = {
    ...announcements[index],
    ...updates,
    title: (updates.title ?? announcements[index].title).trim(),
    description: (updates.description ?? announcements[index].description).trim(),
    department: (updates.department ?? announcements[index].department)?.trim() || undefined,
    priority: updates.priority === 'important' ? 'important' : updates.priority === 'normal' ? 'normal' : announcements[index].priority,
    published: typeof updates.published === 'boolean' ? updates.published : announcements[index].published,
    date: updates.date ?? announcements[index].date,
    updatedAt: nowIso()
  };

  announcements[index] = updated;
  saveAnnouncements(announcements);
  return updated;
}

export function deleteAnnouncement(id: string) {
  const announcements = getAnnouncements();
  saveAnnouncements(announcements.filter((item) => item.id !== id));
}

export function setAnnouncementPublished(id: string, published: boolean) {
  return updateAnnouncement(id, { published });
}

export function seedAnnouncementsIfEmpty() {
  if (getAnnouncements().length > 0) return;

  createAnnouncement({
    title: 'Welcome to Lazy Notez',
    description: 'Check out Notes, Question Papers and Study Materials from your dashboard.',
    priority: 'normal',
    published: true
  });

  createAnnouncement({
    title: 'New uploads every week',
    description: 'Admins validate and publish new resources regularly. Use filters for faster search.',
    priority: 'normal',
    published: true
  });

  createAnnouncement({
    title: 'Important: Keep your Drive links public',
    description: 'When uploading resources, make sure the Google Drive link has view/download access enabled.',
    priority: 'important',
    published: true
  });
}

