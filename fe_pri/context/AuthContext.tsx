'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { tokenStore } from '@/lib/api';
import { authApi, profileApi } from '@/lib/auth';
import type { LoginResponse, UserProfile } from '@/lib/types';

export type AuthUser = UserProfile | null;

const USER_STORAGE_KEY = 'lms_user';

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  socialLogin: (provider: 'GOOGLE' | 'OFFICE365', token: string) => Promise<LoginResponse>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  mutate: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('AuthProvider chưa mount'); },
  socialLogin: async () => { throw new Error('AuthProvider chưa mount'); },
  logout: () => {},
  setUser: () => {},
  mutate: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    const rawUser =
      typeof window !== 'undefined'
        ? localStorage.getItem(USER_STORAGE_KEY)
        : null;

    if (token && rawUser) {
      try {
        setUserState(JSON.parse(rawUser));
      } catch {
        tokenStore.clear();
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const setUser = useCallback((u: AuthUser) => {
    setUserState(u);
    if (typeof window === 'undefined') return;
    if (u) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const loginRes = await authApi.login(email, password);
      tokenStore.set(loginRes.token);
      const profile = await profileApi.me();
      const enrichedProfile = {
        ...profile,
        accountId: profile.accountId ?? loginRes.id,
        avatarUrl: profile.avatarUrl ?? loginRes.avatarUrl,
        loginName: profile.email ?? profile.loginName ?? email,
      };
      setUser(enrichedProfile);
      return loginRes;
    },
    [setUser]
  );

  const socialLogin = useCallback(
    async (provider: 'GOOGLE' | 'OFFICE365', token: string): Promise<LoginResponse> => {
      const loginRes = await authApi.socialLogin({ provider, token });
      tokenStore.set(loginRes.token);
      const profile = await profileApi.me();
      const enrichedProfile = {
        ...profile,
        accountId: profile.accountId ?? loginRes.id,
        avatarUrl: profile.avatarUrl ?? loginRes.avatarUrl,
        loginName: profile.email ?? profile.loginName,
      };
      setUser(enrichedProfile);
      return loginRes;
    },
    [setUser]
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, [setUser]);

  const mutate = useCallback(async () => {
    try {
      const freshUser = await profileApi.me();
      setUser(freshUser);
    } catch (error) {
      console.error('Lỗi khi tải lại thông tin User:', error);
    }
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, socialLogin, logout, setUser, mutate }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);