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
    // Initialize Google Auth
    initializeGoogleAuth(onLogin, onError);

    // Render the Google Sign-In button
    // We use a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      renderGoogleSignInButton('google-login-button', 'outline', 'large');
    }, 100);

    return () => clearTimeout(timer);
  }, [onLogin, onError]);

  return (
    <div
      id="google-login-button"
      className="flex justify-center"
      data-testid="google-login-button"
    />
  );
}
