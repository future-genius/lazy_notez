import {
  AppUser,
  loginManualUser,
  normalizeRole,
  upsertUser
} from './localDb';

const USER_STORAGE_KEY = 'currentUser';
const LEGACY_USER_STORAGE_KEY = 'lazyNotezUser';
const ADMIN_STORAGE_KEY = 'lazyNotezAdmin';
const ACCESS_TOKEN_KEY = 'lazyNotezAccessToken';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  provider: 'google' | 'manual';
  createdAt: string;
  username?: string;
  avatar?: string;
  accessToken?: string;
  lastLoginAt?: string;
};

const isAdminRole = (role?: string) => role === 'admin';

function toSessionUser(user: AppUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.email, user.role),
    provider: user.provider,
    createdAt: user.createdAt,
    username: user.username,
    avatar: user.avatar,
    lastLoginAt: user.lastLoginAt
  };
}

export function getStoredCurrentUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem(LEGACY_USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredCurrentUser(user: SessionUser) {
  const normalized: SessionUser = {
    ...user,
    email: user.email.toLowerCase(),
    role: normalizeRole(user.email, user.role)
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
  localStorage.setItem(LEGACY_USER_STORAGE_KEY, JSON.stringify(normalized));

  // Keep central users database synchronized for every login source.
  upsertUser({
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    provider: normalized.provider,
    role: normalized.role,
    username: normalized.username,
    avatar: normalized.avatar,
    lastLoginAt: normalized.lastLoginAt || new Date().toISOString()
  });

  if (normalized?.accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, normalized.accessToken);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (isAdminRole(normalized?.role)) {
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken() {
  const user = getStoredCurrentUser();
  return user?.accessToken || sessionStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export async function refreshAccessToken() {
  return '';
}

export async function fetchCurrentUser() {
  return getStoredCurrentUser();
}

export async function initializeAuthSession() {
  return getStoredCurrentUser();
}

export async function loginWithPassword(identifier: string, password: string) {
  const loggedIn = loginManualUser(identifier.trim(), password);
  const session = toSessionUser(loggedIn);
  setStoredCurrentUser(session);
  return session;
}

export async function logoutSession() {
  clearStoredAuth();
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, init);
}
