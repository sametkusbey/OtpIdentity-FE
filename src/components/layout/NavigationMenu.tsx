import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const selectedKey =
    navigationItems.find((item) => item.path === location.pathname)?.key ??
    'dashboard';

  return (
    <Menu
      theme="dark"
      mode={mode}
      selectedKeys={[selectedKey]}
      style={{ borderRadius: 18, padding: '12px 8px', background: 'transparent' }}
      items={navigationItems.map((item) => ({
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
