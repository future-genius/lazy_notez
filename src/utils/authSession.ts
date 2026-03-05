const API_BASE = (window as any).__API_BASE__ || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

export function getStoredCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredCurrentUser(user: any) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  if (user?.accessToken) {
    sessionStorage.setItem('lazyNotezAccessToken', user.accessToken);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('lazyNotezAdmin');
  sessionStorage.removeItem('lazyNotezAccessToken');
}

export function getAccessToken() {
  const user = getStoredCurrentUser();
  return user?.accessToken || sessionStorage.getItem('lazyNotezAccessToken') || '';
}

export async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) return '';
  const data = await res.json();
  if (!data?.accessToken) return '';

  const current = getStoredCurrentUser();
  if (current) {
    setStoredCurrentUser({ ...current, accessToken: data.accessToken });
  } else {
    sessionStorage.setItem('lazyNotezAccessToken', data.accessToken);
  }
  return data.accessToken;
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

  return fetch(input, withAuth(token));
}
