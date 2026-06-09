import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import SocialAuthProvider from '@/components/SocialAuthProvider';

export const metadata: Metadata = {
  title: 'TLU Library',
  description: 'Hệ thống quản lý thư viện',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <SocialAuthProvider>
          <AuthProvider>{children}</AuthProvider>
        </SocialAuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000, 
          }} 
        />
      </body>
    </html>
  );
}