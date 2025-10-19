import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, type ReactNode } from 'react';

import { useAuth } from '@/features/auth/AuthContext';
import { navigationItems } from '@/constants/navigation';
 

type NavigationMenuProps = {
  mode?: 'inline' | 'vertical';
  onNavigate?: () => void;
};

export const NavigationMenu = ({
  mode = 'inline',
  onNavigate,
}: NavigationMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  // Build a lookup map from code (lowercase) to navigation item
  const navByCode = useMemo(() => {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const dict = new Map<string, (typeof navigationItems)[number]>();
    for (const item of navigationItems) {
      dict.set(normalize(item.code), item);
    }
    return dict;
  }, []);

  

  const computedVisibleItems = useMemo(() => {
    const dbMenus = user?.menus ?? [];
    const seen = new Set<string>();
    const items: Array<{ key: string; label: string; path: string; icon?: ReactNode }> = [];
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const m of dbMenus) {
      const codeKey = normalize(m.menuCode || '');
      const nav = navByCode.get(codeKey);
      if (!nav) continue;
      if (seen.has(nav.key)) continue;
      seen.add(nav.key);
      items.push({ key: nav.key, label: nav.label, path: nav.path, icon: nav.icon as ReactNode });
    }
    // Dashboard en başta, Genel Ayarlar en altta olacak şekilde, sıralamayı güvenli biçimde uygula
    const dash = items.filter((i) => i.key === 'dashboard');
    const general = items.filter((i) => i.key === 'generalSettings');
    const middle = items.filter((i) => i.key !== 'dashboard' && i.key !== 'generalSettings');
    return [...dash, ...middle, ...general];
  }, [navByCode, user?.menus]);

  

  const selectedKey =
    computedVisibleItems.find((item) => item.path === location.pathname)?.key ??
    'dashboard';

  return (
    <Menu
      theme="dark"
      mode={mode}
      selectedKeys={[selectedKey]}
      style={{ borderRadius: 18, padding: '12px 8px', background: 'transparent' }}
      items={computedVisibleItems.map((item) => ({
        key: item.key,
        label: item.label,
        icon: item.icon,
        onClick: () => {
          navigate(item.path);
          onNavigate?.();
        },
      }))}
    />
  );
};



