'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function SocialAuthProvider({ children }: { children: ReactNode }) {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}