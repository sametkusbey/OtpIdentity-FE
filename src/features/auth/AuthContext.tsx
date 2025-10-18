import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

const AUTH_STORAGE_KEY = 'otpidentity_auth';

type StoredAuth = {
  isAuthenticated: boolean;
  user?: AuthUser;
};

export type AuthUser = {
  name: string;
  email?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user?: AuthUser;
  login: (payload?: { email?: string; name?: string }) => void;
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
  const stored = readStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(
    stored?.isAuthenticated ?? false,
  );
  const [user, setUser] = useState<AuthUser | undefined>(stored?.user);

  const login = useCallback((payload?: { email?: string; name?: string }) => {
    const nextUser: AuthUser = {
      name: payload?.name || 'OtpIdentity Yöneticisi',
      email: payload?.email,
    };
    setUser(nextUser);
    setIsAuthenticated(true);
    persistAuth({ isAuthenticated: true, user: nextUser });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(undefined);
    clearPersistedAuth();
  }, []);

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

