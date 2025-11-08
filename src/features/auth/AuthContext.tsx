import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useState,

} from 'react';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, setCurrentUserId, setIsAdmin } from '@/lib/apiClient';



const AUTH_STORAGE_KEY = 'otpidentity_auth';



type StoredAuth = {

  isAuthenticated: boolean;

  user?: AuthUser;

};



export type AuthUser = {
  id?: string;
  name: string;
  email?: string;
  menus?: import('@/types/portal').PortalMenuDto[];
  token?: string;
  isAdmin?: boolean;
  dealerCode?: string | null;
};



type AuthContextValue = {

  isAuthenticated: boolean;

  user?: AuthUser;

  login: (payload?: { id?: string; email?: string; name?: string; menus?: import('@/types/portal').PortalMenuDto[]; token?: string; isAdmin?: boolean; dealerCode?: string | null }) => void;

  logout: () => void;

};



const AuthContext = createContext<AuthContextValue | undefined>(undefined);



const readStoredAuth = (): StoredAuth | undefined => {

  try {

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (raw) {

      return JSON.parse(raw) as StoredAuth;

    }

  } catch {

    // ignore JSON parse errors

  }

  return undefined;

};



const persistAuth = (state: StoredAuth) => {

  try {

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));

  } catch {

    // storage might be disabled

  }

};



const clearPersistedAuth = () => {

  try {

    localStorage.removeItem(AUTH_STORAGE_KEY);

  } catch {

    // ignore storage errors

  }

};



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const stored = readStoredAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(
    stored?.isAuthenticated ?? false,
  );

  const [user, setUser] = useState<AuthUser | undefined>(stored?.user);

  // Keep axios Authorization header in sync with current user token
  useEffect(() => {
    console.log('AuthContext: Setting token:', user?.token ? `Token exists (${user.token.substring(0, 20)}...)` : 'No token');
    console.log('AuthContext: User data:', {
      id: user?.id,
      name: user?.name,
      isAdmin: user?.isAdmin,
      dealerCode: user?.dealerCode,
      hasToken: !!user?.token,
      menusCount: user?.menus?.length ?? 0
    });
    setAuthToken(user?.token);
  }, [user?.token]);

  // Authorization devre dışıyken user ID'sini header'a set et
  useEffect(() => {
    console.log('AuthContext: Setting current user ID:', user?.id || 'No user ID');
    setCurrentUserId(user?.id);
  }, [user?.id]);

  // Authorization devre dışıyken admin bilgisini header'a set et
  useEffect(() => {
    console.log('AuthContext: Setting is admin:', user?.isAdmin || false);
    setIsAdmin(user?.isAdmin || false);
  }, [user?.isAdmin]);



  const login = useCallback((payload?: { id?: string; email?: string; name?: string; menus?: import('@/types/portal').PortalMenuDto[]; token?: string; isAdmin?: boolean; dealerCode?: string | null }) => {

    const nextUser: AuthUser = {
      id: payload?.id,
      name: payload?.name || 'OtpIdentity Y??neticisi',
      email: payload?.email,
      menus: payload?.menus,
      token: payload?.token,
      isAdmin: payload?.isAdmin,
      dealerCode: payload?.dealerCode,
    };

    setUser(nextUser);

    setIsAuthenticated(true);

    persistAuth({ isAuthenticated: true, user: nextUser });

  }, []);



  const logout = useCallback(() => {
    console.log('Logout işlemi başlatılıyor...');
    
    // Auth state'ini temizle
    setIsAuthenticated(false);
    setUser(undefined);
    clearPersistedAuth();
    
    // API client'taki token'ı, user ID'sini ve admin bilgisini temizle
    setAuthToken(undefined);
    setCurrentUserId(undefined);
    setIsAdmin(false);
    
    // Giriş sayfasına yönlendir
    navigate('/giris', { replace: true });
    
    console.log('Logout tamamlandı, giriş sayfasına yönlendirildi');
  }, [navigate]);



  const value = useMemo<AuthContextValue>(

    () => ({

      isAuthenticated,

      user,

      login,

      logout,

    }),

    [isAuthenticated, login, logout, user],

  );



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};



export const useAuth = () => {

  const ctx = useContext(AuthContext);

  if (!ctx) {

    throw new Error('useAuth must be used within AuthProvider');

  }

  return ctx;

};







