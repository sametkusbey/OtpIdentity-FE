// import { Navigate, useLocation } from 'react-router-dom';
// import { useMemo, type ReactNode } from 'react';
// import { useAuth } from '@/features/auth/AuthContext';
import { type ReactNode } from 'react';

type RequireMenuProps = {
  code: string; // navigationItems.code ya da backend MenuCode ile eşleşir
  children: ReactNode;
};

// const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export const RequireMenu = ({ children }: RequireMenuProps) => {
  // Menu authorization geçici olarak devre dışı - tüm menüler erişilebilir
  // const { user } = useAuth();
  // const location = useLocation();

  // const hasPermission = useMemo(() => {
  //   const required = normalize(code);
  //   const granted = (user?.menus ?? []).some((m) => normalize(m.menuCode || '') === required);
  //   return granted;
  // }, [code, user?.menus]);

  // if (!hasPermission) {
  //   return <Navigate to="/403" replace state={{ from: location }} />;
  // }

  return <>{children}</>;
};

