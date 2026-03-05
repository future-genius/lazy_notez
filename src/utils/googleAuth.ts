// Google OAuth configuration and utilities
const GOOGLE_CLIENT_ID = "702960286853-skkvdqed3ajop543nkjih3ubd345ct50.apps.googleusercontent.com";

/**
 * Parses JWT token to extract user information
 */
export function parseJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Stores user data in localStorage
 */
export function storeUser(user: any) {
  const userData = {
    id: user.sub,
    name: user.name,
    email: user.email,
    picture: user.picture,
    token: user.aud,
    loginMethod: 'google',
  };
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('lazyNotezUser', JSON.stringify(userData));
  return userData;
}

/**
 * Retrieves user from localStorage
 */
export function getStoredUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

/**
 * Logout function - clears user data
 */
export function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('lazyNotezUser');
  location.reload();
}

/**
 * Handle Google credential response
 */
export function handleGoogleCredentialResponse(
  response: any,
  onSuccess: (user: any) => void
) {
  try {
    const token = response.credential;
    console.log('Google ID Token received:', token ? 'valid' : 'invalid');

    // Decode JWT
    const payload = parseJWT(token);
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    console.log('User Info from Google:', payload);

    // Store user data
    const user = storeUser(payload);

    // Call success callback
    if (onSuccess) {
      onSuccess(user);
    }
  } catch (error) {
    console.error('Error handling Google credential response:', error);
  }
}

/**
 * Initialize Google OAuth
 */
export function initializeGoogleAuth(
  onSuccess: (user: any) => void,
  onError?: (error: any) => void
) {
  if (!(window as any).google) {
    console.error('Google Identity Services script not loaded');
    return;
  }

  try {
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) =>
        handleGoogleCredentialResponse(response, onSuccess),
    });

    console.log('Google Auth initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Auth:', error);
    if (onError) {
      onError(error);
    }
  }
}

/**
 * Render Google Sign-In button
 */
export function renderGoogleSignInButton(
  elementId: string,
  theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline',
  size: 'large' | 'medium' | 'small' = 'large'
) {
  if (!(window as any).google) {
    console.error('Google Identity Services script not loaded');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    (window as any).google.accounts.id.renderButton(element, {
      theme,
      size,
      type: 'standard',
      text: 'signin_with',
    });
    console.log('Google Sign-In button rendered successfully');
  } catch (error) {
    console.error('Error rendering Google Sign-In button:', error);
  }
}

/**
 * Check if user is already logged in
 */
export function isUserLoggedIn(): boolean {
  const user = getStoredUser();
  return !!user && user.loginMethod === 'google';
}
