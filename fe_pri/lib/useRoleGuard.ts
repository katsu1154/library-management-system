'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const REDIRECT_MAP: Record<string, string> = {
  ROLE_ADMIN: '/admin',
  ROLE_LIBRARIAN: '/admin',
  ROLE_ACCOUNTANT: '/admin',
  ROLE_WAREHOUSE_MANAGER: '/admin',
  ROLE_HR: '/admin',
  ROLE_INTERNAL_READER: '/',
  ROLE_EXTERNAL_READER: '/',
};

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const role = user.roleName; 

    if (!allowedRoles.includes(role)) {
      console.warn(`Access denied for role: ${role}`);
      router.replace(REDIRECT_MAP[role] || '/');
    } else {
      setChecking(false);
    }
  }, [user, loading, allowedRoles, router]);

  return checking;
}