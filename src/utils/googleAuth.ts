const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '702960286853-skkvdqed3ajop543nkjih3ubd345ct50.apps.googleusercontent.com';

const API_BASE = (window as any).__API_BASE__ || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

export function storeUser(user: any) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  if (user?.accessToken) {
    sessionStorage.setItem('lazyNotezAccessToken', user.accessToken);
  }
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    localStorage.setItem('lazyNotezAdmin', 'true');
  } else {
    localStorage.removeItem('lazyNotezAdmin');
  }
  return user;
}

export function getStoredUser() {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('lazyNotezAdmin');
  sessionStorage.removeItem('lazyNotezAccessToken');
  location.replace('/');
}

export async function handleGoogleCredentialResponse(
  response: any,
  onSuccess: (user: any) => void,
  onError?: (error: any) => void
) {
  try {
    const token = response?.credential;
    if (!token) throw new Error('Google token missing');

    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || 'Google sign-in failed');
    }

    const data = await res.json();
    const currentUser = { ...data.user, accessToken: data.accessToken };
    const stored = storeUser(currentUser);
    onSuccess(stored);
  } catch (error) {
    console.error('Google login failed', error);
    onError?.(error);
  }
}

export function initializeGoogleAuth(
  onSuccess: (user: any) => void,
  onError?: (error: any) => void
) {
  if (!(window as any).google) return;
  (window as any).google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: any) => handleGoogleCredentialResponse(response, onSuccess, onError),
  });
}

export function renderGoogleSignInButton(
  elementId: string,
  theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline',
  size: 'large' | 'medium' | 'small' = 'large'
) {
  if (!(window as any).google) return;
  const element = document.getElementById(elementId);
  if (!element) return;
  (window as any).google.accounts.id.renderButton(element, {
    theme,
    size,
    type: 'standard',
    text: 'signin_with',
  });
}

export function isUserLoggedIn(): boolean {
  return !!getStoredUser();
}
