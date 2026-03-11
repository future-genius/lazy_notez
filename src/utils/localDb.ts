import { publishActivity } from './activityBus';

export type AuthProvider = 'google' | 'manual';
export type UserRole = 'user' | 'admin';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  createdAt: string;
  username?: string;
  password?: string;
  department?: string;
  college?: string;
  avatar?: string;
  lastLoginAt?: string;
};

export type AppResource = {
  id: string;
  title: string;
  department: string;
  semester: string;
  subject: string;
  driveLink: string;
  uploadedBy: string;
  uploadedByEmail?: string;
  uploadedAt: string;
  downloadCount: number;
};

export type ActivityType = 'login' | 'register' | 'download' | 'upload' | 'user_update' | 'user_delete' | 'user_add';

export type AppActivity = {
  id: string;
  type: ActivityType;
  message: string;
  actorEmail?: string;
  targetId?: string;
  createdAt: string;
  meta?: {
    source?: AuthProvider;
  };
};

const USERS_KEY = 'lazyNotez.db.users.v1';
const RESOURCES_KEY = 'lazyNotez.db.resources.v1';
const ACTIVITY_KEY = 'lazyNotez.db.activity.v1';
const DOWNLOADS_KEY = 'lazyNotez.db.downloads.v1';

export const ADMIN_EMAIL = 'projectlazynotez@gmail.com';

const nowIso = () => new Date().toISOString();

export const createId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeRole(email: string, role?: string): UserRole {
  if ((email || '').toLowerCase().trim() === ADMIN_EMAIL) return 'admin';
  return role === 'admin' ? 'admin' : 'user';
}

export function getUsers(): AppUser[] {
  const users = parseJSON<AppUser[]>(localStorage.getItem(USERS_KEY), []);
  return users.map((user) => ({
    ...user,
    role: normalizeRole(user.email, user.role)
  }));
}

export function saveUsers(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getResources(): AppResource[] {
  return parseJSON<AppResource[]>(localStorage.getItem(RESOURCES_KEY), []);
}

export function saveResources(resources: AppResource[]) {
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
}

export function getActivities(): AppActivity[] {
  return parseJSON<AppActivity[]>(localStorage.getItem(ACTIVITY_KEY), []);
}

export function saveActivities(activities: AppActivity[]) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, 500)));
}

export function logActivity(type: ActivityType, message: string, actorEmail?: string, targetId?: string, meta?: AppActivity['meta']) {
  const created: AppActivity = {
      id: createId('activity'),
      type,
      message,
      actorEmail,
      targetId,
      createdAt: nowIso(),
      meta
    };

  const next = [created, ...getActivities()];
  saveActivities(next);
  publishActivity(created);
}

export function findUserByEmail(email: string) {
  const lower = (email || '').toLowerCase().trim();
  return getUsers().find((user) => user.email.toLowerCase() === lower);
}

export function findUserByIdentifier(identifier: string) {
  const needle = (identifier || '').toLowerCase().trim();
  return getUsers().find(
    (user) =>
      user.email.toLowerCase() === needle ||
      (user.username || '').toLowerCase() === needle
  );
}

export function upsertUser(partial: Partial<AppUser> & { email: string; name: string; provider: AuthProvider }) {
  const users = getUsers();
  const email = partial.email.toLowerCase().trim();
  const existingIndex = users.findIndex((user) => user.email.toLowerCase() === email);
  const createdAt = existingIndex >= 0 ? users[existingIndex].createdAt : nowIso();
  const nextUser: AppUser = {
    id: partial.id || (existingIndex >= 0 ? users[existingIndex].id : createId('user')),
    name: partial.name,
    email,
    role: normalizeRole(email, partial.role || (existingIndex >= 0 ? users[existingIndex].role : 'user')),
    provider: partial.provider,
    createdAt,
    username: partial.username || (existingIndex >= 0 ? users[existingIndex].username : undefined),
    password: partial.password || (existingIndex >= 0 ? users[existingIndex].password : undefined),
    department: partial.department || (existingIndex >= 0 ? users[existingIndex].department : undefined),
    college: partial.college || (existingIndex >= 0 ? users[existingIndex].college : undefined),
    avatar: partial.avatar || (existingIndex >= 0 ? users[existingIndex].avatar : undefined),
    lastLoginAt: partial.lastLoginAt || (existingIndex >= 0 ? users[existingIndex].lastLoginAt : undefined)
  };

  if (existingIndex >= 0) {
    users[existingIndex] = nextUser;
  } else {
    users.push(nextUser);
    logActivity('register', `New user registered: ${nextUser.name}`, nextUser.email, nextUser.id, { source: nextUser.provider });
  }
  saveUsers(users);
  return nextUser;
}

export function createManualUser(input: {
  name: string;
  email: string;
  username?: string;
  password: string;
  department?: string;
  college?: string;
}) {
  const existing = findUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already exists');
  }

  if (input.username) {
    const usernameTaken = getUsers().some((user) => (user.username || '').toLowerCase() === input.username.toLowerCase());
    if (usernameTaken) throw new Error('Username already exists');
  }

  return upsertUser({
    name: input.name.trim(),
    email: input.email.trim(),
    username: input.username?.trim(),
    password: input.password,
    provider: 'manual',
    role: 'user',
    department: input.department,
    college: input.college
  });
}

export function loginManualUser(identifier: string, password: string) {
  const user = findUserByIdentifier(identifier);
  if (!user || user.provider !== 'manual') {
    throw new Error('Account not found. Please register first.');
  }
  if (user.password !== password) {
    throw new Error('Invalid password');
  }

  const updated = upsertUser({
    ...user,
    lastLoginAt: nowIso(),
    provider: 'manual'
  });
  logActivity('login', `${updated.name} logged in`, updated.email, updated.id, { source: 'manual' });
  return updated;
}

export function upsertGoogleUser(input: { id?: string; email: string; name: string; username?: string; picture?: string }) {
  const updated = upsertUser({
    id: input.id,
    email: input.email,
    name: input.name,
    username: input.username,
    provider: 'google',
    avatar: input.picture,
    lastLoginAt: nowIso()
  });
  logActivity('login', `${updated.name} logged in with Google`, updated.email, updated.id, { source: 'google' });
  return updated;
}

export function getRecentActivities(limit = 20) {
  return getActivities().slice(0, limit);
}

export function createResource(input: {
  title: string;
  department: string;
  semester: string;
  subject: string;
  driveLink: string;
  uploadedBy: string;
  uploadedByEmail?: string;
}) {
  const resources = getResources();
  const next: AppResource = {
    id: createId('resource'),
    title: input.title.trim(),
    department: input.department.trim(),
    semester: input.semester.trim(),
    subject: input.subject.trim(),
    driveLink: input.driveLink.trim(),
    uploadedBy: input.uploadedBy.trim(),
    uploadedByEmail: input.uploadedByEmail,
    uploadedAt: nowIso(),
    downloadCount: 0
  };
  resources.unshift(next);
  saveResources(resources);
  logActivity('upload', `New resource uploaded: ${next.title}`, input.uploadedByEmail, next.id);
  return next;
}

export function deleteResource(resourceId: string, actorEmail?: string) {
  const resources = getResources();
  const target = resources.find((item) => item.id === resourceId);
  const filtered = resources.filter((item) => item.id !== resourceId);
  saveResources(filtered);
  if (target) {
    logActivity('user_update', `Resource deleted: ${target.title}`, actorEmail, target.id);
  }
}

export function updateUserRole(userId: string, role: UserRole, actorEmail?: string) {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) return;
  if (users[index].email.toLowerCase() === ADMIN_EMAIL) {
    users[index].role = 'admin';
  } else {
    users[index].role = role;
  }
  saveUsers(users);
  logActivity('user_update', `Role updated for ${users[index].name} to ${users[index].role}`, actorEmail, users[index].id);
}

export function updateUser(userId: string, updates: Partial<AppUser>, actorEmail?: string) {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) return null;

  const merged: AppUser = {
    ...users[index],
    ...updates,
    email: (updates.email || users[index].email).toLowerCase(),
    role: normalizeRole(updates.email || users[index].email, updates.role || users[index].role)
  };

  if (merged.email === ADMIN_EMAIL) merged.role = 'admin';
  users[index] = merged;
  saveUsers(users);
  logActivity('user_update', `User updated: ${merged.name}`, actorEmail, merged.id);
  return merged;
}

export function addUserByAdmin(input: { name: string; email: string; provider: AuthProvider; role: UserRole; password?: string }, actorEmail?: string) {
  const user = createManualUser({
    name: input.name,
    email: input.email,
    password: input.password || createId('pwd'),
    username: input.email.split('@')[0]
  });
  if (input.provider === 'google') {
    user.provider = 'google';
  }
  user.role = normalizeRole(user.email, input.role);
  const users = getUsers().map((entry) => (entry.id === user.id ? user : entry));
  saveUsers(users);
  logActivity('user_add', `Admin added user: ${user.name}`, actorEmail, user.id);
  return user;
}

export function deleteUser(userId: string, actorEmail?: string) {
  const users = getUsers();
  const target = users.find((item) => item.id === userId);
  if (!target) return;
  if (target.email.toLowerCase() === ADMIN_EMAIL) {
    throw new Error('Primary admin cannot be deleted');
  }

  saveUsers(users.filter((item) => item.id !== userId));
  logActivity('user_delete', `User deleted: ${target.name}`, actorEmail, target.id);
}

export function incrementDownload(resourceId: string, userEmail?: string) {
  const resources = getResources();
  const index = resources.findIndex((item) => item.id === resourceId);
  if (index < 0) return;
  resources[index].downloadCount += 1;
  saveResources(resources);

  const downloads = parseJSON<Record<string, number>>(localStorage.getItem(DOWNLOADS_KEY), {});
  if (userEmail) {
    downloads[userEmail] = (downloads[userEmail] || 0) + 1;
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
  }

  logActivity('download', `Resource downloaded: ${resources[index].title}`, userEmail, resourceId);
}

export function getMyDownloadCount(userEmail?: string) {
  if (!userEmail) return 0;
  const downloads = parseJSON<Record<string, number>>(localStorage.getItem(DOWNLOADS_KEY), {});
  return downloads[userEmail] || 0;
}

export function getStats() {
  const users = getUsers();
  const resources = getResources();
  const recentUploads = resources.filter((item) => {
    const age = Date.now() - new Date(item.uploadedAt).getTime();
    return age <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const activeUsers = users.filter((user) => {
    if (!user.lastLoginAt) return false;
    const age = Date.now() - new Date(user.lastLoginAt).getTime();
    return age <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    totalUsers: users.length,
    totalResources: resources.length,
    activeUsers,
    recentUploads
  };
}

export function seedResourcesIfEmpty() {
  if (getResources().length > 0) return;

  const sample: AppResource[] = [
    {
      id: createId('resource'),
      title: 'Data Structures - Unit 1 Notes',
      department: 'Computer Science and Engineering',
      semester: 'III',
      subject: 'Data Structures',
      driveLink: 'https://drive.google.com/',
      uploadedBy: 'Lazy Notez Team',
      uploadedByEmail: ADMIN_EMAIL,
      uploadedAt: nowIso(),
      downloadCount: 18
    },
    {
      id: createId('resource'),
      title: 'Signals and Systems Formula Sheet',
      department: 'Electronics and Communication Engineering',
      semester: 'IV',
      subject: 'Signals and Systems',
      driveLink: 'https://drive.google.com/',
      uploadedBy: 'Lazy Notez Team',
      uploadedByEmail: ADMIN_EMAIL,
      uploadedAt: nowIso(),
      downloadCount: 11
    }
  ];

  saveResources(sample);
}
