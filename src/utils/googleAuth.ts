import { clearStoredAuth, getStoredCurrentUser, setStoredCurrentUser } from './authSession';
import { upsertGoogleUser } from './localDb';

const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '702960286853-skkvdqed3ajop543nkjih3ubd345ct50.apps.googleusercontent.com';
const NETLIFY_GOOGLE_AUTH_ENDPOINT = '/.netlify/functions/google-auth';
let googleScriptPromise: Promise<void> | null = null;

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function ensureGoogleScriptLoaded() {
  if ((window as any).google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')), { once: true });
      setTimeout(() => {
        if ((window as any).google?.accounts?.id) resolve();
      }, 300);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function storeUser(user: any) {
  setStoredCurrentUser(user);
  return user;
}

export function getStoredUser() {
  return getStoredCurrentUser();
}

export function logout() {
  clearStoredAuth();
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

    let googleUser = null;
    const res = await fetch(NETLIFY_GOOGLE_AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      googleUser = data?.user;
    }

    if (!googleUser) {
      const payload = decodeJwtPayload(token);
      if (!payload?.email) {
        throw new Error('Google sign-in failed. Please try again.');
      }
      googleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        username: payload.email?.split('@')?.[0],
        picture: payload.picture
      };
    }

    const synced = upsertGoogleUser({
      id: googleUser.id || googleUser.user_id,
      email: googleUser.email,
      name: googleUser.name || googleUser.username || googleUser.email,
      username: googleUser.username,
      picture: googleUser.picture
    });

    const stored = storeUser({
      id: synced.id,
      name: synced.name,
      email: synced.email,
      role: synced.role,
      provider: 'google',
      createdAt: synced.createdAt,
      username: synced.username,
      avatar: synced.avatar,
      lastLoginAt: synced.lastLoginAt
    });

    onSuccess(stored);
  } catch (error) {
    console.error('Google login failed', error);
    onError?.(error);
  }
}

export async function initializeGoogleAuth(
  onSuccess: (user: any) => void,
  onError?: (error: any) => void
) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
    }
    await ensureGoogleScriptLoaded();
    if (!(window as any).google?.accounts?.id) return false;
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => handleGoogleCredentialResponse(response, onSuccess, onError),
    });
    return true;
  } catch (error) {
    onError?.(error);
    return false;
  }
}

export async function renderGoogleSignInButton(
  elementId: string,
  theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline',
  size: 'large' | 'medium' | 'small' = 'large'
) {
  await ensureGoogleScriptLoaded();
  if (!(window as any).google?.accounts?.id) return false;
  const element = document.getElementById(elementId);
  if (!element) return false;
  element.innerHTML = '';
  (window as any).google.accounts.id.renderButton(element, {
    theme,
    size,
    type: 'standard',
    text: 'signin_with',
  });
  return true;
}

export function isUserLoggedIn(): boolean {
  return !!getStoredUser();
}
