import React, { useEffect } from 'react';
import {
  initializeGoogleAuth,
  renderGoogleSignInButton,
} from '../utils/googleAuth';

type Props = {
  onLogin: (userData: any) => void;
  onError?: (error: any) => void;
};

export default function GoogleLoginButton({ onLogin, onError }: Props) {
  useEffect(() => {
    let mounted = true;
    let retryTimer: any = null;
    let attempts = 0;

    const setupGoogleButton = async () => {
      if (!mounted) return;
      const initialized = await initializeGoogleAuth(onLogin, onError);
      if (!initialized) return;

      const isSmallScreen = window.matchMedia('(max-width: 420px)').matches;
      const rendered = await renderGoogleSignInButton('google-login-button', 'outline', isSmallScreen ? 'medium' : 'large');
      if (!rendered && attempts < 10) {
        attempts += 1;
        retryTimer = setTimeout(setupGoogleButton, 300);
      }
    };

    setupGoogleButton();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [onLogin, onError]);

  return (
    <div
      id="google-login-button"
      className="flex justify-center w-full overflow-x-auto sm:overflow-visible"
      data-testid="google-login-button"
    />
  );
}
