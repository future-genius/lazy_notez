const API_BASE = (window as any).__API_BASE__ || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

const USER_STORAGE_KEY = 'currentUser';
const LEGACY_USER_STORAGE_KEY = 'lazyNotezUser';
const ADMIN_STORAGE_KEY = 'lazyNotezAdmin';
const ACCESS_TOKEN_KEY = 'lazyNotezAccessToken';

export type SessionUser = {
  id?: string;
  _id?: string;
  user_id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  accessToken?: string;
};

const isAdminRole = (role?: string) => role === 'admin' || role === 'super_admin';

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
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(LEGACY_USER_STORAGE_KEY, JSON.stringify(user));
  if (user?.accessToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, user.accessToken);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (isAdminRole(user?.role)) {
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
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) return '';

  const data = await res.json().catch(() => ({}));
  if (!data?.accessToken) return '';

  const current = getStoredCurrentUser();
  if (current) {
    setStoredCurrentUser({ ...current, accessToken: data.accessToken });
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  }
  return data.accessToken;
}

export async function fetchCurrentUser(accessToken?: string) {
  const token = accessToken || getAccessToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include'
  });
  if (!res.ok) return null;

  const user = await res.json().catch(() => null);
  if (!user) return null;

  const normalized: SessionUser = {
    id: user._id || user.id,
    user_id: user.userId || user.user_id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken: token
  };

  setStoredCurrentUser(normalized);
  return normalized;
}

export async function initializeAuthSession() {
  const stored = getStoredCurrentUser();
  if (stored?.accessToken) {
    const me = await fetchCurrentUser(stored.accessToken);
    if (me) return me;
  }

  const refreshed = await refreshAccessToken().catch(() => '');
  if (!refreshed) return stored || null;
  return fetchCurrentUser(refreshed);
}

export async function loginWithPassword(identifier: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password })
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.message || 'Invalid credentials');
  }

  const user: SessionUser = {
    ...payload.user,
    accessToken: payload.accessToken
  };
  setStoredCurrentUser(user);
  return user;
}

export async function logoutSession() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch {}
  clearStoredAuth();
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let token = getAccessToken();
  const withAuth = (accessToken: string) => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  });

  let res = await fetch(input, withAuth(token));
  if (res.status !== 401) return res;

  token = await refreshAccessToken();
  if (!token) return res;

  const retried = await fetch(input, withAuth(token));
  if (retried.status === 401) {
    clearStoredAuth();
  }
  return retried;
}
