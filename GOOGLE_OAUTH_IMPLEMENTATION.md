# Google OAuth 2.0 Implementation Guide - Lazy Notez

## Overview
This document outlines the implementation of "Login with Google" authentication for Lazy Notez using Google Identity Services (GIS) and OAuth 2.0.

## Files Modified/Created

### 1. **index.html** - Added Google Identity Services Script
- **Location**: `/index.html`
- **Change**: Added the Google Identity Services library in the `<head>` section
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 2. **src/utils/googleAuth.ts** - Google Authentication Utilities
- **Location**: `/src/utils/googleAuth.ts` (NEW FILE)
- **Purpose**: Core authentication logic module
- **Key Functions**:
  - `parseJWT(token)` - Decodes JWT token to extract user information
  - `storeUser(user)` - Stores user data in localStorage
  - `getStoredUser()` - Retrieves stored user data
  - `logout()` - Clears user authentication data
  - `handleGoogleCredentialResponse(response, onSuccess)` - Processes Google credential response
  - `initializeGoogleAuth(onSuccess, onError)` - Initializes Google OAuth
  - `renderGoogleSignInButton(elementId, theme, size)` - Renders the Google Sign-In button
  - `isUserLoggedIn()` - Checks if user is already authenticated

**Configuration**:
- Google Client ID: `702960286853-skkvdqed3ajop543nkjih3ubd345ct50.apps.googleusercontent.com`

### 3. **src/components/GoogleLoginButton.tsx** - Google Login Button Component
- **Location**: `/src/components/GoogleLoginButton.tsx` (NEW FILE)
- **Purpose**: React component for rendering the Google Sign-In button
- **Props**:
  - `onLogin: (userData: any) => void` - Callback when login succeeds
  - `onError?: (error: any) => void` - Optional error callback
- **Features**:
  - Initializes Google Auth on component mount
  - Renders the Google Sign-In button
  - Handles timing issues with DOM readiness

### 4. **src/pages/Auth.tsx** - Updated Authentication Page
- **Location**: `/src/pages/Auth.tsx`
- **Changes**:
  - Imported `GoogleLoginButton` component
  - Added Google Sign-In button between the Sign In/Register forms and "Continue as Guest"
  - Integrated Google login flow with app's navigation

### 5. **src/App.tsx** - Updated Main App Component
- **Location**: `/src/App.tsx`
- **Changes**:
  - Imported `getStoredUser` utility function
  - Enhanced useEffect to check for Google OAuth users on app initialization
  - Ensures proper user state persistence for both traditional and Google OAuth logins

## User Data Flow

### Google Login Process:
1. User clicks "Sign in with Google" button on Auth page
2. Google Sign-In dialog opens (handled by Google's library)
3. User authenticates with their Google account
4. Google returns a JWT credential token
5. JWT is decoded to extract user information (name, email, picture)
6. User data is stored in localStorage under:
   - `currentUser` - Primary user data store
   - `lazyNotezUser` - Secondary backup
7. User is redirected to `/dashboard`

### Data Stored:
```json
{
  "id": "user's Google ID (sub claim)",
  "name": "User's Full Name",
  "email": "user@example.com",
  "picture": "URL to profile picture",
  "token": "Google client ID",
  "loginMethod": "google"
}
```

## Security Considerations

1. **No Client Secret Exposed**: The implementation uses only the public Client ID
2. **JWT Validation**: Token is decoded and validated on the client side
3. **CORS Compliant**: Google Identity Services handles CORS properly
4. **Secure Storage**: User data stored in localStorage (accessible only from same origin)
5. **Domain Verification**: Ensure your deployment domain is authorized in Google Cloud Console

## Deployment on Netlify

### Prerequisites:
1. Ensure the site is served over HTTPS (Netlify provides this by default)
2. Add your Netlify domain to Google Cloud Console's authorized domains:
   - Go to Google Cloud Console > APIs & Services > OAuth 2.0 Client IDs
   - Edit the Lazy Notez client
   - Add authorized JavaScript origins and redirect URIs

### Example Authorized Domains:
- `https://lazy-notez.netlify.app`
- `https://your-custom-domain.com` (if using custom domain)
- `http://localhost:3000` (for local development)

## Testing the Implementation

### Local Testing:
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Navigate to http://localhost:5173 (or your vite dev port)
5. Click "Auth" or try to access protected routes
6. Test Google Sign-In button
7. Verify user data in localStorage (DevTools > Application > localStorage)

### Production Testing:
1. Deploy to Netlify
2. Visit https://lazy-notez.netlify.app
3. Test Google Sign-In functionality
4. Verify redirects to dashboard after login

## Browser Console Debugging

The implementation includes console logging for debugging:
- "Google Auth initialized successfully" - GIS is ready
- "Google Sign-In button rendered successfully" - Button is rendered
- "Google ID Token received: valid" - Token received
- "User Info from Google: [user data]" - User information extracted

## Logout Functionality

Users can logout using the `logout()` function from `googleAuth.ts`:
- Clears `currentUser` from localStorage
- Clears `lazyNotezUser` from localStorage
- Reloads the page to reset app state

## Limitations & Notes

1. **No Backend Integration**: This is a frontend-only implementation
2. **JWT Decoding**: Only extracts claims from JWT (no server-side verification)
3. **Token Refresh**: Google tokens are not refreshed; user sessions expire based on token lifetime
4. **User Data**: Only basic profile info (name, email, picture) is captured
5. **Development Domains**: localhost testing requires proper Google Cloud setup

## Future Enhancements

1. **Backend Integration**: Send JWT to backend for verification and user DB storage
2. **Token Refresh**: Implement Google token refresh mechanism
3. **User Profile**: Create user profiles with additional information
4. **Logout Confirmation**: Add logout confirmation dialog
5. **Social Linking**: Allow users to link Google account to existing accounts
6. **Two-Factor Authentication**: Integrate Google Authenticator support

## Troubleshooting

### Issue: "Google is not defined"
- **Cause**: Google Identity Services script not loaded or blocked
- **Solution**: Check browser console for CSP violations; ensure script tag is present in index.html

### Issue: Button not rendering
- **Cause**: Element with id "google-login-button" not found
- **Solution**: Ensure GoogleLoginButton component is mounted before trying to render

### Issue: CORS errors
- **Cause**: Domain not authorized in Google Cloud Console
- **Solution**: Add domain to authorized origins in Google Cloud Console

### Issue: Blank user data after login
- **Cause**: JWT decoding failed or claims not present
- **Solution**: Check JWT structure in DevTools; verify Google account has profile info

## Support & Documentation

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Standards](https://tools.ietf.org/html/rfc6749)
- [JWT Standards](https://tools.ietf.org/html/rfc7519)
- [Netlify Deployment Guide](https://docs.netlify.com/)
